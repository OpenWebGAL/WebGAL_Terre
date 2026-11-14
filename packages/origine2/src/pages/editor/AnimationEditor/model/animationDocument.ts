/**
 * @file 动画文件（Animation v2）与编辑器模型之间的转换。
 *
 * 文件中的关键帧是一个数组，每帧的 time 是该帧在动画中的时间，一帧可以同时指定多个属性；
 * 编辑器按属性拆成轨道，便于在时间轴上逐属性编辑。
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
  /**
   * 不含可编辑属性的关键帧（如只有 time 的帧），无法拆进轨道，原样保留。
   * 它们会延长动画时长；inherit 为 false 时还会让未指定的属性回到基准状态
   */
  emptyFrames: Record<string, unknown>[];
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
    emptyFrames: keyframes.filter(isFrame).filter((frame) => collectNumericValues(frame).length === 0),
  };
}

export function serializeAnimation(doc: IAnimationDocument): string {
  return JSON.stringify(toAnimationObject(doc), null, 2);
}

export function toAnimationObject(doc: IAnimationDocument): AnimationObject {
  // sort 是稳定的，同一时刻的空帧排在有属性的帧之后
  const keyframes = [...tracksToFrames(doc.tracks), ...doc.emptyFrames].sort((a, b) => getFrameTime(a) - getFrameTime(b));
  return { ...doc.fields, keyframes };
}

/**
 * 动画时长：最后一个关键帧的时间（包括空帧）
 */
export function getAnimationDuration(doc: IAnimationDocument): number {
  const pointTimes = doc.tracks.flatMap((track) => track.points.map((point) => point.time));
  return Math.max(0, ...pointTimes, ...doc.emptyFrames.map(getFrameTime));
}

/** setTempAnimation 中会覆盖动画同名字段的语句参数 */
export const OVERRIDE_ARG_KEYS = ['relative', 'inherit'];

/**
 * 把语句参数 -relative、-inherit 并入 v2 动画 JSON。引擎执行时参数会覆盖 JSON 中的同名字段，二者等价；
 * 并入后编辑器的显示、预览与实际执行一致，之后在编辑器中修改这些字段也不会再被参数覆盖。
 * 不是 v2 动画（如 v1 关键帧数组）时原样返回，参数仍需保留在语句中
 */
export function mergeOverrideArgs(text: string, args: { key: string; value: unknown }[]): string {
  const animation = tryParse(text);
  if (!animation || (animation.version !== undefined && animation.version !== 2)) return text;
  const overrides = OVERRIDE_ARG_KEYS.map((key) => [key, toSafeBoolean(args.find((arg) => arg.key === key)?.value)])
    .filter(([, value]) => value !== null);
  return overrides.length > 0 ? JSON.stringify({ ...animation, ...Object.fromEntries(overrides) }) : text;
}

/** 与引擎读取布尔参数的方式一致，无法识别时为 null（引擎不覆盖） */
function toSafeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value !== 'string') return null;
  const lower = value.trim().toLowerCase();
  return lower === 'true' ? true : lower === 'false' ? false : null;
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
  for (const frame of keyframes.filter(isFrame)) {
    const time = getFrameTime(frame);
    const ease = frame.ease;
    for (const [path, value] of collectNumericValues(frame)) {
      const points = tracks.get(path) ?? [];
      points.push({ id: createId(), time, value, ease: typeof ease === 'string' ? ease : DEFAULT_EASE });
      tracks.set(path, points);
    }
  }
  // 文件中的关键帧不一定按时间排列；sort 是稳定的，同一时刻的关键点（跳变）保持文件中的先后
  return [...tracks].map(([path, points]) => ({ path, points: points.sort((a, b) => a.time - b.time) }));
}

function isFrame(frame: unknown): frame is Record<string, unknown> {
  return typeof frame === 'object' && frame !== null;
}

/** 与引擎一致：time 缺省或非法时按 0 处理 */
function getFrameTime(frame: Record<string, unknown>): number {
  return typeof frame.time === 'number' && frame.time >= 0 ? frame.time : 0;
}

/**
 * 帧中的数值属性（不含 time、ease），position、scale 这类嵌套对象展开为 'position.x' 这样的路径
 */
function collectNumericValues(frame: Record<string, unknown>): [string, number][] {
  const { time, ease, ...values } = frame;
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
  return sortedGroups.map(({ time, ease, values }) => ({ time, ...values, ...(ease === DEFAULT_EASE ? {} : { ease }) }));
}
