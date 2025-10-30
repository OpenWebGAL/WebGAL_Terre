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
  const [keepRatio, setKeepRatio] = useState(true);
  const [isDisplay, setIsDisplay] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [originalCommand, setOriginalCommand] = useState(''); // 存储原始指令字符串
  const [commandContext, setCommandContext] = useState<{ targetPath: string, lineNumber: number } | null>(null);
  const commandContextRef = useRef<{ targetPath: string, lineNumber: number } | null>(null);

  // 监听 pixi-sync-command 事件 { targetPath: string; lineNumber: number; lineContent: any }
  useEffect(() => {
    function handlePixiSyncCommand(event: unknown) {
      if (!(event as { lineContent: string }).lineContent.includes('changeFigure')) {
        setIsDisplay(false);
        return;
      };
      debugger
      const { targetPath, lineNumber } = event as { targetPath: string; lineNumber: number; lineContent: string };
      setCommandContext({ targetPath, lineNumber });
      commandContextRef.current = { targetPath, lineNumber };
      setOriginalCommand((event as { lineContent: string }).lineContent); // 存储原始指令字符串
      const { direction, transformObj } = parseFigureCommand((event as { lineContent: string }).lineContent);
      setIsDisplay(true);
      updateFrame(direction, transformObj);
      setRemountKey(prevKey => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
    }

    eventBus.on('pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);

  // 将字符串解析出来的数据应用到拖拽框上
  function updateFrame(direction: string, transformObj: any) {
    if (!transformObj) return;
    const position = transformObj?.position
      ? convertPreviewToControl(transformObj.position)
      : { x: 0, y: 0 };
    setFrame(prev => ({
      ...prev,
      translate: [
        position.x,
        position.y
      ],
      scale: [
        transformObj?.scale?.x ?? 1,
        transformObj?.scale?.y ?? 1
      ],
      rotate: radiansToDegrees(transformObj?.rotation ?? 0),
    }));
  }

  // 将当前控制框的数据转换回字符串
  function FrameToString() {
    // 1. 将当前控制框的 translate（控制窗口像素）转换回预览窗口的绝对坐标
    const previewPixel = convertControlToPreview({ x: frame.translate[0], y: frame.translate[1] });

    // 2. 构建 transform 对象
    const transformObj: any = {};

    // 3. 计算相对于预览窗口中心的偏移量
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
    const a = (previewPixel.x / previewWindow.width)
    const b = parentWindow.width
    const c = a * b
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
          const a = FrameToString()
          debugger
          syncCommandToFile(commandContextRef.current, a)
        }}
      />}
    </>
  );
};

export default TransformableBox;
