// 鼠标按下触发相关函数
import { MutableRefObject } from 'react';
import axios from 'axios';
import {
  convertControlToPreview,
  ToXOffset,
  degreesToRadians,
  convertPreviewToControl,
  radiansToDegrees,
  GetSceneTXT,
} from './baseUtils';
import { ISentence } from 'webgal-parser/src/interface/sceneInterface';

/**
 * 解析 changeFigure 命令字符串，提取方向和变换对象
 * @param line - 命令字符串
 * @returns { direction, transformObj }
 */
export function parseFigureCommand(line: string) {
  let direction: 'right' | 'left' | 'center' = 'center';
  let transformObj: any;
  const parts = line.split(/\s+/);

  for (const part of parts) {
    if (part.includes('-right')) direction = 'right';
    else if (part.includes('-left')) direction = 'left';
    else if (part.includes('-center')) direction = 'center';
    else if (part.startsWith('-transform=')) {
      // 提取 JSON 字符串，并安全移除末尾分号
      const jsonStr = part.replace('-transform=', '').replace(/;$/, '');
      try {
        transformObj = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse transform JSON:', jsonStr, e);
      }
    }
  }
  return { direction, transformObj };
}

/**
 * 解析 setTransform 命令字符串，提取变换对象和目标
 * @param sentence - 命令字符串
 * @returns { transformObj, target }
 */
// export function parseSetTransformCommand(sentence: ISentence) {
//   let transformObj: any;
//   let target: number | string | undefined;
//   console.log('$$$', JSON.stringify(sentence));

//   // if (part.startsWith('setTransform:')) {
//   //   try {
//   //     transformObj = JSON.parse(jsonStr);
//   //   } catch (e) {
//   //     console.error('Failed to parse transform JSON:', jsonStr, e);
//   //   }
//   // } else if (part.startsWith('-target=')) {
//   //   // 提取目标值，并移除末尾分号
//   //   target = part.replace('-target=', '').replace(/;$/, '');
//   // }

//   return { transformObj, target };
// }

/**
 * 根据 setTransform 寻找到对应的 changeFigure 语句
 * @param target - 目标值
 * @param scenePath - 场景文件路径
 * @returns changeFigure 语句
 */
export async function SetFtoChangeF(target: string, scenePath: string, lineNumber: number): Promise<string> {
  const sceneTXT = await GetSceneTXT(scenePath);
  const lines = sceneTXT.split('\n').slice(0, lineNumber - 1).reverse();
  const direction = target.replace('fig-', '');
  const line = lines.find((item) => {
    if (!item.trim().startsWith('changeFigure:')) return false;
    if (target.startsWith('fig-')) {
      return !/-id=/.test(item) && parseFigureCommand(item).direction === direction;
    }
    return item.match(/-id=([^\s;]+)/)?.[1] === target;
  });
  if (!line) throw new Error('未找到对应的 changeFigure 语句');
  return line.trim();
}

/**
 * 根据目标获取素材信息和方位
 * @param target - 目标值
 * @param scenePath - 场景文件路径
 * @param lineNumber - 行号
 * @returns 素材信息和方位
 */
export async function GetImgPathAndDirection(
  target: string,
  scenePath: string,
  lineNumber: number,
): Promise<{ fileName: string; directory: string; direction: string }> {
  if (target === 'stage-main') throw new Error('舞台没有单一素材');
  if (target === 'bg-main') {
    const sceneTXT = await GetSceneTXT(scenePath);
    const line = sceneTXT.split('\n').slice(0, lineNumber - 1).reverse()
      .find((item) => item.trim().startsWith('changeBg:'));
    if (!line) throw new Error('未找到对应的 changeBg 语句');
    return { fileName: line.trim().replace(/^changeBg:/, '').split(' -')[0].split(';')[0].trim(), directory: 'background', direction: 'center' };
  }
  const ChangeF = await SetFtoChangeF(target, scenePath, lineNumber);
  const { direction } = parseFigureCommand(ChangeF);
  const fileName = ChangeF.replace(/changeFigure:/, '')
    .split(' -')[0]
    .split(';')[0]
    .trim(); // 提取文件名部分
  return { fileName, directory: 'figure', direction };
}

/**
 * 更新 frame 状态（将字符串解析出来的数据应用到拖拽框上）
 * @param direction - 方向
 * @param transformObj - 变换对象
 * @param width - 可选宽度
 * @param height - 可选高度
 * @param parent - 父元素
 * @param setFrame - setFrame 函数
 */
// eslint-disable-next-line max-params
export function updateFrameState(
  direction: string,
  transformObj: any,
  width?: number,
  height?: number,
  parent?: HTMLElement | null,
  setFrame?: (updater: (prev: any) => any) => void,
) {
  if (!setFrame) return;

  const position = transformObj?.position ? convertPreviewToControl(transformObj.position, parent) : { x: 0, y: 0 };

  setFrame((prev) => ({
    ...prev,
    translate: [position.x + ToXOffset(direction, parent, width || prev.width), position.y],
    scale: [transformObj?.scale?.x ?? 1, transformObj?.scale?.y ?? 1],
    rotate: radiansToDegrees(transformObj?.rotation ?? 0),
    width: width || prev.width,
    height: height || prev.height,
  }));
}
