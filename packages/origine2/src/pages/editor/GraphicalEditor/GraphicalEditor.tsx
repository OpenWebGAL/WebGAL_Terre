import { useValue } from "../../../hooks/useValue";
import { parseScene } from "./parser";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { WsUtil } from "../../../utils/wsUtil";
import { mergeToString, splitToArray } from "./utils/sceneTextProcessor";
import styles from "./graphicalEditor.module.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { sentenceEditorConfig, sentenceEditorDefault } from "./SentenceEditor";
import { DeleteFive, Sort, DownOne, RightOne, Play } from "@icon-park/react";
import AddSentence, { addSentenceType } from "./components/AddSentence";
import { editorLineHolder } from "@/runtime/WG_ORIGINE_RUNTIME";
import { eventBus } from "@/utils/eventBus";
import { t } from "@lingui/macro";
import { api } from "@/api";

import type { DropResult } from 'react-beautiful-dnd';

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

interface SentenceItem {
  id: string;
  content: string;
  show: boolean;
}

export default function GraphicalEditor(props: IGraphicalEditorProps) {
  const sentenceData = useValue<SentenceItem[]>([]);

  const generateSentenceItem = (content: string): SentenceItem => ({
    id: crypto.randomUUID(),
    content,
    show: true,
  });

  function fetchScene() {
    const processFetchedData = (data: object) => {
      const text = data.toString();
      const newContents = splitToArray(text);
      const currentSentences = sentenceData.value;

      const newSentences = newContents.map((content, i) => {
        const existing = currentSentences[i];
        return existing && existing.content === content
          ? existing
          : {
            id: crypto.randomUUID(),
            content,
            show: existing?.show ?? true
          };
      });

      sentenceData.set(newSentences);
      eventBus.emit('editor:update-scene', { scene: text });
    };

    axios.get(props.targetPath)
      .then(res => res.data)
      .then(processFetchedData);
  }

  useEffect(() => {
    fetchScene();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchScene();
      }
    };

    window.addEventListener('focus', fetchScene);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', fetchScene);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function submitScene(newSentences: SentenceItem[], index: number) {
    const newScene = mergeToString(newSentences.map(item => item.content));
    const updateIndex = index + 1;
    editorLineHolder.recordSceneEditingLine(props.targetPath, updateIndex);

    api.assetsControllerEditTextFile({
      textFile: newScene,
      path: props.targetPath
    }).then(() => {
      const targetValue = newSentences[index].content;
      WsUtil.sendSyncCommand(props.targetPath, updateIndex, targetValue);
      fetchScene();
    });
  }

  function updateSentenceByIndex(newContent: string, updateIndex: number) {
    const newSentences = [...sentenceData.value];
    newSentences[updateIndex] = { ...newSentences[updateIndex], content: newContent };
    sentenceData.set(newSentences);
    submitScene(newSentences, updateIndex);
  }

  function addOneSentence(newContent: string, insertIndex: number) {
    const newSentence = generateSentenceItem(newContent);
    const newSentences = [...sentenceData.value];
    newSentences.splice(insertIndex, 0, newSentence);
    sentenceData.set(newSentences);
    submitScene(newSentences, insertIndex);
  }

  function deleteOneSentence(index: number) {
    const newSentences = [...sentenceData.value];
    newSentences.splice(index, 1);
    sentenceData.set(newSentences);
    submitScene(newSentences, Math.min(index, newSentences.length - 1));
  }

  function changeShowSentence(index: number) {
    const newSentences = [...sentenceData.value];
    newSentences[index] = { ...newSentences[index], show: !newSentences[index].show };
    sentenceData.set(newSentences);
  }

  // 重新记录数组顺序
  const reorder = (startIndex: number, endIndex: number) => {
    const newSentences = [...sentenceData.value];
    const [removed] = newSentences.splice(startIndex, 1);
    newSentences.splice(endIndex, 0, removed);
    sentenceData.set(newSentences);
    submitScene(newSentences, endIndex);
  };

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    editorLineHolder.recordSceneEditingLine(props.targetPath, result.destination.index);
    reorder(
      result.source.index,
      result.destination.index
    );
  }

  function syncToIndex(index: number) {
    const targetValue = sentenceData.value[index]?.content || "";
    WsUtil.sendSyncCommand(props.targetPath, index + 1, targetValue, true);
    editorLineHolder.recordSceneEditingLine(props.targetPath, index + 1);
    // 传递假消息，为了在不使用此功能的时候清除拖拽框
    eventBus.emit('editor:pixi-sync-command', {
      targetPath: '',
      lineNumber: 1,
      lineContent: ""
    });
  }

  useEffect(() => {
    const targetLine = editorLineHolder.getSceneLine(props.targetPath);
    const scrollToFunc = () => {
      const targetBlock = document.querySelector(`.sentence-block-${targetLine}`);
      if (targetBlock) {
        targetBlock?.scrollIntoView?.({ behavior: 'auto' });
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
    addOneSentence(sentence, sentenceData.value.length);
  }

  function handleAdd({ sentence } : { sentence: string }) {
    addNewSentenceAttach(sentence);
  }

  useEffect(() => {
    eventBus.on('editor:topbar-add-sentence', handleAdd);
    return () => {
      eventBus.off('editor:topbar-add-sentence', handleAdd);
    };
  }, [sentenceData.value]);

  const mergedSceneText = useMemo(() => mergeToString(sentenceData.value.map(item => item.content)), [sentenceData.value]);

  const parsedScene = mergedSceneText === "" ? { sentenceList: [] } : parseScene(mergedSceneText);

  useEffect(() => {
    const handleDragUpdate = (data: any) => {
      fetchScene();
      WsUtil.sendSyncCommand(data.targetPath, data.lineNumber, data.newCommand);
    };
    eventBus.on('editor:drag-update-scene', handleDragUpdate);
    return () => {
      eventBus.off('editor:drag-update-scene', handleDragUpdate);
    };
  }, []);
  return <div className={styles.main} id="graphical-editor-main">
    <div style={{ flex: 1, padding: '14px 4px 0 4px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            // 下面开始书写容器
            <div style={{ height: "100%" }}
              // provided.droppableProps应用的相同元素.
              {...provided.droppableProps}
              // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
              ref={provided.innerRef}
            >
              {parsedScene.sentenceList.map((sentence, i) => {
                // 实际显示的行数
                const index = i + 1;
                // console.log(sentence.command);
                const sentenceConfig = sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
                const SentenceEditor = sentenceConfig.component;
                const sentenceItem = sentenceData.value[i];
                return <Draggable key={sentenceItem.id} draggableId={sentenceItem.id} index={i}>
                  {(provided) => (
                    <div className={`${styles.sentenceEditorWrapper} sentence-block-${index}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className={styles.addForwardArea}>
                        <div className={styles.addForwardAreaButtonGroup}>
                          <div className={styles.addForwardAreaButton}>
                            <AddSentence titleText={t`本句前插入句子`} type={addSentenceType.forward}
                              onChoose={(newSentence) => addOneSentence(newSentence, i)} />
                          </div>
                        </div>
                      </div>
                      <div className={styles.sentenceEditorContent}>
                        <div className={styles.lineNumber}><span style={{ padding: "0 6px 0 0" }}>{index}</span>
                          <Sort {...provided.dragHandleProps} style={{ padding: "5px 0 0 0" }} theme="outline" size="22"
                            strokeWidth={3} />
                        </div>
                        <div className={styles.seArea}>
                          <div className={styles.head}>
                            <div className={styles.title}>
                              {sentenceConfig.title()}
                            </div>
                            <div className={styles.optionButton}
                              onClick={() => changeShowSentence(i)}>
                              {sentenceItem.show ?
                                <DownOne strokeWidth={3} theme="outline" size="18"
                                  fill="#005CAF" /> :
                                <RightOne strokeWidth={3} theme="outline" size="18"
                                  fill="#005CAF" />}
                            </div>
                            <div className={styles.optionButtonContainer}>
                              <div className={styles.optionButton}
                                onClick={() => deleteOneSentence(i)}>
                                <DeleteFive strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="14"
                                  fill="var(--text)" />
                                <div>
                                  {t`删除本句`}
                                </div>
                              </div>
                              <div className={styles.optionButton}
                                onClick={() => syncToIndex(i)}>
                                <Play strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="14"
                                  fill="var(--text)" />
                                <div>
                                  {t`执行到此句`}
                                </div>
                              </div>
                            </div>
                          </div>
                          {sentenceItem.show && <SentenceEditor sentence={sentence} index={index} onSubmit={(newSentence) => {
                            updateSentenceByIndex(newSentence, i);
                          }} targetPath={props.targetPath} />}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>;
              })}
              {provided.placeholder}
              <div className={styles.addWrapper}>
                <AddSentence titleText={t`添加语句`} type={addSentenceType.backward}
                  onChoose={(newSentence) => addOneSentence(newSentence, sentenceData.value.length)} />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  </div>;
}
