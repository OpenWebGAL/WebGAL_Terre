import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import Moveable from 'react-moveable';
import { eventBus } from '@/utils/eventBus';
import { api } from '@/api';
import {
  calculateScaledImageSize,
  convertPreviewToControl,
  convertControlToPreview,
  radiansToDegrees,
  degreesToRadians,
  convertCommandPathToFilePath,
} from './baseUtils';
import {
  parseFigureCommand,
  updateFrameState,
  parseSetTransformCommand,
  GetImgPathAndDirection,
} from './dragStartUtils';
import { syncCommandToFile, generateMergeTransform } from './dragEndUtils';

interface TransformableBoxProps {
  parents?: MutableRefObject<HTMLElement | null> | null;
  onChange?: (state: { x: number; y: number; width: number; height: number; rotation: number }) => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({ parents = null, onChange }) => {
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
  const commandContextRef = useRef<{
    targetPath: string;
    lineNumber: number;
    lineContent: string;
    direction: string;
  } | null>(null);
  const lastParentSize = useRef<{ width: number; height: number } | null>(null);

  // 监听 点击事件
  useEffect(() => {
    function handlePixiSyncCommand(event: { targetPath: string; lineNumber: number; lineContent: string }) {
      if (event.lineContent.includes('changeFigure') && !/changeFigure:\s*none\b/.test(event.lineContent)) {
        ChangeFigure(event);
      } else if (event.lineContent.includes('setTransform')) {
        SetTransform(event);
      } else {
        setIsDisplay(false);
        return;
      }
    }
    eventBus.on('editor:pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('editor:pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);
  // 主要逻辑
  const ChangeFigure = (event: any) => {
    const filePath =
      convertCommandPathToFilePath(
        // 提取图片路径
        (event as { lineContent: string }).lineContent,
        (event as { targetPath: string }).targetPath,
      ) || '';
    api.assetsControllerGetImageDimensions(filePath).then((res) => {
      const scaledSize = calculateScaledImageSize(res.data.width, res.data.height); // 为了适配游戏引擎里面原本的逻辑，让图片能够完整地被容纳。
      const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height }, parents);
      const { direction, transformObj } = parseFigureCommand((event as { lineContent: string }).lineContent);
      commandContextRef.current = { ...event, direction };
      setIsDisplay(true);
      updateFrame(direction, transformObj, size.x, size.y); // !!!注意，这里不管高和宽怎么变都不影响最终的变换结果，因为最终影响图形高宽的元素是缩放。
      setRemountKey((prevKey) => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
    });
  };

  const SetTransform = (event: any) => {
    const { transformObj, target } = parseSetTransformCommand((event as { lineContent: string }).lineContent);
    GetImgPathAndDirection(target as string, (event as { targetPath: string }).targetPath).then(
      ({ imgPath, direction }) => {
        api.assetsControllerGetImageDimensions(imgPath).then((imgRes) => {
          const scaledSize = calculateScaledImageSize(imgRes.data.width, imgRes.data.height);
          const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height }, parents);
          commandContextRef.current = { ...event, direction };
          setIsDisplay(true);
          updateFrame(direction, transformObj, size.x, size.y);
          setRemountKey((prevKey) => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
        });
      },
    );
  };

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
        setFrame((f) => ({
          ...f,
          translate: [f.translate[0] * scaleX, f.translate[1] * scaleY],
          width: f.width * scaleX,
          height: f.height * scaleY,
        }));
        setRemountKey((k) => k + 1); // 强制刷新 Moveable
      }
      lastParentSize.current = newSize;
    });

    // 初始记录
    lastParentSize.current = { width: parentEl.clientWidth, height: parentEl.clientHeight };
    resizeObserver.observe(parentEl);

    return () => resizeObserver.disconnect();
  }, [isDisplay]);

  // 将字符串解析出来的数据应用到拖拽框上
  // eslint-disable-next-line max-params
  function updateFrame(direction: string, transformObj: any, width?: number, height?: number) {
    updateFrameState(direction, transformObj, width, height, parents, setFrame);
  }

  // 将当前控制框的数据转换回ChangeFigure
  function FrameToChangeFigure(LineContent: string | undefined): string {
    const baseCommand = LineContent?.replace(/\s*-transform=\{[\s\S]*\};?/, '').trim() || '';
    const { direction, transformObj } = parseFigureCommand(LineContent || '');
    const transformString = JSON.stringify(generateMergeTransform(transformObj, direction, frame, parents));
    if (transformString) {
      return `${baseCommand} -transform=${transformString}`;
    }
    return baseCommand;
  }

  // 将当前控制框的数据转换回setTransform
  function FrameToSetTransform(LineContent: string | undefined, direction: string): string {
    const tailCommand = LineContent?.replace(/^setTransform:[^\s]+(\s*)/, '') || '';
    const { transformObj, target } = parseSetTransformCommand(LineContent || '');
    const mergedTransformObj = generateMergeTransform(transformObj, direction, frame, parents);
    return 'setTransform:' + JSON.stringify(mergedTransformObj) + (tailCommand ? ` ${tailCommand}` : '');
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
      {isDisplay && (
        <Moveable
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
            setFrame((f) => ({ ...f, translate }));
            onChange?.({
              x: translate[0],
              y: translate[1],
              width: frame.width,
              height: frame.height,
              rotation: frame.rotate,
            });
          }}
          // 缩放事件
          onScale={({ scale, drag }) => {
            const translate = drag.beforeTranslate as [number, number];
            const scaleArray = [scale[0], scale[1]] as [number, number];
            setFrame((f) => ({ ...f, scale: scaleArray, translate }));
            const actualWidth = frame.width * scale[0];
            const actualHeight = frame.height * scale[1];
            onChange?.({
              x: translate[0],
              y: translate[1],
              width: actualWidth,
              height: actualHeight,
              rotation: frame.rotate,
            });
          }}
          // 旋转事件 - 同步旋转时的位置变化
          onRotate={({ beforeRotate, drag }) => {
            const translate = drag.beforeTranslate as [number, number];
            setFrame((f) => ({ ...f, rotate: beforeRotate, translate }));
            onChange?.({
              x: translate[0],
              y: translate[1],
              width: frame.width,
              height: frame.height,
              rotation: beforeRotate,
            });
          }}
          onRenderEnd={() => {
            if (commandContextRef.current?.lineContent.includes('changeFigure')) {
              syncCommandToFile(commandContextRef.current, FrameToChangeFigure(commandContextRef.current?.lineContent));
            } else if (commandContextRef.current?.lineContent.includes('setTransform')) {
              syncCommandToFile(
                commandContextRef.current,
                FrameToSetTransform(commandContextRef.current?.lineContent, commandContextRef.current.direction),
              );
            }
          }}
        />
      )}
    </>
  );
};

export default TransformableBox;
