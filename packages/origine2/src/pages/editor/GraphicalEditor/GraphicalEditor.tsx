import { useValue } from "../../../hooks/useValue";
import { parseScene } from "./parser";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useEffect } from "react";
import { WsUtil } from "../../../utils/wsUtil";
import { mergeToString, splitToArray } from "./utils/sceneTextProcessor";
import styles from "./graphicalEditor.module.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { sentenceEditorConfig, sentenceEditorDefault } from "./SentenceEditor";
import { DeleteFive, Sort, DownOne, RightOne } from "@icon-park/react";
import AddSentence, { addSentenceType } from "./components/AddSentence";
import useTrans from "@/hooks/useTrans";
import {editorLineHolder} from "@/runtime/WG_ORIGINE_RUNTIME";
import {eventBus} from "@/utils/eventBus";

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

export default function GraphicalEditor(props: IGraphicalEditorProps) {
  const t = useTrans("editor.graphical.buttons.");
  const sceneText = useValue("");
  const currentEditingGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const showSentence = useValue<Array<boolean>>([]);

  function updateScene() {
    const url = `/games/${currentEditingGame}/game/scene/${props.targetName}`;
    axios.get(url).then(res => res.data).then((data) => {
      sceneText.set(data.toString());
      eventBus.emit('update-scene',data.toString());
      const arr = splitToArray(sceneText.value);
      if(showSentence.value.length!==arr.length){
        showSentence.set(new Array(arr.length).fill(true));
      }
    });
  }

  useEffect(() => {
    updateScene();
  }, []);

  function submitSceneAndUpdate(newScene: string, index: number) {
    const updateIndex = index + 1;
    editorLineHolder.recordSceneEdittingLine(props.targetPath,updateIndex);
    sceneText.set(newScene);
    const params = new URLSearchParams();
    params.append("gameName", currentEditingGame);
    params.append("sceneName", props.targetName);
    params.append("sceneData", JSON.stringify({ value: sceneText.value }));
    axios.post("/api/manageGame/editScene/", params).then(() => {
      const targetValue = sceneText.value.split("\n")[updateIndex - 1];
      WsUtil.sendSyncCommand(props.targetName, updateIndex, targetValue);
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
    showSentenceList.splice(updateIndex,0,true);
    showSentence.set(showSentenceList);
  }

  function deleteOneSentence(index: number) {
    const arr = splitToArray(sceneText.value);
    arr.splice(index, 1);
    submitSceneAndUpdate(mergeToString(arr), index);
    const showSentenceList = [...showSentence.value];
    showSentenceList.splice(index,1);
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
    editorLineHolder.recordSceneEdittingLine(props.targetPath,result.destination.index);
    reorder(
      result.source.index,
      result.destination.index
    );
  }

  useEffect(() => {
    const targetLine = editorLineHolder.getSceneLine(props.targetPath);
    const scroolToFunc = ()=>{
      const targetBlock = document.querySelector(`.sentence-block-${targetLine}`);
      if(targetBlock){
        targetBlock?.scrollIntoView?.({behavior:'auto'});
      }else{
        console.log('Retry scroll to in 50ms');
        setTimeout(()=>scroolToFunc(),50);
      }
    };
    if(targetLine!==0){
      scroolToFunc();
    }
  }, []);

  const parsedScene = (sceneText.value === "" ? { sentenceList: [] } : parseScene(sceneText.value));
  return <div className={styles.main} id="graphical-editor-main">
    <div style={{ flex: 1 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
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
                return <Draggable key={sentence.content + sentence.commandRaw + i}
                  draggableId={sentence.content + sentence.commandRaw + i}  index={i}>
                  {(provided, snapshot) => (
                    <div className={`${styles.sentenceEditorWrapper} sentence-block-${index}`} key={sentence.commandRaw + sentence.content + i + 'inner'}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className={styles.lineNumber}><span style={{ padding: "0 6px 0 0" }}>{index}</span>
                        <Sort {...provided.dragHandleProps} style={{ padding: "5px 0 0 0" }} theme="outline" size="22"
                          strokeWidth={3}/>
                      </div>
                      <div className={styles.seArea}>
                        <div className={styles.head}>
                          <div className={styles.title}>
                            {sentenceConfig.title()}
                          </div>
                          <div className={styles.optionButton} style={{ margin: "0 0 0 auto" }}
                            onClick={() => changeShowSentence(i)}>
                            {showSentence.value[i]?
                              <DownOne strokeWidth={2} theme="outline" style={{ padding: "0px 2px 0 0" }}  size="18" fill="#333"/>:
                              <RightOne strokeWidth={2} theme="outline" style={{ padding: "0px 2px 0 0" }} size="18" fill="#333"/>}
                            <div>
                              {showSentence.value[i]?"折叠":"展开"}
                            </div>
                          </div>
                          <div className={styles.optionButton} style={{ margin: "0 4px 0 4px" }}
                            onClick={() => deleteOneSentence(i)}>
                            <DeleteFive strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="16"/>
                            <div>
                              {t("delete")}
                            </div>
                          </div>
                          <AddSentence titleText={t("addForward")} type={addSentenceType.forward}
                            onChoose={(newSentence) => addOneSentence(newSentence, i)} />
                        </div>
                        {showSentence.value[i] && <SentenceEditor sentence={sentence} onSubmit={(newSentence) => {
                          updateSentenceByIndex(newSentence, i);
                        }} />}
                      </div>
                    </div>
                  )}
                </Draggable>;
              })}
              {provided.placeholder}
              <div className={styles.addWrapper}>
                <AddSentence titleText={t("add")} type={addSentenceType.backward}
                  onChoose={(newSentence) => addOneSentence(newSentence, splitToArray(sceneText.value).length)} />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  </div>;
}
