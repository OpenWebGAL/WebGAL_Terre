import { useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { api } from '@/api';
import useEditorStore from '@/store/useEditorStore';
import type { IAssetsReadResponse } from '@/components/Assets/Assets';

/**
 * 选择动画时需要隐藏的文件（相对于 animation 目录）：动画表，以及 v1 动画。
 *
 * v1 动画（顶层为关键帧数组）只为兼容旧脚本保留，不再推荐使用：资源管理器中照常显示，
 * 但在明确选择动画的地方隐藏。只检查 animation 目录的第一层
 */
export function useHiddenAnimationFiles(): string[] {
  const gameDir = useEditorStore.use.subPage();
  const { data: v1Animations } = useSWR(`v1-animation-files-${gameDir}`, () => fetchV1AnimationFiles(gameDir));
  return useMemo(() => ['animationTable.json', ...(v1Animations ?? [])], [v1Animations]);
}

async function fetchV1AnimationFiles(gameDir: string): Promise<string[]> {
  const animationDir = `games/${gameDir}/game/animation`;
  const res = await api.assetsControllerReadAssets(animationDir);
  const { dirInfo = [] } = res.data as unknown as IAssetsReadResponse;
  const animationFiles = dirInfo.filter(
    (file) => !file.isDir && file.name.toLowerCase().endsWith('.json') && file.name !== 'animationTable.json',
  );
  const isV1List = await Promise.all(animationFiles.map((file) => isV1Animation(`/${animationDir}/${file.name}`)));
  return animationFiles.filter((_, index) => isV1List[index]).map((file) => file.name);
}

async function isV1Animation(url: string): Promise<boolean> {
  try {
    const res = await axios.get(url);
    return Array.isArray(res.data);
  } catch {
    return false;
  }
}
