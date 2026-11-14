import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { api } from '@/api';
import { useJsonFileText } from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import {
  deriveLayerKey,
  derivePresetKey,
  ICharacterCanvas,
  ICharacterComponent,
  ICharacterDocument,
  parseCharacter,
  serializeCharacter,
} from './characterDocument';
import {
  addLayerToDoc,
  deleteSetKey,
  getInitialVisibleKeys,
  removeLayerFromDoc,
  removePresetFromDoc,
  renameLayerInDoc,
  renamePresetInDoc,
  reorderLayersInDoc,
  replaceSetKey,
  setPresetFromVisibleInDoc,
  togglePresetLayerInDoc,
  toggleSetKey,
  updateLayerInDoc,
} from './characterOperations';

const SAVE_DELAY = 300;

/**
 * 编辑合成角色文档：防抖写回 figure.json 并维护选中图层、可见性与当前预设
 */
export function useCharacterDocument(url: string, initialText: string) {
  const { mutate } = useJsonFileText(url);
  const [doc, setDoc] = useState(() => parseCharacter(initialText));
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(() => doc.layers[0]?.key ?? null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => getInitialVisibleKeys(doc));
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(
    () => Object.keys(doc.presets ?? {})[0] ?? null,
  );

  // 新建空 figure.json 时 initialText 为空，打开后立即序列化并触发一次保存
  const lastTextRef = useRef(initialText.trim() === '' ? '' : serializeCharacter(doc));
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;
  const docRef = useRef(doc);
  docRef.current = doc;
  const visibleKeysRef = useRef(visibleKeys);
  visibleKeysRef.current = visibleKeys;

  const debouncedSave = useMemo(
    () =>
      debounce((nextDoc: ICharacterDocument) => {
        const text = serializeCharacter(nextDoc);
        // 切回脚本编辑器时立即同步 SWR 缓存，避免等待写盘 HTTP 往返导致旧 JSON 闪烁
        mutateRef.current(text, { revalidate: false });
        api.manageGameControllerEditTextFile({ textFile: text, path: url });
      }, SAVE_DELAY),
    [url],
  );

  useEffect(() => {
    const text = serializeCharacter(doc);
    if (text === lastTextRef.current) return;
    lastTextRef.current = text;
    debouncedSave(doc);
  }, [doc, debouncedSave]);

  useEffect(() => () => {
    debouncedSave.flush();
  }, [debouncedSave]);

  const setCanvasSize = useCallback((canvas: ICharacterCanvas) => {
    setDoc((prev) => ({ ...prev, canvas }));
  }, []);

  const addLayer = useCallback((src: string) => {
    const createdKey = deriveLayerKey(src, docRef.current.layers);
    setDoc((prev) => addLayerToDoc(prev, createdKey, src));
    setVisibleKeys((prev) => new Set(prev).add(createdKey));
    setSelectedLayerKey(createdKey);
    setSelectedPresetKey(null);
  }, []);

  const updateLayer = useCallback((key: string, updater: (comp: ICharacterComponent) => ICharacterComponent) => {
    setDoc((prev) => updateLayerInDoc(prev, key, updater));
  }, []);

  const renameLayer = useCallback((oldKey: string, rawNewKey: string): boolean => {
    const nextKey = rawNewKey.trim();
    if (!nextKey || nextKey === oldKey) return false;
    if (docRef.current.layers.some((layer) => layer.key === nextKey)) return false;

    setDoc((prev) => renameLayerInDoc(prev, oldKey, nextKey));
    setVisibleKeys((prev) => replaceSetKey(prev, oldKey, nextKey));
    setSelectedLayerKey((prev) => (prev === oldKey ? nextKey : prev));
    return true;
  }, []);

  const removeLayer = useCallback((key: string) => {
    setDoc((prev) => removeLayerFromDoc(prev, key));
    setVisibleKeys((prev) => deleteSetKey(prev, key));
    setSelectedLayerKey((prev) => (prev === key ? null : prev));
    setSelectedPresetKey(null);
  }, []);

  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    setDoc((prev) => reorderLayersInDoc(prev, fromIndex, toIndex));
    setSelectedPresetKey(null);
  }, []);

  const toggleLayerVisible = useCallback((key: string) => {
    setVisibleKeys((prev) => toggleSetKey(prev, key));
    setSelectedPresetKey(null);
  }, []);

  const toggleAllVisible = useCallback(() => {
    const layers = docRef.current.layers;
    setVisibleKeys((prev) => {
      const allVisible = layers.length > 0 && layers.every((layer) => prev.has(layer.key));
      return allVisible ? new Set() : new Set(layers.map((layer) => layer.key));
    });
    setSelectedPresetKey(null);
  }, []);

  const selectPreset = useCallback((presetKey: string) => {
    const keys = docRef.current.presets?.[presetKey] ?? [];
    setVisibleKeys(new Set(keys));
    setSelectedPresetKey(presetKey);
  }, []);

  const createPresetFromVisible = useCallback(() => {
    const createdKey = derivePresetKey(docRef.current.presets ?? {});
    const visible = visibleKeysRef.current;
    setDoc((prev) => setPresetFromVisibleInDoc(prev, createdKey, visible));
    setSelectedPresetKey(createdKey);
  }, []);

  const renamePreset = useCallback((oldKey: string, rawNewKey: string): boolean => {
    const nextKey = rawNewKey.trim();
    const presets = docRef.current.presets ?? {};
    if (!nextKey || nextKey === oldKey || Object.hasOwn(presets, nextKey)) return false;

    setDoc((prev) => renamePresetInDoc(prev, oldKey, nextKey));
    setSelectedPresetKey((prev) => (prev === oldKey ? nextKey : prev));
    return true;
  }, []);

  const togglePresetLayer = useCallback((presetKey: string, layerKey: string) => {
    setDoc((prev) => togglePresetLayerInDoc(prev, presetKey, layerKey));
    setVisibleKeys((prev) => toggleSetKey(prev, layerKey));
  }, []);

  const removePreset = useCallback((presetKey: string) => {
    setDoc((prev) => removePresetFromDoc(prev, presetKey));
    setSelectedPresetKey((prev) => (prev === presetKey ? null : prev));
  }, []);

  return {
    doc,
    selectedLayerKey,
    setSelectedLayerKey,
    visibleKeys,
    selectedPresetKey,
    setCanvasSize,
    addLayer,
    updateLayer,
    renameLayer,
    removeLayer,
    reorderLayers,
    toggleLayerVisible,
    toggleAllVisible,
    selectPreset,
    createPresetFromVisible,
    renamePreset,
    togglePresetLayer,
    removePreset,
  };
}
