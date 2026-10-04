/**
 * @file 预览设置：用什么背景、立绘来预览动画，动画作用在哪个对象上。
 * 只用于预览，不写入动画文件，按游戏保存在 localStorage 中
 */
import { useCallback, useState } from 'react';
import useEditorStore from '@/store/useEditorStore';

export type PreviewTarget = 'figure' | 'background';
export type FigurePosition = 'left' | 'center' | 'right';

export interface IPreviewSettings {
  target: PreviewTarget;
  /** 相对于 figure 目录的文件名，空字符串表示不显示 */
  figure: string;
  figurePosition: FigurePosition;
  /** 相对于 background 目录的文件名，空字符串表示不显示 */
  background: string;
}

const DEFAULT_SETTINGS: IPreviewSettings = { target: 'figure', figure: '', figurePosition: 'center', background: '' };

/** 预览立绘的 id，也是动画作用在立绘上时的目标 */
const PREVIEW_FIGURE_ID = 'animation-preview';

export function usePreviewSettings() {
  const gameDir = useEditorStore.use.subPage();
  const storageKey = `animation-preview-settings:${gameDir}`;
  const [settings, setSettings] = useState<IPreviewSettings>(() => ({ ...DEFAULT_SETTINGS, ...readStorage(storageKey) }));

  const updateSettings = useCallback(
    (patch: Partial<IPreviewSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  return [settings, updateSettings] as const;
}

/**
 * 搭建预览舞台的场景：立即显示背景和立绘，不播放入场动画
 */
export function buildPreviewScene(settings: IPreviewSettings): string {
  const lines: string[] = [];
  if (settings.background) {
    lines.push(`changeBg:${settings.background} -duration=0 -next;`);
  }
  if (settings.figure) {
    const positionArg = settings.figurePosition === 'center' ? '' : ` -${settings.figurePosition}`;
    lines.push(`changeFigure:${settings.figure} -id=${PREVIEW_FIGURE_ID}${positionArg} -duration=0 -next;`);
  }
  return lines.join('\n');
}

export function getPreviewTarget(settings: IPreviewSettings): string {
  return settings.target === 'figure' ? PREVIEW_FIGURE_ID : 'bg-main';
}

function readStorage(storageKey: string): Partial<IPreviewSettings> {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}');
  } catch {
    return {};
  }
}
