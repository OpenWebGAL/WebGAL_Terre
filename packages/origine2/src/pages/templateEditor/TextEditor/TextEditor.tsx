import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import { api } from '@/api';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import useEditorStore from '@/store/useEditorStore';

interface ITextEditorProps {
  path: string;
  fallbackText?: string;
  onSaved?: (text: string) => void;
}

export default function TextEditor({ path, fallbackText, onSaved }: ITextEditorProps) {
  const { mutate } = useSWRConfig();
  const extName = path.split('.').pop() || '';

  const fileFetcher = async (filePath: string) => {
    try {
      const res = await axios.get(filePath, { responseType: 'text', transformResponse: [(data) => data] });
      return typeof res.data === 'string' ? res.data : '';
    } catch {
      return '';
    }
  };

  const { data } = useSWR(path, fileFetcher);

  const isDarkMode = useEditorStore.use.isDarkMode();

  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const update = async (text: string) => {
    await api.assetsControllerEditTextFile({ textFile: text, path: path });
    await mutate(path, text, false);
    if (onSavedRef.current) {
      onSavedRef.current(text);
    } else {
      EditorPreviewClient.reloadTemplates();
    }
  };

  const updateRef = useRef(update);
  updateRef.current = update;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    setEditorReady(false);
  }, [path]);

  // 使用 useMemo 缓存 iframe 元素
  const memoizedIframe = useMemo(() => {
    return (
      // eslint-disable-next-line react/iframe-missing-sandbox
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
      if (event.source !== iframe.contentWindow) return;
      if (event.data.type === 'editorReady') {
        setEditorReady(true);
      } else if (event.data.type === 'valueChanged') {
        updateRef.current(event.data.value);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [path]);

  const initialText = data === undefined ? undefined : (data.trim() ? data : (fallbackText ?? data));

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || initialText === undefined || !editorReady) return;

    iframe.contentWindow?.postMessage({ type: 'setValue', value: initialText }, '*');
    iframe.contentWindow?.postMessage({ type: 'setLanguage', language: extName }, '*');
    iframe.contentWindow?.postMessage({ type: 'setTheme', theme: isDarkMode ? 'vs-dark' : 'vs' }, '*');
  }, [initialText, editorReady, extName, isDarkMode]);

  return memoizedIframe;
}
