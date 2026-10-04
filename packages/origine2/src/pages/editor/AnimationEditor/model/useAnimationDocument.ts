import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { api } from '@/api';
import { useJsonFileText } from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import { IAnimationDocument, ITrack, parseAnimation, serializeAnimation } from './animationDocument';

const SAVE_DELAY = 300;

/**
 * 正在编辑的动画。修改后防抖调用 save 保存
 * @param initialText 打开时的动画 JSON，之后以编辑器中的状态为准
 * @param save 保存修改后的动画，不要求是稳定的函数
 */
export function useAnimationDocument(initialText: string, save: (doc: IAnimationDocument) => void) {
  const [doc, setDoc] = useState(() => parseAnimation(initialText));
  const saveRef = useRef(save);
  saveRef.current = save;
  /** 上次保存（或打开时）的内容，内容没变就不保存，例如只是添加了一条空轨道 */
  const lastTextRef = useRef(serializeAnimation(doc));

  const debouncedSave = useMemo(() => debounce((next: IAnimationDocument) => saveRef.current(next), SAVE_DELAY), []);

  useEffect(() => {
    const text = serializeAnimation(doc);
    if (text === lastTextRef.current) return;
    lastTextRef.current = text;
    debouncedSave(doc);
  }, [doc, debouncedSave]);

  // 离开编辑器时立即写入尚未保存的修改
  useEffect(
    () => () => {
      debouncedSave.flush();
    },
    [debouncedSave],
  );

  const updateTracks = useCallback((update: (tracks: ITrack[]) => ITrack[]) => {
    setDoc((prev) => ({ ...prev, tracks: update(prev.tracks) }));
  }, []);

  const updateFields = useCallback((update: (fields: IAnimationDocument['fields']) => IAnimationDocument['fields']) => {
    setDoc((prev) => ({ ...prev, fields: update(prev.fields) }));
  }, []);

  return { doc, updateTracks, updateFields };
}

/**
 * 编辑动画文件：保存时写入文件，并更新代码编辑器共用的文件缓存
 */
export function useAnimationFileDocument(url: string, initialText: string) {
  const { mutate } = useJsonFileText(url);
  return useAnimationDocument(initialText, async (doc) => {
    const text = serializeAnimation(doc);
    await api.manageGameControllerEditTextFile({ textFile: text, path: url });
    mutate(text, { revalidate: false });
  });
}
