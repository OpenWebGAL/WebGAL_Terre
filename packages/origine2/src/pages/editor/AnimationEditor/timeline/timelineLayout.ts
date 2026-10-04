/** 0 时刻距轨道左端的距离，留出位置让 0 时刻的播放头、关键帧完整显示 */
const TIME_ORIGIN = 12;

/** 拖动播放头、关键帧时吸附的时间间隔（毫秒） */
const TIME_SNAP = 10;

/** 动画结束后，时间轴再多显示的时长（毫秒），便于把关键帧往后拖 */
export const TIMELINE_TAIL = 1000;

export const MIN_PX_PER_MS = 0.05;
export const MAX_PX_PER_MS = 4;
export const DEFAULT_PX_PER_MS = 0.4;

/** 时刻在轨道中的横坐标 */
export function timeToX(time: number, pxPerMs: number): number {
  return TIME_ORIGIN + time * pxPerMs;
}

/** 轨道中的横坐标对应的时刻 */
export function xToTime(x: number, pxPerMs: number): number {
  return (x - TIME_ORIGIN) / pxPerMs;
}

export function snapTime(time: number): number {
  return Math.max(0, Math.round(time / TIME_SNAP) * TIME_SNAP);
}

export function clampZoom(pxPerMs: number): number {
  return Math.min(MAX_PX_PER_MS, Math.max(MIN_PX_PER_MS, pxPerMs));
}

/**
 * 按精度显示数值，并去掉末尾多余的 0
 */
export function formatValue(value: number, precision: number): string {
  return Number(value.toFixed(precision)).toString();
}
