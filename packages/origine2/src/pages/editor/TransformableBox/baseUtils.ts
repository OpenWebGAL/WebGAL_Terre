// 基础工具函数集合
import { MutableRefObject } from 'react';
import axios from 'axios';

// 预览窗口的默认尺寸（游戏引擎的标准分辨率）
const previewWindow = {
  width: 2560,
  height: 1440,
};

/**
 * 获取父窗口尺寸，如果没有父元素则返回默认预览窗口尺寸
 * @param parents - 父元素的 ref
 * @returns 窗口尺寸对象 { width, height }
 */
export const getParentWindowSize = (parents?: MutableRefObject<HTMLElement | null> | null) => {
  if (parents?.current instanceof HTMLElement) {
    return {
      width: parents.current.clientWidth,
      height: parents.current.clientHeight,
    };
  }
  // 如果没有父元素，使用默认预览窗口尺寸作为父窗口尺寸
  return previewWindow;
};

/**
 * 将预览窗口的像素坐标转换为操控窗口的像素坐标（保持视觉比例）
 * @param previewPixel - 预览窗口中的坐标 { x, y }
 * @param parents - 父元素的 ref
 * @returns 操控窗口中的坐标 { x, y }
 */
export const convertPreviewToControl = (previewPixel: { x: number; y: number }, parents?: MutableRefObject<HTMLElement | null> | null) => {
  const parentWindow = getParentWindowSize(parents);
  return {
    x: (previewPixel.x / previewWindow.width) * parentWindow.width,
    y: (previewPixel.y / previewWindow.height) * parentWindow.height,
  };
};

/**
 * 将操控窗口的像素坐标转换为预览窗口的像素坐标（保持视觉比例）
 * @param parentPixel - 操控窗口中的坐标 { x, y }
 * @param parents - 父元素的 ref
 * @returns 预览窗口中的坐标 { x, y }
 */
export const convertControlToPreview = (parentPixel: { x: number; y: number }, parents?: MutableRefObject<HTMLElement | null> | null) => {
  const parentWindow = getParentWindowSize(parents);
  return {
    x: (parentPixel.x / parentWindow.width) * previewWindow.width,
    y: (parentPixel.y / parentWindow.height) * previewWindow.height,
  };
};

/**
 * 将弧度转换为角度
 * @param radians - 弧度值
 * @returns 角度值
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 将角度转换为弧度
 * @param degrees - 角度值
 * @returns 弧度值
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 计算图片在舞台上的缩放后尺寸（确保图片完整显示）
 * @param originalWidth - 原始图片宽度
 * @param originalHeight - 原始图片高度
 * @returns 缩放后的尺寸 { width, height }
 */
export function calculateScaledImageSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
  const scaleW = previewWindow.width / originalWidth;
  const scaleH = previewWindow.height / originalHeight;
  const targetScale = Math.min(scaleW, scaleH);
  return {
    width: originalWidth * targetScale,
    height: originalHeight * targetScale
  };
}

/**
 * 将编辑器语句中的图片路径转换为实际的文件路径
 * @param command - 命令字符串（如 "changeFigure:image.png"）
 * @param targetPath - 目标路径
 * @returns 文件路径或 null
 */
export function convertCommandPathToFilePath(command: string, targetPath: string): string {
  const fileName = command.match(/changeFigure:([^\s-]+)/)?.[1]; // 提取文件名
  const gamePath = targetPath.match(/(games\/[^/]+)/)?.[1]; // 提取游戏目录路径
  return fileName && gamePath ? `${gamePath}/game/figure/${fileName}` : '';
}

/**
 *  根据路径获取场景文本内容
*/
export async function GetSceneTXT(path: string): Promise<string> {
  const res = await axios.get(path);
  return res.data.toString();
}

/**
 * 根据方向计算 X 轴偏移量（用于定位图形）
 * @param direction - 方向 ('center', 'right', 'left')
 * @param parents - 父元素的 ref
 * @returns X 轴偏移量
 */
export function ToXOffset(direction: string, parents?: MutableRefObject<HTMLElement | null> | null): number {
  const parentWindow = getParentWindowSize(parents);
  let xOffset = 0;
  if (direction === 'center') {
    xOffset = parentWindow.width / 2.97;
  } else if (direction === 'right') {
    xOffset = parentWindow.width / 1.47;
  }
  return xOffset;
}
