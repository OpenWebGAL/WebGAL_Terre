import { useValue } from "../../../hooks/useValue";
import { parseScene } from "./parser";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useEffect } from "react";
import { sentenceEditorConfig } from "./SentenceEditor";
import { WsUtil } from "../../../utils/wsUtil";
import { mergeToString, splitToArray } from "./utils/sceneTextProcessor";
import Template from "./SentenceEditor/Template";

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
      sceneText.set(data);
    });
  }

  useEffect(() => {
    updateScene();
  }, []);

  function submitSceneAndUpdate(newScene: string, updateIndex: number) {
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
  const sentenceEditorList = parsedScene.sentenceList.map((sentence, index) => {
    const SentenceEditor = sentenceEditorConfig.find((e) => e.type === sentence.command)?.component ?? Template;
    return <SentenceEditor key={sentence.commandRaw + sentence.content} sentence={sentence} onSubmit={(newSentence) => {
      updateSentenceByIndex(newSentence, index);
    }} />;
  });
  return <div>{sentenceEditorList}</div>;
}
