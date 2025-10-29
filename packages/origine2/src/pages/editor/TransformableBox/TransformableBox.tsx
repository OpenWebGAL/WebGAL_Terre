import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
// 请根据你的项目实际路径调整 eventBus 的导入路径
import { eventBus } from '../../../utils/eventBus';

interface TransformableBoxProps {
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialRotate?: number;
  onChange?: (state: { x: number; y: number; width: number; height: number; rotation: number }) => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({
  initialX = 0,
  initialY = 0,
  initialWidth = 200,
  initialHeight = 140,
  initialRotate = 0,
  onChange,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const [frame, setFrame] = useState({
    translate: [initialX, initialY] as [number, number],
    rotate: initialRotate,
    scale: [1, 1] as [number, number],
    width: initialWidth,
    height: initialHeight,
  });
  // 动态控制 keepRatio
  const [keepRatio, setKeepRatio] = useState(true);

  useEffect(() => {
    function handlePixiSyncCommand(event: unknown) {
      const data = event as { targetPath: string; lineNumber: number; lineContent: any };
      // 这里写你的处理逻辑，比如同步到组件状态
      console.log('收到 pixi-sync-command:', data);
      // 例如：setFrame 或其他操作
    }

    eventBus.on('pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);

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
        <div/>
      </div>
      <Moveable
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
      />
    </>
  );
};

export default TransformableBox;
