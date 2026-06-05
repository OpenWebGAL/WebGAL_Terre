import React, { useRef, useState, useEffect, useCallback } from 'react';
import Moveable from 'react-moveable';
import { eventBus } from '@/utils/eventBus';
import { api } from '@/api';
import {
  calculateScaledImageSize,
  convertPreviewToControl,
  radiansToDegrees,
  convertCommandPathToFilePath,
  getLive2dSize,
} from './baseUtils';
import { parseFigureCommand, GetImgPathAndDirection } from './dragStartUtils';
import { getFigureTransformFromFrameInfo } from './dragEndUtils';
import { ISentence } from 'webgal-parser/src/interface/sceneInterface';
import { useValue } from '@/hooks/useValue';
import { ToXOffset } from './baseUtils';
import useEditorStore from '@/store/useEditorStore';

interface TransformableBoxProps {
  parent: HTMLElement;
  sentenceInfo: {
    scenePath: string;
    lineNumber: number;
    lineContent: string;
    lineSentence: ISentence;
  };
  onDragging?: (transform: {
    position?: {
      x?: number;
      y?: number;
    };
    scale?: {
      x?: number;
      y?: number;
    };
    rotation?: number;
  }) => void;
  onDragEnd?: () => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({ parent, sentenceInfo, onDragging, onDragEnd }) => {
  const moveableRef = useRef<Moveable>(null);
  // 拖拽框状态
  const frameState = useValue({
    translate: [0, 0] as [number, number],
    rotate: 0,
    scale: [1, 1] as [number, number],
    width: 200,
    height: 200,
  });
  // 临时状态
  const tempState = useValue({
    translate: [0, 0] as [number, number],
    rotate: 0,
    scale: [1, 1] as [number, number],
    width: 200,
    height: 200,
  });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [keepRatio, setKeepRatio] = useState(true); // 是否保持宽高比
  const [remountKey, setRemountKey] = useState(0); // 用于强制重新挂载 Moveable,一个刷新的作用。
  const lastParentSize = useRef<{ width: number; height: number } | null>(null); // 记录这个，当父元素宽度变化时使用
  const isWindowAdjustment = useEditorStore.use.isWindowAdjustment();
  const infoRef = useRef<{
    sentence: { scenePath: string; lineNumber: number; lineContent: string; lineSentence: ISentence | null };
    transformObj: { position: { x: number; y: number }; rotation: number; scale: { x: number; y: number } };
    figure: { fileName: string; type: string; direction: string; width: number; height: number };
  } | null>(null);
  // 信息录入与初始位置设置
  useEffect(() => {
    infoRef.current = {
      sentence: sentenceInfo,
      transformObj: parseFigureCommand(sentenceInfo.lineContent).transformObj,
      figure: {
        fileName: '',
        type: '',
        direction: '',
        width: 0,
        height: 0,
      },
    };
    getFileNameAndDirection(sentenceInfo).then(({ fileName, direction }) => {
      const directory = sentenceInfo.lineSentence.commandRaw === 'changeBg' ? 'background' : 'figure';
      getSize(directory, fileName, sentenceInfo.scenePath).then(([width, height]) => {
        infoRef.current!.figure = {
          fileName,
          type: fileName.endsWith('.json') ? 'json' : 'image',
          direction,
          width,
          height,
        };
      });
    });
  }, []);

  // 计算出拖拽框的位置并更新
  const updateFrame = useCallback(() => {
    const position = infoRef.current?.transformObj.position
      ? convertPreviewToControl(infoRef.current.transformObj.position, parent)
      : { x: 0, y: 0 };

    const scaledSize = calculateScaledImageSize(
      infoRef.current?.figure.width ?? 0,
      infoRef.current?.figure.height ?? 0,
    );
    const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height }, parent);

    frameState.set({
      ...frameState.value,
      translate: [
        position.x + ToXOffset(infoRef.current!.figure.direction ?? '', parent, size.x ?? frameState.value.width),
        position.y,
      ],
      scale: [infoRef.current!.transformObj.scale.x, infoRef.current!.transformObj.scale.y],
      rotate: radiansToDegrees(infoRef.current!.transformObj.rotation),
      width: size.x,
      height: size.y,
    });
    tempState.set(frameState.value);
  }, []);
  // 刷新
  const refresh = useCallback(() => {
    if (moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, []);

  useEffect(() => {
    if (isWindowAdjustment) {
      updateFrame();
      setRemountKey((prev) => prev + 1); // 强制重新挂载 Moveable 以适应新的窗口调整
    }
  }, [isWindowAdjustment]);

  // 拖拽框移动
  useEffect(() => {
    const handleSyncDragger = (transform: {
      x: number;
      y: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    }) => {
      if (!infoRef.current) {
        return;
      }
      infoRef.current.transformObj = {
        position: {
          x: transform.x,
          y: transform.y,
        },
        scale: {
          x: transform.scaleX,
          y: transform.scaleY,
        },
        rotation: transform.rotation,
      };
      updateFrame();
      refresh();
    };
    eventBus.on('editor:sync-dragger', handleSyncDragger);
    return () => {
      eventBus.off('editor:sync-dragger', handleSyncDragger);
    };
  }, []);

  // 监听父元素宽度变化，按比例自动刷新
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const prev = lastParentSize.current;
      const newSize = { width: parent.clientWidth, height: parent.clientHeight };

      if (prev && prev.width > 0 && prev.height > 0) {
        const scaleX = newSize.width / prev.width;
        const scaleY = newSize.height / prev.height;
        // 按比例更新 frame 状态，包括位置和尺寸
        frameState.set({
          ...frameState.value,
          translate: [frameState.value.translate[0] * scaleX, frameState.value.translate[1] * scaleY],
          width: frameState.value.width * scaleX,
          height: frameState.value.height * scaleY,
        });
        refresh();
      }
      lastParentSize.current = newSize;
    });

    // 初始记录
    lastParentSize.current = { width: parent.clientWidth, height: parent.clientHeight };
    resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      style={{
        display: isWindowAdjustment ? 'block' : 'none',
        pointerEvents: isWindowAdjustment ? 'auto' : 'none',
      }}
    >
      {/* 占位的div */}
      <div
        ref={targetRef}
        style={{
          width: `${frameState.value.width}px`,
          height: `${frameState.value.height}px`,
          transform: `translate(${frameState.value.translate[0]}px, ${frameState.value.translate[1]}px) rotate(${frameState.value.rotate}deg) scale(${frameState.value.scale[0]}, ${frameState.value.scale[1]})`,
        }}
      >
        <div />
      </div>
      <Moveable
        ref={moveableRef}
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
        // 拖拽事件
        onDrag={({ beforeTranslate }) => {
          const translate = [beforeTranslate[0], beforeTranslate[1]] as [number, number];
          tempState.set({ ...tempState.value, translate });
          onDragging?.(
            getFigureTransformFromFrameInfo(infoRef.current?.figure.direction ?? '', tempState.value, parent),
          );
        }}
        // 缩放开始时，根据拖动方向动态设置 keepRatio
        onScaleStart={({ direction }) => {
          const isCorner = Math.abs(direction[0]) === 1 && Math.abs(direction[1]) === 1;
          setKeepRatio(isCorner);
        }}
        onScale={({ scale, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          const scaleArray = [scale[0], scale[1]] as [number, number];
          tempState.set({ ...tempState.value, scale: scaleArray, translate });
          onDragging?.(
            getFigureTransformFromFrameInfo(infoRef.current?.figure.direction ?? '', tempState.value, parent),
          );
        }}
        // 旋转事件 - 同步旋转时的位置变化
        onRotate={({ beforeRotation, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          tempState.set({ ...tempState.value, rotate: beforeRotation, translate });
          onDragging?.(
            getFigureTransformFromFrameInfo(infoRef.current?.figure.direction ?? '', tempState.value, parent),
          );
        }}
        // 渲染结束事件
        onRenderEnd={() => {
          onDragEnd?.();
        }}
      />
    </div>
  );
};

export default TransformableBox;

const getFileNameAndDirection = async (event: {
  scenePath: string;
  lineNumber: number;
  lineContent: string;
  lineSentence: ISentence;
}) => {
  if (event.lineContent.startsWith('changeFigure') && !/changeFigure:\s*none/.test(event.lineContent)) {
    const fileName = event.lineSentence?.content || '';
    const direction = parseFigureCommand(event.lineContent).direction;
    return { fileName, direction };
  }
  if (event.lineContent.startsWith('changeBg') && !/changeBg:\s*none/.test(event.lineContent)) {
    const fileName = event.lineSentence?.content || '';
    const direction = parseFigureCommand(event.lineContent).direction;
    return { fileName, direction };
  }
  if (event.lineContent.startsWith('setTransform')) {
    const target = event.lineSentence?.args.find((arg) => arg.key === 'target')?.value;
    const res = await GetImgPathAndDirection(target as string, event.scenePath, event.lineNumber);
    return { fileName: res.fileName, direction: res.direction };
  }
  if (event.lineContent.startsWith('setTempAnimation')) {
    const target = event.lineSentence?.args.find((arg) => arg.key === 'target')?.value;
    const res = await GetImgPathAndDirection(target as string, event.scenePath, event.lineNumber);
    return { fileName: res.fileName, direction: res.direction };
  }
  return { fileName: '', direction: '' };
};

const getSize = async (directory: string, fileName: string, scenePath: string) => {
  if (fileName === 'none' || fileName === '') {
    return [0, 0];
  }
  if (!fileName.endsWith('.json')) {
    const filePath = convertCommandPathToFilePath(directory, fileName, scenePath) || ''; // 提取图片路径
    console.log('@@@filePath', filePath);
    const res = await api.assetsControllerGetImageDimensions(filePath);
    return [res.data.width, res.data.height];
  } else {
    const { width, height } = await getLive2dSize();
    return [width, height];
  }
};
