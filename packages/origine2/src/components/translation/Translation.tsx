import useLanguage from '@/hooks/useLanguage';
import { RootState } from '@/store/origineStore';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

let inited = -1;

export default function Translation() {
  const setLanguage = useLanguage();
  const { editor } = useSelector((state: RootState) => state.status);

  useEffect(() => {
    // 防止初始化后调用
    if (inited > 0) return;
    inited++;
    setLanguage(Number(window?.localStorage?.getItem('editor-lang')));
  }, [editor.language]);

  return null;
}
