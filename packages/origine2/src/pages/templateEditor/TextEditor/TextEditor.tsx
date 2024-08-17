import useSWR, { useSWRConfig } from "swr";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { api } from "@/api";
import {WsUtil} from "@/utils/wsUtil";
import {eventBus} from "@/utils/eventBus";
import {useRef} from "react";
import * as monaco from "monaco-editor";

export default function TextEditor({ path }: { path: string }) {

  const { mutate } = useSWRConfig();
  const extName = path.split('.').pop() || '';
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentText = {value: "Loading Data......"};

  function updateEditorData(){
    axios
      .get(path,{responseType:'text'})
      .then((res) => res.data)
      .then((data) => {
        // currentText.set(data);
        currentText.value = data;
        eventBus.emit('update-scene', data.toString());
        editorRef.current?.getModel()?.setValue(currentText.value);
      });
  }

  const update = async (text: string) => {
    await api.assetsControllerEditTextFile({ textFile: text, path: path });
    await mutate(path);
    WsUtil.sendTemplateRefetchCommand();
  };

  return (
    <Editor
      height="100%"
      width="100%"
      onChange={(newValue) => newValue && update(newValue)}
      defaultLanguage={extName}
      onMount={(editor)=>{
        editorRef.current = editor;
        updateEditorData();
      }}
      defaultValue={currentText.value}
    />
  );
}
