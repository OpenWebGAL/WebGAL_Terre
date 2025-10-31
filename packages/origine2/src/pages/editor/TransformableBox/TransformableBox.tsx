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
  const [originalCommand, setOriginalCommand] = useState(''); // 存储原始指令字符串
  const [currentDirection, setCurrentDirection] = useState<'left' | 'center' | 'right'>('center'); // 存储当前 direction
  const commandContextRef = useRef<{ targetPath: string, lineNumber: number } | null>(null);

  // 监听 pixi-sync-command 事件
  useEffect(() => {
    function handlePixiSyncCommand(event: unknown) {
      if (!(event as { lineContent: string }).lineContent.includes('changeFigure')) {
        setIsDisplay(false);
        return;
      }
      const { targetPath, lineNumber } = event as { targetPath: string; lineNumber: number; lineContent: string };
      commandContextRef.current = { targetPath, lineNumber };
      setOriginalCommand((event as { lineContent: string }).lineContent);
      const filePath = convertCommandPathToFilePath((event as { lineContent: string }).lineContent, targetPath) || '';
      api.assetsControllerGetImageDimensions(filePath).then(res => {
        debugger
        const scaledSize = calculateScaledImageSize(res.data.width, res.data.height);
        const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height });
        const { direction, transformObj } = parseFigureCommand((event as { lineContent: string }).lineContent);
        setCurrentDirection(direction); // 保存 direction 供 FrameToString 使用
        setIsDisplay(true);
        updateFrame(direction, transformObj, size.x, size.y);
        setRemountKey(prevKey => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
      });
    }

    eventBus.on('pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);

  // 将字符串解析出来的数据应用到拖拽框上
  function updateFrame(direction: string, transformObj: any, width?: number, height?: number) {
    if (!transformObj) return;
    const position = transformObj?.position
      ? convertPreviewToControl(transformObj.position)
      : { x: 0, y: 0 };
    // 根据 direction 添加 x 轴偏移
    const parentWindow = getParentWindowSize();
    let xOffset = 0;
    if (direction === 'center') {
      xOffset = parentWindow.width / 2.97;
    } else if (direction === 'right') {
      xOffset = parentWindow.width / 1.47;
    }
    // left 不加偏移，保持 0

    setFrame(prev => ({
      ...prev,
      translate: [
        position.x + xOffset,
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
  function FrameToString() {
    // 1. 减去 direction 带来的偏移量
    const parentWindow = getParentWindowSize();
    let xOffset = 0;
    if (currentDirection === 'center') {
      xOffset = parentWindow.width / 2.97;
    } else if (currentDirection === 'right') {
      xOffset = parentWindow.width / 1.47;
    }

    // 2. 将当前控制框的 translate（控制窗口像素）减去偏移后，转换回预览窗口的绝对坐标
    const previewPixel = convertControlToPreview({
      x: frame.translate[0] - xOffset,
      y: frame.translate[1]
    });

    // 3. 构建 transform 对象
    const transformObj: any = {};

    // 4. 计算相对于预览窗口中心的偏移量
    const positionX = previewPixel.x;
    const positionY = previewPixel.y
    if (positionX !== 0 || positionY !== 0) {
      transformObj.position = { x: positionX, y: positionY };
    }

    // 4. 转换旋转和缩放（保持不变）
    const rotationInRadians = degreesToRadians(frame.rotate);
    if (rotationInRadians !== 0) {
      transformObj.rotation = parseFloat(rotationInRadians.toFixed(4));
    }

    if (frame.scale[0] !== 1 || frame.scale[1] !== 1) {
      transformObj.scale = {
        x: parseFloat(frame.scale[0].toFixed(4)),
        y: parseFloat(frame.scale[1].toFixed(4))
      };
    }

    // 5. 组合成最终的指令字符串
    const commandWithoutTransform = originalCommand.replace(/\s*-transform=\{.*\}/, '').replace(/[\s\r\n;\}]+$/, '');

    if (Object.keys(transformObj).length === 0) {
      return commandWithoutTransform;
    }

    const transformString = `-transform=${JSON.stringify(transformObj)}`;
    return `${commandWithoutTransform} ${transformString}`;
  }

  // 解析字符串
  function parseFigureCommand(line: string) {
    let direction: 'right' | 'left' | 'center' = 'center';
    if (/-right(\s|$)/.test(line)) direction = 'right';
    else if (/-left(\s|$)/.test(line)) direction = 'left';
    let transformObj = undefined;
    // 更健壮地提取 -transform= 后的 JSON
    const transformIndex = line.indexOf('-transform=');
    if (transformIndex !== -1) {
      // 从 -transform= 后面开始找第一个 {，再找匹配的 }
      const jsonStart = line.indexOf('{', transformIndex);
      if (jsonStart !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < line.length; i++) {
          if (line[i] === '{') braceCount++;
          if (line[i] === '}') braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
        if (jsonEnd !== -1) {
          const jsonStr = line.slice(jsonStart, jsonEnd + 1);
          try {
            transformObj = JSON.parse(jsonStr);
          } catch (e) {
            transformObj = undefined;
          }
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
        eventBus.emit('drag-update-scene');

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
    const scaleX = previewWindow.width / originalWidth;
    const scaleY = previewWindow.height / originalHeight;
    const targetScale = Math.min(scaleX, scaleY);
    return {
      width: originalWidth * targetScale,
      height: originalHeight * targetScale
    };
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
          syncCommandToFile(commandContextRef.current, FrameToString())
        }}
      />}
    </>
  );
};

export default TransformableBox;
