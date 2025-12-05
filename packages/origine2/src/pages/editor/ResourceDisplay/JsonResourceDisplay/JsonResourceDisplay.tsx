import React, {useEffect, useMemo, useRef, useState} from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { api } from '@/api';
import useEditorStore from '@/store/useEditorStore';

export function JsonResourceDisplay(props: { url: string }) {
  const { url } = props;
  const fileResp = useSWR(`json-${url}`, async () => {
    const resp = await axios.get(url, { responseType: 'text', transformResponse: [(data) => data] });
    return resp.data as string;
  });

  const isDarkMode = useEditorStore.use.isDarkMode();

  async function update(text: string) {
    await api.manageGameControllerEditTextFile({ textFile: text, path: url });
    fileResp.mutate();
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  // 使用 useMemo 缓存 iframe 元素
  const memoizedIframe = useMemo(() => {
    return (
      // eslint-disable-next-line react/iframe-missing-sandbox
      <iframe
        ref={iframeRef}
        src="/monaco-iframe/monaco.html"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        key={url} // 仍然保留 key 属性
      />
    );
  }, [url]); // 只有当 url 变化时才会重新创建 iframe 元素

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
  }, [url]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !fileResp.data || !editorReady) return;

    iframe.contentWindow?.postMessage({ type: 'setValue', value: fileResp.data }, '*');
    iframe.contentWindow?.postMessage({ type: 'setLanguage', language: 'json' }, '*');
    iframe.contentWindow?.postMessage({ type: 'setTheme', theme: isDarkMode ? 'vs-dark' : 'vs' }, '*');
  }, [fileResp.data, editorReady, isDarkMode]);

  // 返回缓存的 iframe 元素
  return memoizedIframe;
}
