import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import Moveable from 'react-moveable';
import { eventBus } from "@/utils/eventBus";
import axios from 'axios';
import { api } from '@/api';

interface TransformableBoxProps {
  parents?: MutableRefObject<HTMLElement | null> | null;
  onChange?: (state: { x: number; y: number; width: number; height: number; rotation: number }) => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({
  parents = null,
  onChange,
}) => {
  // 预览窗口的大小
  const previewWindow = {
    width: 2560,
    height: 1440,
  };
  // 组件状态
  const [frame, setFrame] = useState({
    translate: [0, 0] as [number, number],
    rotate: 0,
    scale: [1, 1] as [number, number],
    width: 200,
    height: 200,
  });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [keepRatio, setKeepRatio] = useState(true); // 是否保持宽高比
  const [isDisplay, setIsDisplay] = useState(false); // 控制框是否显示
  const [remountKey, setRemountKey] = useState(0); // 用于强制重新挂载 Moveable,一个刷新的作用。
  const commandContextRef = useRef<{ targetPath: string, lineNumber: number, lineContent: string } | null>(null);
  const lastParentSize = useRef<{ width: number; height: number } | null>(null);

  // 监听 点击 事件
  useEffect(() => {
    function handlePixiSyncCommand(event: unknown) {
      if (!(event as { lineContent: string }).lineContent.includes('changeFigure')) {
        setIsDisplay(false);
        return;
      }
      const filePath = convertCommandPathToFilePath(// 提取图片路径
        (event as { lineContent: string; targetPath: string }).lineContent,
        (event as { lineContent: string; targetPath: string }).targetPath
      ) || '';
      api.assetsControllerGetImageDimensions(filePath).then(res => {
        const scaledSize = calculateScaledImageSize(res.data.width, res.data.height);// 为了适配游戏引擎里面原本的逻辑，让图片能够完整地被容纳。
        const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height });
        const { direction, transformObj } = parseFigureCommand((event as { lineContent: string }).lineContent);
        commandContextRef.current = { targetPath: (event as any).targetPath, lineNumber: (event as any).lineNumber, lineContent: (event as any).lineContent };
        setIsDisplay(true);
        updateFrame(direction, transformObj, size.x, size.y);// !!!注意，这里不管高和宽怎么变都不影响最终的变换结果，因为最终影响图形高宽的元素是缩放。
        setRemountKey(prevKey => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
      });
    }

    eventBus.on('pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);

  // 监听父元素宽度变化，按比例自动刷新
  useEffect(() => {
    if (!parents?.current || !isDisplay) return;

    const parentEl = parents.current;
    const resizeObserver = new ResizeObserver(() => {
      const prev = lastParentSize.current;
      const newSize = { width: parentEl.clientWidth, height: parentEl.clientHeight };

      if (prev && prev.width > 0 && prev.height > 0) {
        const scaleX = newSize.width / prev.width;
        const scaleY = newSize.height / prev.height;
        // 按比例更新 frame 状态，包括位置和尺寸
        setFrame(f => ({
          ...f,
          translate: [f.translate[0] * scaleX, f.translate[1] * scaleY],
          width: f.width * scaleX,
          height: f.height * scaleY,
        }));
        setRemountKey(k => k + 1); // 强制刷新 Moveable
      }
      lastParentSize.current = newSize;
    });

    // 初始记录
    lastParentSize.current = { width: parentEl.clientWidth, height: parentEl.clientHeight };
    resizeObserver.observe(parentEl);

    return () => resizeObserver.disconnect();
  }, [parents, isDisplay]);


  // 将字符串解析出来的数据应用到拖拽框上
  function updateFrame(direction: string, transformObj: any, width?: number, height?: number) {
    const position = transformObj?.position
      ? convertPreviewToControl(transformObj.position)
      : { x: 0, y: 0 };

    setFrame(prev => ({
      ...prev,
      translate: [
        position.x + ToXOffset(direction),
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

  // 将当前控制框的数据转换回字符串
  function FrameToString(LineContent: string | undefined): string {
    const { direction, transformObj } = parseFigureCommand(LineContent || '');
    const baseCommand = LineContent?.replace(/\s*-transform=\{[\s\S]*\};?/, '').trim() || '';// 移除原有的 -transform 部分
    // 1. 构建 transform 对象
    const newTransformObj: any = {};

    // 2. 将当前控制框的 translate（控制窗口像素）减去偏移后，转换回预览窗口的绝对坐标
    const temPosition = convertControlToPreview({
      x: frame.translate[0] - ToXOffset(direction),
      y: frame.translate[1]
    });
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

    // 4. 合并 transform 对象并生成最终字符串
    const mergedObj = Object.assign({}, transformObj || {}, newTransformObj);
    if (Object.keys(mergedObj).length === 0) {
      return baseCommand;
    }
    const transformString = `-transform=${JSON.stringify(mergedObj)}`;
    return `${baseCommand} ${transformString}`;
  }

  // 解析字符串
  function parseFigureCommand(line: string) {
    let direction: 'right' | 'left' | 'center' = 'center';
    let transformObj: any = undefined;
    const parts = line.split(/\s+/);

    for (const part of parts) {
      if (part.includes('-right')) direction = 'right';
      else if (part.includes('-left')) direction = 'left';
      else if (part.includes('-center')) direction = 'center';
      else if (part.startsWith('-transform=')) {
        // 提取 JSON 字符串，并用正则表达式安全地移除末尾可能存在的分号
        const jsonStr = part.replace('-transform=', '').replace(/;$/, '');
        try {
          transformObj = JSON.parse(jsonStr);
        } catch (e) {
          // 添加日志，方便调试
          console.error("Failed to parse transform JSON:", jsonStr, e);
        }
      }
    }
    return { direction, transformObj };
  }

  // 从组件已有的ref中获取父窗口尺寸（如果parents存在）
  const getParentWindowSize = () => {
    if (parents?.current instanceof HTMLElement) {
      return {
        width: parents.current.clientWidth,
        height: parents.current.clientHeight,
      };
    }
    // 如果没有父元素，使用默认预览窗口尺寸作为父窗口尺寸
    return previewWindow;
  };

  // 将预览窗口像素值转换为操控窗口像素值（保持视觉位置一致）
  const convertPreviewToControl = (previewPixel: { x: number; y: number }) => {
    const parentWindow = getParentWindowSize();
    return {
      x: (previewPixel.x / previewWindow.width) * parentWindow.width,
      y: (previewPixel.y / previewWindow.height) * parentWindow.height,
    };
  };

  // 将操控窗口像素值转换为预览窗口像素值（保持视觉位置一致）
  const convertControlToPreview = (parentPixel: { x: number; y: number }) => {
    const parentWindow = getParentWindowSize();
    return {
      x: (parentPixel.x / parentWindow.width) * previewWindow.width,
      y: (parentPixel.y / parentWindow.height) * previewWindow.height,
    };
  };

  // 将弧度转换为角度
  function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // 将角度转换为弧度
  function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 同步指令到文件
  async function syncCommandToFile(commandContext: any, newCommand: string) {
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

  // 将编辑器语句中的图片路径转换为实际的文件路径
  function convertCommandPathToFilePath(command: string, targetPath: string): string | null {
    const fileName = command.match(/changeFigure:([^\s-]+)/)?.[1]; // 提取文件名
    const gamePath = targetPath.match(/(games\/[^/]+)/)?.[1]; // 提取游戏目录路径
    return fileName && gamePath ? `${gamePath}/game/figure/${fileName}` : null;
  }

  // 计算图片在舞台上的缩放后尺寸
  function calculateScaledImageSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
    const scaleW = previewWindow.width / originalWidth;
    const scaleH = previewWindow.height / originalHeight;
    const targetScale = Math.min(scaleW, scaleH);
    return {
      width: originalWidth * targetScale,
      height: originalHeight * targetScale
    };
  }

  // 根据 direction 计算 x 轴偏移量
  function ToXOffset(direction: string): number {
    const parentWindow = getParentWindowSize();
    let xOffset = 0;
    if (direction === 'center') {
      xOffset = parentWindow.width / 2.97;
    } else if (direction === 'right') {
      xOffset = parentWindow.width / 1.47;
    }
    return xOffset;
  }

  return (
    <>
      {/* 占位的div */}
      <div
        ref={targetRef}
        style={{
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px) rotate(${frame.rotate}deg) scale(${frame.scale[0]}, ${frame.scale[1]})`,
        }}
      >
        <div />
      </div>
      {isDisplay && <Moveable
        key={remountKey}
        target={targetRef}
        origin={false}
        draggable={true}
        scalable={true}
        rotatable={true}
        throttleDrag={0}
        throttleScale={0}
        throttleRotate={0}
        keepRatio={keepRatio}
        rotationPosition="right"
        // 缩放开始时，根据拖动方向动态设置 keepRatio
        onScaleStart={({ direction }) => {
          const isCorner = Math.abs(direction[0]) === 1 && Math.abs(direction[1]) === 1;
          setKeepRatio(isCorner);
        }}
        // 拖拽事件
        onDrag={({ beforeTranslate }) => {
          const translate = [beforeTranslate[0], beforeTranslate[1]] as [number, number];
          setFrame(f => ({ ...f, translate }));
          onChange?.({ x: translate[0], y: translate[1], width: frame.width, height: frame.height, rotation: frame.rotate });
        }}
        // 缩放事件 - 使用 scale 而不是 resize
        onScale={({ scale, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          const scaleArray = [scale[0], scale[1]] as [number, number];
          setFrame(f => ({ ...f, scale: scaleArray, translate }));
          // 计算缩放后的实际尺寸
          const actualWidth = frame.width * scale[0];
          const actualHeight = frame.height * scale[1];
          onChange?.({ x: translate[0], y: translate[1], width: actualWidth, height: actualHeight, rotation: frame.rotate });
        }}
        // 旋转事件 - 同步旋转时的位置变化
        onRotate={({ beforeRotate, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          setFrame(f => ({ ...f, rotate: beforeRotate, translate }));
          onChange?.({ x: translate[0], y: translate[1], width: frame.width, height: frame.height, rotation: beforeRotate });
        }}
        onRenderEnd={() => {
          syncCommandToFile(commandContextRef.current, FrameToString(commandContextRef.current?.lineContent))
        }}
      />}
    </>
  );
};

export default TransformableBox;
