/**
 * @file 合成角色文档的纯数据操作：图层增删改排、预设操作与可见集合辅助函数。
 */
import {
  filterLayerKeysBottomToTop,
  ICharacterComponent,
  ICharacterDocument,
  ICharacterLayer,
} from './characterDocument';

export function getInitialVisibleKeys(doc: ICharacterDocument): Set<string> {
  const firstPresetKey = Object.keys(doc.presets ?? {})[0];
  if (firstPresetKey !== undefined) {
    return new Set(doc.presets?.[firstPresetKey] ?? []);
  }
  return new Set(doc.layers.map((layer) => layer.key));
}

export function replaceSetKey(prev: Set<string>, oldKey: string, newKey: string): Set<string> {
  if (!prev.has(oldKey)) return prev;
  const next = new Set(prev);
  next.delete(oldKey);
  next.add(newKey);
  return next;
}

export function deleteSetKey(prev: Set<string>, key: string): Set<string> {
  if (!prev.has(key)) return prev;
  const next = new Set(prev);
  next.delete(key);
  return next;
}

export function toggleSetKey(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

function mapPresets(
  presets: Record<string, string[]> | undefined,
  transform: (keys: string[]) => string[],
): Record<string, string[]> | undefined {
  if (!presets) return undefined;
  return Object.fromEntries(Object.entries(presets).map(([pKey, keys]) => [pKey, transform(keys)]));
}

export function addLayerToDoc(doc: ICharacterDocument, key: string, src: string): ICharacterDocument {
  return { ...doc, layers: [{ key, component: { src } }, ...doc.layers] };
}

export function updateLayerInDoc(
  doc: ICharacterDocument,
  key: string,
  updater: (comp: ICharacterComponent) => ICharacterComponent,
): ICharacterDocument {
  return {
    ...doc,
    layers: doc.layers.map((layer) => (layer.key === key ? { ...layer, component: updater(layer.component) } : layer)),
  };
}

export function renameLayerInDoc(doc: ICharacterDocument, oldKey: string, nextKey: string): ICharacterDocument {
  const layers = doc.layers.map((layer) => (layer.key === oldKey ? { ...layer, key: nextKey } : layer));
  const presets = mapPresets(doc.presets, (keys) => keys.map((item) => (item === oldKey ? nextKey : item)));
  return presets ? { ...doc, layers, presets } : { ...doc, layers };
}

export function removeLayerFromDoc(doc: ICharacterDocument, key: string): ICharacterDocument {
  const layers = doc.layers.filter((layer) => layer.key !== key);
  const presets = mapPresets(doc.presets, (keys) => keys.filter((item) => item !== key));
  return presets ? { ...doc, layers, presets } : { ...doc, layers };
}

export function reorderLayersInDoc(doc: ICharacterDocument, fromIndex: number, toIndex: number): ICharacterDocument {
  if (fromIndex === toIndex) return doc;
  const nextLayers = [...doc.layers];
  const [moved] = nextLayers.splice(fromIndex, 1);
  if (!moved) return doc;
  nextLayers.splice(toIndex, 0, moved);
  const presets = mapPresets(doc.presets, (keys) => filterLayerKeysBottomToTop(nextLayers, new Set(keys)));
  return presets ? { ...doc, layers: nextLayers, presets } : { ...doc, layers: nextLayers };
}

/**
 * 解析画布预览使用的从顶到底图层顺序：选中预设时优先按预设内从底到顶顺序排列
 */
export function resolveCanvasLayers(
  doc: ICharacterDocument,
  selectedPresetKey: string | null,
): ICharacterLayer[] {
  if (!selectedPresetKey || !doc.presets || !Object.hasOwn(doc.presets, selectedPresetKey)) {
    return doc.layers;
  }
  const layerByKey = new Map(doc.layers.map((layer) => [layer.key, layer]));
  const presetBottomToTop = new Map<string, ICharacterLayer>();
  for (const key of doc.presets[selectedPresetKey] ?? []) {
    const layer = layerByKey.get(key);
    if (!layer) continue;
    if (presetBottomToTop.has(key)) presetBottomToTop.delete(key);
    presetBottomToTop.set(key, layer);
  }
  const presetTopToBottom = Array.from(presetBottomToTop.values()).reverse();
  const rest = doc.layers.filter((layer) => !presetBottomToTop.has(layer.key));
  return [...presetTopToBottom, ...rest];
}

export function renamePresetInDoc(doc: ICharacterDocument, oldKey: string, nextKey: string): ICharacterDocument {
  const entries = Object.entries(doc.presets ?? {}).map(([k, v]) => [k === oldKey ? nextKey : k, v]);
  return { ...doc, presets: Object.fromEntries(entries) };
}

export function setPresetFromVisibleInDoc(
  doc: ICharacterDocument,
  presetKey: string,
  visibleKeys: Set<string>,
): ICharacterDocument {
  return {
    ...doc,
    presets: { ...(doc.presets ?? {}), [presetKey]: filterLayerKeysBottomToTop(doc.layers, visibleKeys) },
  };
}

export function togglePresetLayerInDoc(
  doc: ICharacterDocument,
  presetKey: string,
  layerKey: string,
): ICharacterDocument {
  const nextSet = toggleSetKey(new Set(doc.presets?.[presetKey] ?? []), layerKey);
  return setPresetFromVisibleInDoc(doc, presetKey, nextSet);
}

export function removePresetFromDoc(doc: ICharacterDocument, presetKey: string): ICharacterDocument {
  if (!doc.presets) return doc;
  const { [presetKey]: _removed, ...rest } = doc.presets;
  return { ...doc, presets: rest };
}
