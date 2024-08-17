import useSWR from "swr";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {api} from "@/api";
import {eventBus} from "@/utils/eventBus";
import {editorLineHolder} from "@/runtime/WG_ORIGINE_RUNTIME";
import {useRef} from "react";
import * as monaco from "monaco-editor";

export function JsonResourceDisplay(props: { url: string }) {
  const {url} = props;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentText = {value: "Loading Data......"};

  function updateEditorData(){
    axios
      .get(url,{responseType:'text'})
      .then((res) => res.data)
      .then((data) => {
        // currentText.set(data);
        currentText.value = data;
        eventBus.emit('update-scene', data.toString());
        editorRef.current?.getModel()?.setValue(currentText.value);
      });
  }

  async function update(text:string){
    await api.manageGameControllerEditTextFile({textFile:text,path:url});
  }

  return <Editor height="100%" width="100%" onChange={(newValue) => {
    if(newValue){
      update(newValue);
    }
  }} defaultLanguage="json"
  language="json"
  onMount={(editor)=>{
    editorRef.current = editor;
    updateEditorData();
  }}
  defaultValue={currentText.value}
  />;
}
