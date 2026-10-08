/**
 * @file 取轨道在某一时刻的帧值，用于在属性栏显示播放头处的值。
 *
 * 这里只在帧值（文件中写的值）上插值，不做相对计算；预览画面的状态由引擎计算（preview.command.seek-animation）。
 * 插值方式与缓动和引擎的 sampleTrack 保持一致
 */
import * as popmotion from 'popmotion';
import { IKeyPoint } from './animationDocument';

const EASINGS: Record<string, popmotion.Easing> = {
  linear: popmotion.linear,
  easeIn: popmotion.easeIn,
  easeOut: popmotion.easeOut,
  easeInOut: popmotion.easeInOut,
  circIn: popmotion.circIn,
  circOut: popmotion.circOut,
  circInOut: popmotion.circInOut,
  backIn: popmotion.backIn,
  backOut: popmotion.backOut,
  backInOut: popmotion.backInOut,
  bounceIn: popmotion.bounceIn,
  bounceOut: popmotion.bounceOut,
  bounceInOut: popmotion.bounceInOut,
  anticipate: popmotion.anticipate,
};

/**
 * @param neutralValue 当前基准状态对应的帧值。v2 动画在第一个关键帧之前从基准状态过渡过去
 */
export function sampleTrackValue(points: IKeyPoint[], time: number, neutralValue: number): number {
  const startPoint: IKeyPoint = { id: '', time: 0, value: neutralValue, ease: 'linear' };
  const allPoints = [startPoint, ...points];
  // 本区间的插值终点：第一个晚于 time 的关键点；同一时刻的多个关键点中，靠后的是跳变后的状态
  const nextIndex = allPoints.findIndex((point) => point.time > time);
  if (nextIndex === -1) return allPoints[allPoints.length - 1].value;
  const prev = allPoints[nextIndex - 1];
  const next = allPoints[nextIndex];
  const progress = (time - prev.time) / (next.time - prev.time);
  const ease = EASINGS[next.ease] ?? popmotion.easeInOut;
  return prev.value + (next.value - prev.value) * ease(progress);
}
