/**
 * @file 动画文件（Animation v2）与编辑器模型之间的转换。
 *
 * 文件中的关键帧是一个数组，每帧的 duration 是距上一帧的时长，一帧可以同时指定多个属性；
 * 编辑器按属性拆成轨道，每个关键点记录距动画开始的绝对时间，便于在时间轴上逐属性编辑。
 * 格式说明见 WebGAL 仓库的 dev-docs/Animation v2.md
 */
import set from 'lodash/set';
import { createId } from '@/utils/createId';

export const DEFAULT_EASE = 'easeInOut';

export interface IKeyPoint {
  id: string;
  /** 距动画开始的时间（毫秒） */
  time: number;
  value: number;
  /** 从上一关键点到达本点所用的缓动 */
  ease: string;
}

export interface ITrack {
  /** 属性路径，如 'alpha'、'position.x' */
  path: string;
  /** 按时间先后排列；时间相同的关键点构成跳变 */
  points: IKeyPoint[];
}

export interface IAnimationDocument {
  /** 关键帧以外的顶层字段，原样保留（version、relative、inherit、relativeCalc 等） */
  fields: Record<string, unknown>;
  /** 时间轴上显示的轨道；没有关键点的轨道只用于显示，不会写入文件 */
  tracks: ITrack[];
}

type AnimationObject = Record<string, unknown> & { keyframes: unknown[] };

/** 新建的动画默认显示的属性 */
const DEFAULT_TRACK_PATHS = ['position.x', 'position.y', 'scale.x', 'scale.y', 'alpha'];

/**
 * 是否可用图形编辑器编辑：v2 动画，或者 animation 目录下的空文件（新建的动画）。
 * v1 动画（顶层为关键帧数组）以及其他 JSON 都不算
 */
export function isEditableAnimation(text: string, isInAnimationDir: boolean): boolean {
  if (text.trim() === '') return isInAnimationDir;
  const animation = tryParse(text);
  return animation !== null && (animation.version === undefined || animation.version === 2);
}

export function parseAnimation(text: string): IAnimationDocument {
  const { keyframes, ...fields } = tryParse(text) ?? { version: 2, keyframes: [] };
  const tracks = framesToTracks(keyframes);
  return {
    fields,
    tracks: tracks.length > 0 ? tracks : DEFAULT_TRACK_PATHS.map((path) => ({ path, points: [] })),
  };
}

export function serializeAnimation(doc: IAnimationDocument): string {
  return JSON.stringify(toAnimationObject(doc), null, 2);
}

export function toAnimationObject(doc: IAnimationDocument): AnimationObject {
  return { ...doc.fields, keyframes: tracksToFrames(doc.tracks) };
}

/**
 * 动画时长：最后一个关键点的时间
 */
export function getAnimationDuration(tracks: ITrack[]): number {
  return Math.max(0, ...tracks.flatMap((track) => track.points.map((point) => point.time)));
}

function tryParse(text: string): AnimationObject | null {
  try {
    const value = JSON.parse(text);
    const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
    return isObject && Array.isArray(value.keyframes) ? value : null;
  } catch {
    return null;
  }
}

function framesToTracks(keyframes: unknown[]): ITrack[] {
  const tracks = new Map<string, IKeyPoint[]>();
  let time = 0;
  for (const frame of keyframes) {
    if (typeof frame !== 'object' || frame === null) continue;
    const { duration, ease, ...values } = frame as Record<string, unknown>;
    time += typeof duration === 'number' && duration >= 0 ? duration : 0;
    for (const [path, value] of collectNumericValues(values)) {
      const points = tracks.get(path) ?? [];
      points.push({ id: createId(), time, value, ease: typeof ease === 'string' ? ease : DEFAULT_EASE });
      tracks.set(path, points);
    }
  }
  return [...tracks].map(([path, points]) => ({ path, points }));
}

/**
 * 帧中的数值属性，position、scale 这类嵌套对象展开为 'position.x' 这样的路径
 */
function collectNumericValues(values: Record<string, unknown>): [string, number][] {
  return Object.entries(values).flatMap(([key, value]): [string, number][] => {
    if (typeof value === 'number') return [[key, value]];
    if (typeof value !== 'object' || value === null) return [];
    return Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([axis, axisValue]) => [`${key}.${axis}`, axisValue]);
  });
}

/**
 * 把轨道合并回关键帧数组：时间与缓动都相同的关键点放进同一帧。
 * 同一属性在同一时刻的第 n 个关键点（跳变）放进该时刻的第 n 帧，保证跳变前后的先后顺序
 */
function tracksToFrames(tracks: ITrack[]): Record<string, unknown>[] {
  const groups = new Map<string, { time: number; order: number; ease: string; values: Record<string, unknown> }>();
  for (const track of tracks) {
    track.points.forEach((point, index) => {
      const order = track.points.slice(0, index).filter((prev) => prev.time === point.time).length;
      const key = `${point.time}|${order}|${point.ease}`;
      const group = groups.get(key) ?? { time: point.time, order, ease: point.ease, values: {} };
      set(group.values, track.path, point.value);
      groups.set(key, group);
    });
  }

  const sortedGroups = [...groups.values()].sort((a, b) => a.time - b.time || a.order - b.order);
  let lastTime = 0;
  return sortedGroups.map(({ time, ease, values }) => {
    const frame = { duration: time - lastTime, ...values, ...(ease === DEFAULT_EASE ? {} : { ease }) };
    lastTime = time;
    return frame;
  });
}
