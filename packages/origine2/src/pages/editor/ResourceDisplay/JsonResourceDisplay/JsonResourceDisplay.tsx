import useSWR from "swr";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {api} from "@/api";

export function JsonResourceDisplay(props: { url: string }) {
  const {url} = props;
  const fileResp = useSWR(`json-${url}`, async () => {
    const resp = await axios.get(url, {responseType: 'text', transformResponse: [(data) => data]});
    return resp.data as string;
  });

  async function update(text:string){
    await api.manageGameControllerEditTextFile({textFile:text,path:url});
    fileResp.mutate();
  }

  return <Editor height="100%" width="100%" onChange={(newValue) => {
    if(newValue){
      update(newValue);
    }
  }} defaultLanguage="json"
  language="json"
  value={fileResp.data}
  />;
}
