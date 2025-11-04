// TransformUtils.ts - 变换相关的工具函数集合
import { MutableRefObject } from 'react';
import axios from 'axios';
import { api } from '@/api';
import { eventBus } from "@/utils/eventBus";

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
 * 生成 transform 字符串（基于当前 frame 和原命令）
 * @param LineContent - 原始命令字符串
 * @param frame - 当前的 frame 状态
 * @param parents - 父元素的 ref
 * @returns transform 字符串，如 "-transform={...}"
 */
export function generateTransformString(
  LineContent: string,
  frame: { translate: [number, number]; rotate: number; scale: [number, number]; width: number; height: number },
  parents?: MutableRefObject<HTMLElement | null> | null
): string {
  const { direction, transformObj } = parseFigureCommand(LineContent);

  // 1. 构建新的 transform 对象
  const newTransformObj: any = {};

  // 2. 将当前控制框的 translate（控制窗口像素）减去偏移后，转换回预览窗口的绝对坐标
  const temPosition = convertControlToPreview({
    x: frame.translate[0] - ToXOffset(direction, parents),
    y: frame.translate[1]
  }, parents);
  if (temPosition.x !== 0 || temPosition.y !== 0) {
    newTransformObj.position = {
      x: Math.round(temPosition.x),
      y: Math.round(temPosition.y)
    };
  }

  // 3. 转换旋转和缩放（保持不变）
  const rotationInRadians = Number(degreesToRadians(frame.rotate).toFixed(2));
  if (rotationInRadians !== 0) {
    newTransformObj.rotation = rotationInRadians;
  }
  if (frame.scale[0] !== 1 || frame.scale[1] !== 1) {
    newTransformObj.scale = {
      x: Number(frame.scale[0].toFixed(1)),
      y: Number(frame.scale[1].toFixed(1))
    };
  }

  // 4. 合并 transform 对象
  const mergedObj = Object.assign({}, transformObj || {}, newTransformObj);
  if (Object.keys(mergedObj).length === 0) {
    return '';
  }
  return `-transform=${JSON.stringify(mergedObj)}`;
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
      position.x + ToXOffset(direction, parents),
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

/**
 *
 * @param commandContext - 包含 targetPath 和 lineNumber 的上下文对象
 * @param newCommand - 新的命令字符串
 * @returns
 */
export async function syncCommandToFile(commandContext: any, newCommand: string) {
  if (!commandContext) {
    console.warn('No command context available for sync');
    return;
  }

  try {
    // 1. 读取文件内容 - 使用 targetPath (完整路径)
    const response = await axios.get(commandContext.targetPath);
    const fileContent = response.data.toString();
    const lines = fileContent.split('\n');

    // 2. 替换指定行 (lineNumber 是从 1 开始的,所以需要 -1)
    const lineIndex = commandContext.lineNumber - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = newCommand;
      const newFileContent = lines.join('\n');

      // 3. 保存文件 - 使用 targetPath (完整路径) 传给后端 API
      await api.assetsControllerEditTextFile({
        path: commandContext.targetPath,  // ✅ 使用完整路径
        textFile: newFileContent
      });

      // 通知其他组件文件已更新
      eventBus.emit('drag-update-scene', {
        targetPath: commandContext.targetPath,
        lineNumber: commandContext.lineNumber,
        newCommand: newCommand
      });

      console.log('Command synced successfully:', newCommand);
    } else {
      console.error('Line number out of range:', commandContext.lineNumber, 'Total lines:', lines.length);
    }
  } catch (error) {
    console.error('Failed to sync command to file:', error);
  }
}

/**
 *  根据路径获取场景文本内容
*/
export async function GetSceneTXT(path: string): Promise<string> {
  const res = await axios.get(path);
  return res.data.toString();
}
