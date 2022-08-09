import * as monaco from "monaco-editor";
import Editor, { loader, Monaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import styles from "./textEditor.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useValue } from "../../../hooks/useValue";
import axios from "axios";
import { logger } from "../../../utils/logger";

interface ITextEditorProps {
  targetPath: string;
}

export default function TextEditor(props: ITextEditorProps) {
  const target = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tags = useSelector((state:RootState)=>state.status.editor.tags);
  const currentEditingGame = useSelector((state:RootState)=>state.status.editor.currentEditingGame);
  // const currentText = useValue<string>("Loading Scene Data......");
  const currentText = { value: "Loading Scene Data......" };

  function checkJumpStatus(targetNumber: number) {
    const text = currentText.value;
    const validLines = text
      .replaceAll(/[\r\n]/g, "\n")
      .split("\n")
      .filter(e => e !== "");
    const validLineNumber = validLines.length;
    return targetNumber <= validLineNumber;
  }

  // 准备获取 Monaco
  // 建立 Ref
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  loader.config({ monaco });

  /**
   * 处理挂载事件
   * @param {any} editor
   * @param {any} monaco
   */
  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    logger.debug('编辑器挂载');
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((event) => {
      const lineNumber = event.position.lineNumber;
      const sceneName = tags.find((e) => e.tagTarget === target)!.tagName;
      console.log('场景名称'+sceneName);
      // @ts-ignore
      if (window["currentWs"] && checkJumpStatus(lineNumber)) { // @ts-ignore
        window["currentWs"].send(`jmp ${sceneName} ${lineNumber}`);
      }
    });
  }

  /**
   * handle monaco change
   * @param {string} value
   * @param {any} ev
   */
  function handleChange(value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) {
    logger.debug('编辑器提交更新');
    const lineNumber = ev.changes[0].range.startLineNumber;
    const gameName = currentEditingGame;
    const sceneName = tags.find((e) => e.tagTarget === target)!.tagName;
    if (value)
      currentText.value = value;
    const params = new URLSearchParams();
    params.append("gameName", gameName);
    params.append("sceneName", sceneName);
    params.append("sceneData", JSON.stringify({ value: currentText.value }));
    axios.post("/api/manageGame/editScene/", params).then((res) => {
      // console.log(res);
      // @ts-ignore
      if (window["currentWs"] && checkJumpStatus(lineNumber)) { // @ts-ignore
        window["currentWs"].send(`jmp ${sceneName} ${lineNumber}`);
      }
    });
  }

  function updateEditData() {
    const currentEditName = tags.find((e) => e.tagTarget === target)!.tagName;
    const url = `/games/${currentEditingGame}/game/scene/${currentEditName}`;
    axios.get(url).then(res => res.data).then((data) => {
      // currentText.set(data);
      currentText.value = data;
      editorRef.current!.getModel()!.setValue(currentText.value);
    });
  }

  useEffect(() => {
    updateEditData();
    return ()=>{

    };
  });

  return <div className={styles.textEditor_main}>
    <Editor key={target} height="100%" onMount={handleEditorDidMount} onChange={handleChange} defaultLanguage="abap"
      defaultValue={currentText.value}
    />
  </div>;
}
