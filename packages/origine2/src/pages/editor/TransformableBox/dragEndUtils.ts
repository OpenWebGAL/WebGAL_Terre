// 鼠标松开触发相关函数
import axios from 'axios';
import { api } from '@/api';
import { eventBus } from "@/utils/eventBus";
import { MutableRefObject } from 'react';
import { convertControlToPreview, ToXOffset, degreesToRadians } from './baseUtils';

/**
 * 生成合并后的 Transform 对象
 * @param TransformObj - 原变换对象
 * @param direction - 初始位置
 * @param frame - 组件状态
 * @param parents - 父亲
 * @returns
 */
export function generateMergeTransform(
  TransformObj: any,
  direction: string,
  frame: { translate: [number, number]; rotate: number; scale: [number, number]; width: number; height: number },
  parents?: MutableRefObject<HTMLElement | null> | null
): any {

  // 1. 构建新的 transform 对象
  const newTransformObj: any = {};

  // 2. 将当前控制框的 translate（控制窗口像素）减去偏移后，转换回预览窗口的绝对坐标
  const temPosition = convertControlToPreview({
    x: frame.translate[0] - ToXOffset(direction, parents, frame.width),
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

  // 4. 合并新的 transform 对象到原有的 TransformObj
  const mergedObj = Object.assign({}, TransformObj || {}, newTransformObj);
  if (Object.keys(mergedObj).length === 0) {
    return null;
  }
  return mergedObj;
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
