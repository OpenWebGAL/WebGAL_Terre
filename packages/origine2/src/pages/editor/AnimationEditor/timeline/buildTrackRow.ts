import { IKeyPoint, ITrack } from '../model/animationDocument';
import {
  getDefaultRelativeCalc,
  getNeutralValue,
  getRelativeCalcOverride,
  isAbsoluteValue,
  isRelative,
  setRelativeCalc,
} from '../model/animationSettings';
import { getColorChannels, Rgb, setColorAt } from '../model/colorChannels';
import {
  findLastPointAt,
  removePoint,
  removeTrack,
  setValueAt,
  updatePoint,
  updatePoints,
} from '../model/trackOperations';
import { sampleTrackValue } from '../model/trackSampling';
import { IAnimationProperty } from '../model/useAnimationProperties';
import { ITrackHeaderProps } from './TrackHeader';
import { ITrackLaneProps } from './TrackLane';

type Updater<T> = (update: (value: T) => T) => void;

export interface ITrackRowContext {
  fields: Record<string, unknown>;
  /** 全部轨道，颜色通道需要读取同组其他通道的值 */
  tracks: ITrack[];
  time: number;
  pxPerMs: number;
  laneWidth: number;
  /** 选中的关键帧 */
  selected: { path: string; id: string } | null;
  getProperty: (path: string) => IAnimationProperty;
  updateTracks: Updater<ITrack[]>;
  updateFields: Updater<Record<string, unknown>>;
  onSelectPoint: (path: string, point: IKeyPoint | null) => void;
  onScrub: (time: number) => void;
}

/**
 * 时间轴中一个属性对应的两部分：左侧属性栏与右侧关键帧轨道。
 * 两者分别位于不同的滚动区域，这里统一生成它们的 props。
 * 没有码表开关，所有属性都相当于开启了码表：在播放头处修改值就会在此处设置关键帧
 */
export function buildTrackRow(track: ITrack, context: ITrackRowContext) {
  const { time } = context;
  const { path, points } = track;
  const property = context.getProperty(path);
  const value = sampleValueAt(path, points, context);
  // 关键帧放在整毫秒上；暂停、拖动后播放头都已对齐，这里只是兜底
  const keyTime = Math.round(time);
  const keyframe = findLastPointAt(points, keyTime);
  const updateOwnPoints = (update: (points: IKeyPoint[]) => IKeyPoint[]) =>
    context.updateTracks((tracks) => updatePoints(tracks, path, update));

  const header: ITrackHeaderProps = {
    property,
    value,
    color: buildColorProps(path, context, keyTime),
    hasKeyframe: keyframe !== undefined,
    onValueChange: (newValue) => updateOwnPoints((prev) => setValueAt(prev, keyTime, newValue)),
    onToggleKeyframe: () =>
      updateOwnPoints((prev) => (keyframe ? removePoint(prev, keyframe.id) : setValueAt(prev, keyTime, value))),
    relativeCalc: isRelative(context.fields)
      ? { override: getRelativeCalcOverride(context.fields, path), default: getDefaultRelativeCalc(path) }
      : null,
    onRelativeCalcChange: (calc) => context.updateFields((prev) => setRelativeCalc(prev, path, calc)),
    onRemove: () => context.updateTracks((tracks) => removeTrack(tracks, path)),
  };

  const lane: ITrackLaneProps = {
    points,
    pxPerMs: context.pxPerMs,
    width: context.laneWidth,
    selectedId: context.selected?.path === path ? context.selected.id : undefined,
    onSelectPoint: (point) => context.onSelectPoint(path, point),
    onPointChange: (id, patch) => updateOwnPoints((prev) => updatePoint(prev, id, patch)),
    onDeletePoint: (id) => updateOwnPoints((prev) => removePoint(prev, id)),
    onScrub: context.onScrub,
  };

  return { header, lane };
}

/** 播放头处的值；第一个关键帧之前以及没有关键帧时为基准状态 */
function sampleValueAt(path: string, points: IKeyPoint[], context: ITrackRowContext) {
  const neutral = getNeutralValue(context.fields, path, context.getProperty(path).defaultValue);
  return sampleTrackValue(points, context.time, neutral);
}

/**
 * 颜色通道的拾色器。同一颜色只在第一条显示出来的通道上提供；
 * 相对动画中通道的值不是绝对值时，拾色器的颜色没有意义，不提供
 */
function buildColorProps(path: string, context: ITrackRowContext, keyTime: number): ITrackHeaderProps['color'] {
  const channels = getColorChannels(path);
  const firstShownChannel = channels && context.tracks.find((track) => channels.includes(track.path));
  if (!channels || firstShownChannel?.path !== path) return undefined;
  if (!channels.every((channel) => isAbsoluteValue(context.fields, channel))) return undefined;

  const rgb = channels.map((channel) => {
    const points = context.tracks.find((track) => track.path === channel)?.points ?? [];
    return sampleValueAt(channel, points, context);
  }) as Rgb;
  return {
    rgb,
    onChange: (newRgb) => context.updateTracks((tracks) => setColorAt(tracks, keyTime, { channels, rgb: newRgb })),
  };
}
