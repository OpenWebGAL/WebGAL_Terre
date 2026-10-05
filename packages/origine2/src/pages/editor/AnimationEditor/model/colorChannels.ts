/**
 * @file 颜色属性。引擎中颜色按 R、G、B 三个通道分别存储（0-255），时间轴上也是三条轨道；
 * 为了能用拾色器编辑，把同一颜色的三个通道视为一组
 */
import { ITrack } from './animationDocument';
import { insertTrackAfter, setValueAt, updatePoints } from './trackOperations';

export type Rgb = [number, number, number];
export type ColorChannels = readonly [string, string, string];

const COLOR_CHANNELS: ColorChannels[] = [
  ['colorRed', 'colorGreen', 'colorBlue'],
  ['bevelRed', 'bevelGreen', 'bevelBlue'],
];

/** 属性所在颜色的三个通道；不是颜色通道时为 undefined */
export function getColorChannels(path: string): ColorChannels | undefined {
  return COLOR_CHANNELS.find((channels) => channels.includes(path));
}

/**
 * 在 time 时刻把颜色设为 rgb：三个通道各设一个关键帧。缺少的通道轨道插到同组已有轨道之后
 */
export function setColorAt(tracks: ITrack[], time: number, { channels, rgb }: { channels: ColorChannels; rgb: Rgb }) {
  return channels.reduce((next, path, index) => {
    const lastChannelPath = [...next].reverse().find((track) => channels.includes(track.path))?.path;
    const withTrack = next.some((track) => track.path === path) ? next : insertTrackAfter(next, path, lastChannelPath);
    return updatePoints(withTrack, path, (points) => setValueAt(points, time, rgb[index]));
  }, tracks);
}
