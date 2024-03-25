import useSWR, { useSWRConfig } from "swr";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { api } from "@/api";

export default function TextEditor({ path }: { path: string }) {

  const { mutate } = useSWRConfig();
  const extName = path.split('.').pop() || '';

  const fileFetcher = async (path: string) => {
    const res = await axios.get(path, { responseType: 'text', transformResponse: [(data) => data] });
    return res.data;
  };

  const { data } = useSWR(path, fileFetcher);

  const update = async (text: string) => {
    await api.assetsControllerEditTextFile({ textFile: text, path: path });
    mutate(path);
  };

  return (
    <Editor
      height="100%"
      width="100%"
      onChange={(newValue) => newValue && update(newValue)}
      defaultLanguage={extName}
      value={data}
    />
  );
}
