import {useValue} from "../../../hooks/useValue";
import {parseScene} from "./parser";
import axios from "axios";
import React, {useEffect, useRef} from "react";
import {WsUtil} from "../../../utils/wsUtil";
import {mergeToString, splitToArray} from "./utils/sceneTextProcessor";
import styles from "./graphicalEditor.module.scss";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {sentenceEditorConfig, sentenceEditorDefault} from "./SentenceEditor";
import {DeleteFive, DownOne, Play, RightOne, Sort} from "@icon-park/react";
import {AddSentence, AddSentenceMethods, addSentenceType} from "./components/AddSentence";
import {editorLineHolder} from "@/runtime/WG_ORIGINE_RUNTIME";
import {eventBus} from "@/utils/eventBus";
import useEditorStore from "@/store/useEditorStore";
import {t} from "@lingui/macro";
import {api} from "@/api";
import {SentenceActionType, SentenceLayerType} from "@/types/editor";

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

export function shortCutParse(e: React.KeyboardEvent<any>){
  const keysPressed: string[] = [];
  if (e.ctrlKey) keysPressed.push('Ctrl');
  if (e.shiftKey) keysPressed.push('Shift');
  if (e.altKey) keysPressed.push('Alt');
  if (e.key) keysPressed.push(e.key);
  return keysPressed.join('+');
}

export default function GraphicalEditor(props: IGraphicalEditorProps) {

  // Sentence 的标签 统一为 Index [0, )

  const sceneText = useValue("");
  const gameName = useEditorStore.use.subPage();
  const sentenceActionShortCutConfig = useEditorStore.use.sentenceShortCuts();
  const showSentence = useValue<Array<boolean>>([]);
  const addSentenceRef = useRef<AddSentenceMethods | null>(null);
  const selectorSentenceIndex = useValue(0);
  const parsedScene =
    (sceneText.value === "" ? {sentenceList: []} : parseScene(sceneText.value));
  const clipboardSentence = useValue<string>("");

  const sentenceShortCutActionMap: Map<SentenceActionType, (index: number) => void> = new Map([
    [SentenceActionType.run_sentence, (index: number) => {
      syncToIndex(index);
    }],
    [SentenceActionType.insert_sentence, (index: number) => {
      selectorSentenceIndex.set(index + 1);
      addSentenceRef.current?.showUp();
    }],
    [SentenceActionType.warp_with_up, (index: number) => {
      if (index !== 0) {
        reorder(index, index - 1);
        focusOnSentence(index - 1);
      }
    }],
    [SentenceActionType.warp_with_down, (index: number) => {
      if (index !== parsedScene.sentenceList.length - 1) {
        reorder(index - 1, index);
        focusOnSentence(index + 1);
      }
    }],
    [SentenceActionType.move_to_up, (index: number) => {if (index !== 0) focusOnSentence(index - 1);}],
    [SentenceActionType.move_to_down,
      (index: number) => {if (index !== parsedScene.sentenceList.length - 1) focusOnSentence(index + 1);}
    ],
    [SentenceActionType.copy_sentence, (index: number) => clipboardSentence.set(splitToArray(sceneText.value)[index])],
    [SentenceActionType.paste_sentence, (index: number) => {
      if (clipboardSentence.value !== "") {
        addOneSentence(clipboardSentence.value, index + 1);
      }
    }],
    [SentenceActionType.move_to_down_or_insert, (index: number) => {
      if (index !== parsedScene.sentenceList.length - 1) focusOnSentence(index + 1);
      else {
        selectorSentenceIndex.set(index + 1);
        addSentenceRef.current?.showUp();
      }
    }],
    [SentenceActionType.delete_sentence, (index: number) => {
      deleteOneSentence(index - 1);
    }],
    [SentenceActionType.copy_sentence_and_insert, (index: number) => {
      const copy_sentence = splitToArray(sceneText.value)[index];
      addOneSentence(copy_sentence, index + 1);
    }]
  ]);

  const sentenceShortCutHandle =
  (e: React.KeyboardEvent<HTMLDivElement>, layer: SentenceLayerType,
    index: number) => {
    const keyCombined = shortCutParse(e);
    // console.debug(keyCombined);
    const config = sentenceActionShortCutConfig.find(
      (config) =>
        (config.shortcuts.toLowerCase() === keyCombined.toLowerCase()));
    let action: any;
    if (config) {
      // console.debug(config);
      if (config.layers.includes(layer)) action = config.action;
      // 如果Sentence Inner没有快捷键但Outer有，则
      else if (layer === SentenceLayerType.INNER && config.layers.includes(SentenceLayerType.OUTER)) {
        e.stopPropagation(); // 阻止向Outer传递
      }
    }
    if (action !== undefined) {
      sentenceShortCutActionMap.get(action)?.apply(index, [index]);
      e.preventDefault();
      e.stopPropagation();
    }

  };

  function updateScene() {
    const path = props.targetPath;
    axios.get(path).then(res => res.data).then((data) => {
      sceneText.set(data.toString());
      eventBus.emit('update-scene', data.toString());
      const arr = splitToArray(sceneText.value);
      if (showSentence.value.length !== arr.length) {
        showSentence.set(new Array(arr.length).fill(true));
      }
    });
  }

  useEffect(() => {
    updateScene();
  }, []);

  function submitSceneAndUpdate(newScene: string, index: number) {
    editorLineHolder.recordSceneEdittingLine(props.targetPath, index);
    sceneText.set(newScene);
    const params = new URLSearchParams();
    params.append("gameName", gameName);
    params.append("sceneName", props.targetName);
    params.append("sceneData", JSON.stringify({value: sceneText.value}));
    api.assetsControllerEditTextFile({textFile: newScene, path: props.targetPath}).then(() => {
      const targetValue = sceneText.value.split("\n")[index];
      WsUtil.sendSyncCommand(props.targetPath, index + 1, targetValue);
      updateScene();
    });
  }

  function updateSentenceByIndex(newSentence: string, updateIndex: number) {
    const arr = splitToArray(sceneText.value);
    arr[updateIndex] = newSentence;
    submitSceneAndUpdate(mergeToString(arr), updateIndex);
  }

  function addOneSentence(newSentence: string, updateIndex: number) {
    const arr = sceneText.value === "" ? [] : splitToArray(sceneText.value);
    arr.splice(updateIndex, 0, newSentence);
    submitSceneAndUpdate(mergeToString(arr), updateIndex);
    const showSentenceList = [...showSentence.value];
    showSentenceList.splice(updateIndex, 0, true);
    showSentence.set(showSentenceList);
    focusOnSentence(updateIndex);
  }

  function deleteOneSentence(index: number) {
    const arr = splitToArray(sceneText.value);
    arr.splice(index, 1);
    submitSceneAndUpdate(mergeToString(arr), index);
    const showSentenceList = [...showSentence.value];
    showSentenceList.splice(index, 1);
    showSentence.set(showSentenceList);
  }

  function changeShowSentence(index: number) {
    const showSentenceList = [...showSentence.value];
    showSentenceList[index] = !showSentenceList[index];
    showSentence.set(showSentenceList);
  }

  // 重新记录数组顺序
  const reorder = (startIndex: number, endIndex: number) => {
    const result = splitToArray(sceneText.value);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    submitSceneAndUpdate(mergeToString(result), endIndex);
  };

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }
    editorLineHolder.recordSceneEdittingLine(props.targetPath, result.destination.index);
    reorder(
      result.source.index,
      result.destination.index
    );
  }

  function focusOnSentence(targetIndex: number, delay?: number) {
    const delay_time = (delay === undefined) ? 100 : delay;
    const focusFunction = (targetBlock: HTMLDivElement) => {
      targetBlock.focus();
      targetBlock.scrollIntoView?.({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
      console.debug("focusOnSentence", targetIndex);
    };
    setTimeout(() => {
      const targetBlock: HTMLDivElement | null = document.querySelector(`.sentence-editor-block-${targetIndex}`);
      if (targetBlock) {
        focusFunction(targetBlock);
      }
      else {
        setTimeout(focusFunction, 100);
      }
    }, delay_time);
  }

  useEffect(() => {
    const targetLine = editorLineHolder.getSceneLine(props.targetPath);
    const scrollToFunc = () => {
      console.debug("scrollToFunc", targetLine);
      const targetBlock = document.querySelector(`.sentence-editor-block-${targetLine}`);
      if (targetBlock) {
        targetBlock?.scrollIntoView?.({behavior: 'auto'});
      } else {
        console.log('Retry scroll to in 50ms');
        setTimeout(() => scrollToFunc(), 50);
      }
    };
    if (targetLine > 3) {
      scrollToFunc();
    }
  }, []);

  function addNewSentenceAttach(sentence: string) {
    addOneSentence(sentence, splitToArray(sceneText.value).length);
  }

  function handleAdd(sentence: string) {
    addNewSentenceAttach(sentence);
  }

  function syncToIndex(index: number) {
    const targetValue = sceneText.value.split("\n")[index];
    WsUtil.sendSyncCommand(props.targetPath, index + 1, targetValue,true);
  }

  useEffect(() => {
    // @ts-ignore
    eventBus.on('topbar-add-sentence', handleAdd);
    return () => {
      // @ts-ignore
      eventBus.off('topbar-add-sentence', handleAdd);
    };
  }, [sceneText.value]);

  return <div className={styles.main} id="graphical-editor-main">
    <div style={{flex: 1, padding: '14px 4px 0 4px'}}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            // 下面开始书写容器
            <div style={{height: "100%"}}
              // provided.droppableProps应用的相同元素.
              {...provided.droppableProps}
              // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
              ref={provided.innerRef}
            >
              {parsedScene.sentenceList.map((sentence, i) => {
                // console.log(sentence.command);
                const sentenceConfig = sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
                const SentenceEditor = sentenceConfig.component;
                return <Draggable key={'sentence-draggable-' + i + '-outer'}
                  draggableId={sentence.content + sentence.commandRaw + i} index={i}>
                  {(provided, snapshot) => (
                    <div className={`${styles.sentenceEditorWrapper} sentence-block-${i}`}
                      key={`sentence-block-div-${sentence.content}-${i}-outer`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      // Sentence Outer
                      onKeyDown={(e) => {sentenceShortCutHandle(e, SentenceLayerType.OUTER, i);}}
                    >
                      {/* sharing add sentence component */}
                      <div style={{display: "none"}}>
                        <AddSentence titleText={t`本句后插入句子`} type={addSentenceType.backward}
                          onChoose={(newSentence) => {
                            if (newSentence && selectorSentenceIndex.value !== 0) {
                              addOneSentence(newSentence, selectorSentenceIndex.value);
                              selectorSentenceIndex.set(-1);
                            }
                          }}
                          ref={(ref) => {
                            addSentenceRef.current = ref;
                          }}
                        />
                      </div>
                      <div className={styles.addForwardArea}>
                        <div className={styles.addForwardAreaButtonGroup}>
                          <div className={styles.addForwardAreaButton}>
                            <AddSentence titleText={t`本句前插入句子`} type={addSentenceType.forward}
                              onChoose={(newSentence: string) => addOneSentence(newSentence, i)}/>
                          </div>
                        </div>
                      </div>
                      <div className={`${styles.sentenceEditorContent} sentence-editor-block-${i}`} tabIndex={0}>
                        <div className={styles.lineNumber}><span style={{padding: "0 6px 0 0"}}>{i + 1}</span>
                          <Sort {...provided.dragHandleProps} style={{padding: "5px 0 0 0"}} theme="outline" size="22"
                            strokeWidth={3} tabIndex={-1}/>
                        </div>
                        <div className={styles.seArea}
                          // Sentence Inner
                          onKeyDown={(e) => {sentenceShortCutHandle(e, SentenceLayerType.INNER, i);}}>
                          <div className={styles.head}>
                            <div className={styles.title}>
                              {sentenceConfig.title()}
                            </div>
                            <div className={styles.optionButton}
                              onClick={() => changeShowSentence(i)}>
                              {showSentence.value[i] ?
                                <DownOne strokeWidth={3} theme="outline" size="18"
                                  fill="#005CAF"/> :
                                <RightOne strokeWidth={3} theme="outline" size="18"
                                  fill="#005CAF"/>}
                            </div>
                            <div className={styles.optionButtonContainer}>
                              <div className={styles.optionButton}
                                onClick={() => deleteOneSentence(i)}>
                                <DeleteFive strokeWidth={3} style={{padding: "2px 4px 0 0"}} theme="outline" size="14"
                                  fill="#333"/>
                                <div>
                                  {t`删除本句`}
                                </div>
                              </div>
                              <div className={styles.optionButton}
                                onClick={() => syncToIndex(i)}>
                                <Play strokeWidth={3} style={{padding: "2px 4px 0 0"}} theme="outline" size="14"
                                  fill="#333"/>
                                <div>
                                  {t`执行到此句`}
                                </div>
                              </div>
                            </div>
                          </div>
                          {showSentence.value[i] && <SentenceEditor sentence={sentence} index={i + 1} onSubmit={(newSentence) => {
                            updateSentenceByIndex(newSentence, i);
                          }}/>}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>;
              })}
              {provided.placeholder}
              <div className={styles.addWrapper}>
                <AddSentence titleText={t`添加语句`} type={addSentenceType.backward}
                  onChoose={(newSentence: string) => addOneSentence(newSentence, splitToArray(sceneText.value).length)}/>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  </div>;
}
