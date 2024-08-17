import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import { api } from '@/api';
import { WsUtil } from '@/utils/wsUtil';

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

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  // 使用 useMemo 缓存 iframe 元素
  const memoizedIframe = useMemo(() => {
    return (
      <iframe
        ref={iframeRef}
        src="/monaco-iframe/monaco.html" // 确保路径正确
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        key={path} // 使用 path 作为 key
      />
    );
  }, [path]); // 只有当 path 变化时才会重新创建 iframe 元素

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'editorReady') {
        setEditorReady(true);
      } else if (event.data.type === 'valueChanged') {
        update(event.data.value);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [path]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !data || !editorReady) return;

    iframe.contentWindow?.postMessage({ type: 'setValue', value: data }, '*');
    iframe.contentWindow?.postMessage({ type: 'setLanguage', language: extName }, '*');
  }, [data, editorReady, extName]);

  return memoizedIframe;
}
