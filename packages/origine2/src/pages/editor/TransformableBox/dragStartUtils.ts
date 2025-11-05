// 鼠标按下触发相关函数
import { MutableRefObject } from 'react';
import axios from 'axios';
import { convertControlToPreview, ToXOffset, degreesToRadians, convertPreviewToControl, radiansToDegrees, GetSceneTXT, convertCommandPathToFilePath } from './baseUtils';

/**
 * 解析 changeFigure 命令字符串，提取方向和变换对象
 * @param line - 命令字符串
 * @returns { direction, transformObj }
 */
export function parseFigureCommand(line: string) {
  let direction: 'right' | 'left' | 'center' = 'center';
  let transformObj: any = undefined;
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
        console.error("Failed to parse transform JSON:", jsonStr, e);
      }
    }
  }
  return { direction, transformObj };
}

/**
 * 解析 setTransform 命令字符串，提取变换对象和目标
 * @param line - 命令字符串
 * @returns { transformObj, target }
 */
export function parseSetTransformCommand(line: string) {
  let transformObj: any = undefined;
  let target: number | string | undefined = undefined;
  const parts = line.split(/\s+/);

  for (const part of parts) {
    if (part.startsWith('setTransform:')) {
      // 提取 JSON 字符串，并安全移除末尾分号
      const jsonStr = part.replace('setTransform:', '').replace(/;$/, '');
      try {
        transformObj = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse transform JSON:", jsonStr, e);
      }
    } else if (part.startsWith('-target=')) {
      // 提取目标值，并移除末尾分号
      target = part.replace('-target=', '').replace(/;$/, '');
    }
  }
  return { transformObj, target };
}

/**
 * 根据 setTransform 寻找到对应的 changeFigure 语句
 * @param target - 目标值
 * @param targetPath - 目标文件路径
 * @returns changeFigure 语句
*/
export async function SetFtoChangeF(target: string, targetPath: string): Promise<string> {
  const sceneTXT = await GetSceneTXT(targetPath);
  const lines = sceneTXT.split('\n');
  for (const line of lines) {
    const match = line.match(/-id=([^\s;]+)/);
    if (match && match[1] === target) {
      return line.trim();
    }
  }
  throw new Error('未找到对应的 changeFigure 语句');
}

/**
 * 根据 setTransform 语句获取图片路径和方向
 * @param target - 目标值
 * @param targetPath - 目标文件路径
 * @returns 图片路径和方向
*/
export async function GetImgPathAndDirection(target: string, targetPath: string): Promise<{ imgPath: string, direction: string }> {
  const ChangeF = await SetFtoChangeF(target, targetPath);
  const { direction } = parseFigureCommand(ChangeF);
  const imgPath = convertCommandPathToFilePath(ChangeF, targetPath);
  return { imgPath, direction };
}

/**
 * 更新 frame 状态（将字符串解析出来的数据应用到拖拽框上）
 * @param direction - 方向
 * @param transformObj - 变换对象
 * @param width - 可选宽度
 * @param height - 可选高度
 * @param parents - 父元素的 ref
 * @param setFrame - setFrame 函数
 */
export function updateFrameState(
  direction: string,
  transformObj: any,
  width?: number,
  height?: number,
  parents?: MutableRefObject<HTMLElement | null> | null,
  setFrame?: (updater: (prev: any) => any) => void
) {
  if (!setFrame) return;

  const position = transformObj?.position
    ? convertPreviewToControl(transformObj.position, parents)
    : { x: 0, y: 0 };

  setFrame(prev => ({
    ...prev,
    translate: [
      position.x + ToXOffset(direction, parents, width || prev.width),
      position.y
    ],
    scale: [
      transformObj?.scale?.x ?? 1,
      transformObj?.scale?.y ?? 1
    ],
    rotate: radiansToDegrees(transformObj?.rotation ?? 0),
    width: width || prev.width,
    height: height || prev.height,
  }));
}
