/**
 * @file 对轨道的编辑操作。都是纯函数，返回新的数组。
 * 关键点的操作作用于一条轨道的 points，通过 updatePoints 应用到指定轨道
 */
import { createId } from '@/utils/createId';
import { DEFAULT_EASE, IKeyPoint, ITrack } from './animationDocument';

/**
 * 修改某条轨道的关键点，修改后按时间重新排序（sort 是稳定的，同一时刻的关键点保持原有先后）
 */
export function updatePoints(tracks: ITrack[], path: string, update: (points: IKeyPoint[]) => IKeyPoint[]): ITrack[] {
  return tracks.map((track) =>
    track.path === path ? { ...track, points: update(track.points).sort((a, b) => a.time - b.time) } : track,
  );
}

export function addTrack(tracks: ITrack[], path: string): ITrack[] {
  return [...tracks, { path, points: [] }];
}

export function removeTrack(tracks: ITrack[], path: string): ITrack[] {
  return tracks.filter((track) => track.path !== path);
}

/**
 * 在 time 时刻设置属性值：该时刻已有关键点时修改它（跳变时修改靠后的那个），否则插入新的关键点
 */
export function setValueAt(points: IKeyPoint[], time: number, value: number): IKeyPoint[] {
  const existing = findLastPointAt(points, time);
  if (existing) return updatePoint(points, existing.id, { value });
  return [...points, { id: createId(), time, value, ease: DEFAULT_EASE }];
}

export function findLastPointAt(points: IKeyPoint[], time: number): IKeyPoint | undefined {
  return points.filter((point) => point.time === time).pop();
}

export function removePoint(points: IKeyPoint[], id: string): IKeyPoint[] {
  return points.filter((point) => point.id !== id);
}

export function updatePoint(points: IKeyPoint[], id: string, patch: Partial<IKeyPoint>): IKeyPoint[] {
  return points.map((point) => (point.id === id ? { ...point, ...patch } : point));
}
