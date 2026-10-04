import { IKeyPoint, ITrack } from '../model/animationDocument';
import {
  getDefaultRelativeCalc,
  getNeutralValue,
  getRelativeCalcOverride,
  isRelative,
  setRelativeCalc,
} from '../model/animationSettings';
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
  const { fields, time, getProperty } = context;
  const { path, points } = track;
  const property = getProperty(path);
  const value = sampleTrackValue(points, time, getNeutralValue(fields, path, property.defaultValue));
  // 关键帧放在整毫秒上；暂停、拖动后播放头都已对齐，这里只是兜底
  const keyTime = Math.round(time);
  const keyframe = findLastPointAt(points, keyTime);
  const updateOwnPoints = (update: (points: IKeyPoint[]) => IKeyPoint[]) =>
    context.updateTracks((tracks) => updatePoints(tracks, path, update));

  const header: ITrackHeaderProps = {
    property,
    value,
    hasKeyframe: keyframe !== undefined,
    onValueChange: (newValue) => updateOwnPoints((prev) => setValueAt(prev, keyTime, newValue)),
    onToggleKeyframe: () =>
      updateOwnPoints((prev) => (keyframe ? removePoint(prev, keyframe.id) : setValueAt(prev, keyTime, value))),
    relativeCalc: isRelative(fields)
      ? { override: getRelativeCalcOverride(fields, path), default: getDefaultRelativeCalc(path) }
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
