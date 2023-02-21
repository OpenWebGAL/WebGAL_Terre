import { useValue } from "../../../hooks/useValue";
import { parseScene } from "./parser";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useEffect } from "react";
import { sentenceEditorConfig, sentenceEditorDefault } from "./SentenceEditor";
import { WsUtil } from "../../../utils/wsUtil";
import { mergeToString, splitToArray } from "./utils/sceneTextProcessor";
import styles from "./graphicalEditor.module.scss";

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

export default function GraphicalEditor(props: IGraphicalEditorProps) {
  const sceneText = useValue("");
  const currentEditingGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  function updateScene() {
    const url = `/games/${currentEditingGame}/game/scene/${props.targetName}`;
    axios.get(url).then(res => res.data).then((data) => {
      sceneText.set(data.toString());
    });
  }

  useEffect(() => {
    updateScene();
  }, []);

  function submitSceneAndUpdate(newScene: string, index: number) {
    const updateIndex = index + 1;
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
    const arr = splitToArray(sceneText.value);
    arr.splice(updateIndex, 0, newSentence);
    submitSceneAndUpdate(mergeToString(arr), updateIndex);
  }

  function deleteOneSentence(index: number) {
    const arr = splitToArray(sceneText.value);
    arr.splice(index, 1);
    submitSceneAndUpdate(mergeToString(arr), index);
  }

  const parsedScene = parseScene(sceneText.value);
  const sentenceEditorList = parsedScene.sentenceList.map((sentence, i) => {
    // 实际显示的行数
    const index = i + 1;
    const sentenceConfig = sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
    const SentenceEditor = sentenceConfig.component;
    return <div className={styles.sentenceEditorWrapper} key={sentence.commandRaw + sentence.content}>
      <div className={styles.lineNumber}>{index}</div>
      <div className={styles.seArea}>
        <div className={styles.head}>
          <div className={styles.title}>
            {sentenceConfig.title}
          </div>
          <div className={styles.optionButton} style={{ margin: "0 0 0 auto" }}>
            删除本句
          </div>
          <div className={styles.optionButton}>
            上移本句
          </div>
          <div className={styles.optionButton}>
            下移本句
          </div>
          <div className={styles.optionButton}>
            本句前插入句子
          </div>
          <div className={styles.optionButton}>
            本句后插入句子
          </div>
        </div>
        <SentenceEditor sentence={sentence} onSubmit={(newSentence) => {
          updateSentenceByIndex(newSentence, i);
        }} />
      </div>
    </div>;
  });
  return <div className={styles.main}>{sentenceEditorList}</div>;
}
