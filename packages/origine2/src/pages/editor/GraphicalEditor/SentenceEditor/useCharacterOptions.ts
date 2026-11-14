import { useMemo } from 'react';
import useSWR from 'swr';
import { t } from '@lingui/macro';
import naturalCompare from 'natural-compare-lite';
import { ISentence } from 'webgal-parser/src/interface/sceneInterface';
import { api } from '@/api';
import type { IAssetsReadResponse } from '@/components/Assets/Assets';
import { useValue } from '@/hooks/useValue';
import { useGlobalEffectEditor } from '@/hooks/useGlobalEffectEditor';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { getArgByKey } from '../utils/getArgByKey';

export type FigurePosition = '' | 'left' | 'left14' | 'left13' | 'right13' | 'right14' | 'right';
const MAX_SCAN_DEPTH = 5;

export function useFigurePositions(): Map<FigurePosition, string> {
  return useMemo(() => new Map<FigurePosition, string>([
    ['left', t`左侧`],
    ['left14', t`左侧 1/4`],
    ['left13', t`左侧 1/3`],
    ['', t`中间`],
    ['right13', t`右侧 1/3`],
    ['right14', t`右侧 1/4`],
    ['right', t`右侧`],
  ]), []);
}

async function collectCharacterDirs(baseDir: string, relativePath: string, depth: number): Promise<string[]> {
  const dirPath = relativePath ? `${baseDir}/${relativePath}` : baseDir;
  let dirInfo: IAssetsReadResponse['dirInfo'] = [];
  try {
    const res = await api.assetsControllerReadAssets(dirPath);
    dirInfo = ((res.data as unknown as IAssetsReadResponse)?.dirInfo ?? []).filter((item) => item.name !== '.gitkeep');
  } catch {
    return [];
  }

  const found = relativePath && dirInfo.some((item) => !item.isDir && item.name === 'figure.json') ? [relativePath] : [];
  if (depth >= MAX_SCAN_DEPTH) return found;

  const nested = await Promise.all(
    dirInfo.filter((item) => item.isDir).map((subDir) =>
      collectCharacterDirs(baseDir, relativePath ? `${relativePath}/${subDir.name}` : subDir.name, depth + 1),
    ),
  );
  return [...found, ...nested.flat()];
}

export async function scanCharacterDirectories(gameDir: string): Promise<string[]> {
  if (!gameDir) return [];
  const results = await collectCharacterDirs(`games/${gameDir}/game/figure`, '', 0);
  return results.sort(naturalCompare);
}

export function useCharacterDirectories(gameDir: string): string[] {
  const { data } = useSWR(gameDir ? `character-directories-${gameDir}` : null, () => scanCharacterDirectories(gameDir));
  return data ?? [];
}

/**
 * 解析 `character` 指令内容中的角色目录与预设名，兼容含 `.` 的多级角色目录。
 */
export function resolveCharacterTarget(
  rawContent: string,
  componentsArg: string,
  knownCharacterPaths: ReadonlySet<string>,
): { characterPath: string; presetName: string } {
  if (componentsArg || knownCharacterPaths.has(rawContent)) {
    return { characterPath: rawContent, presetName: '' };
  }
  const lastDot = rawContent.lastIndexOf('.');
  const lastSlash = rawContent.lastIndexOf('/');
  if (lastDot > lastSlash + 1) {
    return { characterPath: rawContent.slice(0, lastDot), presetName: rawContent.slice(lastDot + 1) };
  }
  return { characterPath: rawContent, presetName: '' };
}

export function formatCharacterContent(characterPath: string, presetName: string, isCustomComponents: boolean): string {
  return isCustomComponents || !presetName ? characterPath : `${characterPath}.${presetName}`;
}

const readObjectKeys = (obj: unknown): string[] =>
  obj && typeof obj === 'object' && !Array.isArray(obj) ? Object.keys(obj) : [];

export function parseFigureJsonOptions(jsonText: string | undefined): { presetKeys: string[]; componentKeys: string[] } {
  if (!jsonText) return { presetKeys: [], componentKeys: [] };
  try {
    const parsed = JSON.parse(jsonText) as { presets?: unknown; components?: unknown };
    return { presetKeys: readObjectKeys(parsed?.presets), componentKeys: readObjectKeys(parsed?.components) };
  } catch {
    return { presetKeys: [], componentKeys: [] };
  }
}

export function parseComponentList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function orderSelectedComponents(selected: string[], componentKeys: string[]): string[] {
  const unique = Array.from(new Set(selected.map((item) => item.trim()).filter(Boolean)));
  const orderMap = new Map(componentKeys.map((key, index) => [key, index]));
  const known = unique.filter((key) => orderMap.has(key)).sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0));
  return [...known, ...unique.filter((key) => !orderMap.has(key))];
}

export function buildCharacterOptionsMap(discoveredPaths: string[], currentPath: string): Map<string, string> {
  const options = new Map<string, string>(discoveredPaths.map((path) => [path, path]));
  if (currentPath && currentPath !== 'none' && !options.has(currentPath)) {
    options.set(currentPath, currentPath);
  }
  return options;
}

export function buildPresetOptionsMap(presetKeys: string[], currentPreset: string): Map<string, string> {
  const options = new Map<string, string>([['', t`默认预设`], ...presetKeys.map((key): [string, string] => [key, key])]);
  if (currentPreset && !options.has(currentPreset)) {
    options.set(currentPreset, currentPreset);
  }
  return options;
}

export function buildPositionArgs(positions: Map<FigurePosition, string>, selected: FigurePosition) {
  return Array.from(positions.keys())
    .filter((position) => position !== '')
    .map((position) => ({ key: position, value: selected === position }));
}

export function useCharacterEffect(
  params: { sentence: ISentence; index: number; targetPath: string },
  getTarget: () => string,
  submit: () => void,
) {
  const json = useValue<string>(getArgByKey(params.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(params.sentence, 'duration') as number);
  const enterDuration = useValue<number | string>(getArgByKey(params.sentence, 'enterDuration') as number);
  const exitDuration = useValue<number | string>(getArgByKey(params.sentence, 'exitDuration') as number);
  const enterAnimation = useValue(getArgByKey(params.sentence, 'enter').toString() ?? '');
  const exitAnimation = useValue(getArgByKey(params.sentence, 'exit').toString() ?? '');
  const ease = useValue(getArgByKey(params.sentence, 'ease').toString() ?? '');
  const blendMode = useValue(getArgByKey(params.sentence, 'blendMode').toString() ?? '');

  const openEffectEditor = useGlobalEffectEditor((event) => {
    if (event.action === 'change') {
      json.set(event.value);
      submit();
    } else if (event.action === 'preview') {
      EditorPreviewClient.setEffect({ target: getTarget(), transform: event.value, phase: 'preview' });
    } else {
      const values = { enterAnimation, exitAnimation, duration, enterDuration, exitDuration, ease, blendMode };
      values[event.key].set(event.value as never);
      if (event.submit) submit();
    }
  });

  const showEffectEditor = () => openEffectEditor({
    title: t`效果编辑器`,
    json: json.value.toString(),
    sentence: params.sentence,
    index: params.index,
    targetPath: params.targetPath,
    tip: t`提示：效果只有在切换到不同角色或关闭之前的角色再重新添加时生效。如果你要为现有的角色设置效果，请使用单独的设置效果命令`,
    options: {
      enterAnimation: enterAnimation.value,
      exitAnimation: exitAnimation.value,
      duration: duration.value,
      enterDuration: enterDuration.value,
      exitDuration: exitDuration.value,
      ease: ease.value,
      blendMode: blendMode.value,
    },
  });

  const submitArgs = () => [
    { key: 'transform', value: json.value },
    { key: 'duration', value: duration.value },
    { key: 'enterDuration', value: enterDuration.value },
    { key: 'exitDuration', value: exitDuration.value },
    { key: 'enter', value: enterAnimation.value },
    { key: 'exit', value: exitAnimation.value },
    { key: 'ease', value: ease.value },
    { key: 'blendMode', value: blendMode.value },
  ];

  return { showEffectEditor, submitArgs };
}
