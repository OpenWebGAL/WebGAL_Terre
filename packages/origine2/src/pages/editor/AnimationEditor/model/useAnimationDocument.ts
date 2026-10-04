import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { api } from '@/api';
import { useJsonFileText } from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import { IAnimationDocument, ITrack, parseAnimation, serializeAnimation } from './animationDocument';

const SAVE_DELAY = 300;

/**
 * 正在编辑的动画。修改后自动保存，并更新代码编辑器共用的文件缓存
 * @param initialText 打开时的文件内容，之后以编辑器中的状态为准
 */
export function useAnimationDocument(url: string, initialText: string) {
  const [doc, setDoc] = useState(() => parseAnimation(initialText));
  const { mutate } = useJsonFileText(url);
  /** 上次保存（或打开时）的文件内容，内容没变就不写文件，例如只是添加了一条空轨道 */
  const lastTextRef = useRef(serializeAnimation(doc));

  const save = useMemo(
    () =>
      debounce(async (text: string) => {
        await api.manageGameControllerEditTextFile({ textFile: text, path: url });
        mutate(text, { revalidate: false });
      }, SAVE_DELAY),
    [url, mutate],
  );

  useEffect(() => {
    const text = serializeAnimation(doc);
    if (text === lastTextRef.current) return;
    lastTextRef.current = text;
    save(text);
  }, [doc, save]);

  // 离开编辑器时立即写入尚未保存的修改
  useEffect(
    () => () => {
      save.flush();
    },
    [save],
  );

  const updateTracks = useCallback((update: (tracks: ITrack[]) => ITrack[]) => {
    setDoc((prev) => ({ ...prev, tracks: update(prev.tracks) }));
  }, []);

  const updateFields = useCallback((update: (fields: IAnimationDocument['fields']) => IAnimationDocument['fields']) => {
    setDoc((prev) => ({ ...prev, fields: update(prev.fields) }));
  }, []);

  return { doc, updateTracks, updateFields };
}
