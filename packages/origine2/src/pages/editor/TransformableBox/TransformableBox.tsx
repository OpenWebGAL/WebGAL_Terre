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
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { createId } from '@/utils/createId';
import type { ReferenceBox, Transform } from '@webgal/editor-preview-protocol';
import {
  createResolvedDragTransform,
  createSparseTransformFromTouchedPaths,
  mergeDragTransforms,
  type DragTransformPath,
  type ResolvedDragTransform,
} from './dragTransformResolver';
import {
  createFrameFromReferenceBox,
  createTransformFromReferenceFrame,
  isWriteDefaultDisabled,
  resolveTransformTarget,
  type TransformFrame,
} from './referenceBoxGeometry';

interface TransformableBoxProps {
  parent: HTMLElement;
  sentenceInfo: {
    scenePath: string;
    lineNumber: number;
    lineContent: string;
    lineSentence: ISentence;
    transform: string;
  };
  onSupportChange?: (supported: boolean) => void;
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
  onBaselineChange?: (transform: Transform | undefined) => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({
  parent,
  sentenceInfo,
  onSupportChange,
  onDragging,
  onDragEnd,
  onBaselineChange,
}) => {
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
  const [isReady, setIsReady] = useState(false);
  const [remountKey, setRemountKey] = useState(0); // 用于强制重新挂载 Moveable,一个刷新的作用。
  const lastParentSize = useRef<{ width: number; height: number } | null>(null); // 记录这个，当父元素宽度变化时使用
  const isWindowAdjustment = useEditorStore.use.isWindowAdjustment();
  const querySessionRef = useRef<{
    referenceBox: ReferenceBox;
    resolvedTransform: ResolvedDragTransform;
  } | null>(null);
  const infoRef = useRef<{
    sentence: { scenePath: string; lineNumber: number; lineContent: string; lineSentence: ISentence | null };
    transformObj: Transform;
    figure: { fileName: string; type: string; direction: string; width: number; height: number };
  } | null>(null);
  const getParentSize = useCallback(() => ({
    width: parent.clientWidth,
    height: parent.clientHeight,
  }), [parent]);
  // 计算出拖拽框的位置并更新
  const updateFrame = useCallback(() => {
    const querySession = querySessionRef.current;
    if (querySession) {
      const nextFrame = createFrameFromReferenceBox(
        querySession.referenceBox,
        querySession.resolvedTransform.displayTransform,
        getParentSize(),
      );
      frameState.set({
        ...frameState.value,
        ...nextFrame,
      });
      tempState.set(nextFrame);
      return;
    }

    const position = infoRef.current?.transformObj.position
      ? convertPreviewToControl({
        x: infoRef.current.transformObj.position.x ?? 0,
        y: infoRef.current.transformObj.position.y ?? 0,
      }, parent)
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
      scale: [infoRef.current!.transformObj.scale?.x ?? 1, infoRef.current!.transformObj.scale?.y ?? 1],
      rotate: radiansToDegrees(infoRef.current!.transformObj.rotation ?? 0),
      width: size.x,
      height: size.y,
    });
    tempState.set(frameState.value);
  }, []);

  const fallbackToLegacy = useCallback((transformObj: Transform) => {
    querySessionRef.current = null;
    onBaselineChange?.(undefined);
    if (
      sentenceInfo.lineContent.startsWith('changeFigure') ||
      sentenceInfo.lineContent.startsWith('setTransform')
    ) {
      EditorPreviewClient.sendSyncScene({
        scenePath: sentenceInfo.scenePath,
        lineNumber: sentenceInfo.lineNumber,
        lineCommandString: sentenceInfo.lineContent,
      });
    }
    infoRef.current = {
      sentence: sentenceInfo,
      transformObj,
      figure: {
        fileName: '',
        type: '',
        direction: '',
        width: 0,
        height: 0,
      },
    };
    getFileNameAndDirection(sentenceInfo)
      .then(({ fileName, direction, directory }) => {
        return getSize(directory, fileName, sentenceInfo.scenePath).then(([width, height]) => {
          if (!infoRef.current) {
            return;
          }
          infoRef.current.figure = {
            fileName,
            type: fileName.endsWith('.json') ? 'json' : 'image',
            direction,
            width,
            height,
          };
          updateFrame();
          setIsReady(true);
          onSupportChange?.(true);
        });
      })
      .catch(() => {
        onSupportChange?.(false);
      });
  }, [sentenceInfo, updateFrame, onSupportChange, onBaselineChange]);

  const initializeQuerySession = useCallback(async (
    explicitTransform: Transform,
    isSessionActive: () => boolean,
  ) => {
    const target = resolveTransformTarget(sentenceInfo);
    if (!target) {
      return false;
    }

    try {
      const baseTransform = await EditorPreviewClient.queryBaseTransform();
      let inheritedTransform: Transform | undefined;
      if (
        sentenceInfo.lineContent.startsWith('setTransform') &&
        isWriteDefaultDisabled(sentenceInfo.lineSentence)
      ) {
        const transformBaselineRevision = createId();
        EditorPreviewClient.sendSyncScene({
          scenePath: sentenceInfo.scenePath,
          lineNumber: sentenceInfo.lineNumber,
          lineCommandString: sentenceInfo.lineContent,
          force: true,
          settleMode: 'immediate',
          transformBaselineRevision,
        });
        const baseline = await EditorPreviewClient.queryTransformBaseline(
          target,
          transformBaselineRevision,
        );
        if (!isSessionActive()) {
          return true;
        }
        if (baseline.status === 'ready') {
          inheritedTransform = baseline.transform;
        }
      } else {
        EditorPreviewClient.sendSyncScene({
          scenePath: sentenceInfo.scenePath,
          lineNumber: sentenceInfo.lineNumber,
          lineCommandString: sentenceInfo.lineContent,
          force: true,
          settleMode: 'immediate',
        });
      }

      const referenceBox = await EditorPreviewClient.queryReferenceBox(target);
      if (!isSessionActive()) {
        return true;
      }
      if (referenceBox.status !== 'ready') {
        return false;
      }

      const resolvedTransform = createResolvedDragTransform({
        explicitTransform,
        baseTransform: baseTransform.baseTransform,
        inheritedTransform,
      });
      onBaselineChange?.(resolvedTransform.baselineTransform);
      querySessionRef.current = {
        referenceBox: referenceBox.box,
        resolvedTransform,
      };
      infoRef.current = {
        sentence: sentenceInfo,
        transformObj: resolvedTransform.displayTransform,
        figure: {
          fileName: '',
          type: '',
          direction: '',
          width: referenceBox.box.width,
          height: referenceBox.box.height,
        },
      };
      updateFrame();
      setIsReady(true);
      onSupportChange?.(true);
      return true;
    } catch {
      querySessionRef.current = null;
      onBaselineChange?.(undefined);
      return false;
    }
  }, [sentenceInfo, updateFrame, onSupportChange, onBaselineChange]);

  // 信息录入与初始位置设置
  useEffect(() => {
    let transformObj: Transform;
    try {
      transformObj = JSON.parse(sentenceInfo.transform || '{}');
      if (!transformObj || typeof transformObj !== 'object' || Array.isArray(transformObj)) throw new Error();
    } catch {
      onSupportChange?.(false);
      return;
    }
    setIsReady(false);
    onBaselineChange?.(undefined);
    const capabilityState = EditorPreviewClient.getPreviewQueryCapabilityState();
    if (capabilityState === 'unsupported') {
      fallbackToLegacy(transformObj);
      return;
    }

    let isStale = false;
    initializeQuerySession(transformObj, () => !isStale).then((initialized) => {
      if (isStale || initialized) {
        return;
      }

      fallbackToLegacy(transformObj);
    });

    return () => {
      isStale = true;
    };
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
      x?: number;
      y?: number;
      scaleX?: number;
      scaleY?: number;
      rotation?: number;
    }) => {
      if (!infoRef.current) {
        return;
      }
      if (querySessionRef.current) {
        const nextExplicitTransform = mergeDragTransforms(
          querySessionRef.current.resolvedTransform.explicitTransform,
          {
            position: {
              ...(typeof transform.x === 'number' ? { x: transform.x } : {}),
              ...(typeof transform.y === 'number' ? { y: transform.y } : {}),
            },
            scale: {
              ...(typeof transform.scaleX === 'number' ? { x: transform.scaleX } : {}),
              ...(typeof transform.scaleY === 'number' ? { y: transform.scaleY } : {}),
            },
            ...(typeof transform.rotation === 'number'
              ? { rotation: transform.rotation }
              : {}),
          },
        );
        querySessionRef.current.resolvedTransform.explicitTransform = nextExplicitTransform;
        querySessionRef.current.resolvedTransform.displayTransform = mergeDragTransforms(
          querySessionRef.current.resolvedTransform.baselineTransform,
          nextExplicitTransform,
        );
        updateFrame();
        refresh();
        return;
      }
      querySessionRef.current = null;
      infoRef.current.transformObj = {
        position: {
          x: transform.x ?? 0,
          y: transform.y ?? 0,
        },
        scale: {
          x: transform.scaleX ?? 1,
          y: transform.scaleY ?? 1,
        },
        rotation: transform.rotation ?? 0,
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

      if (querySessionRef.current) {
        updateFrame();
        refresh();
        lastParentSize.current = newSize;
        return;
      }

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

  if (!isReady) return null;

  const getCurrentTransform = (frame: TransformFrame, touchedPath: DragTransformPath): Transform => {
    const querySession = querySessionRef.current;
    if (!querySession) {
      const legacyTransform = getFigureTransformFromFrameInfo(infoRef.current?.figure.direction ?? '', frame, parent);
      return {
        position: legacyTransform.position,
        scale: legacyTransform.scale,
        rotation: legacyTransform.rotation,
      };
    }

    querySession.resolvedTransform.touchedPaths.add(touchedPath);
    const nextTransform = createTransformFromReferenceFrame(
      querySession.referenceBox,
      frame,
      getParentSize(),
    );
    querySession.resolvedTransform.displayTransform = nextTransform;
    return createSparseTransformFromTouchedPaths(
      nextTransform,
      querySession.resolvedTransform.touchedPaths,
    );
  };

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
          const nextFrame = { ...tempState.value, translate };
          tempState.set(nextFrame);
          onDragging?.(getCurrentTransform(nextFrame, 'position'));
        }}
        // 缩放开始时，根据拖动方向动态设置 keepRatio
        onScaleStart={({ direction }) => {
          const isCorner = Math.abs(direction[0]) === 1 && Math.abs(direction[1]) === 1;
          setKeepRatio(isCorner);
        }}
        onScale={({ scale, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          const scaleArray = [scale[0], scale[1]] as [number, number];
          const nextFrame = { ...tempState.value, scale: scaleArray, translate };
          tempState.set(nextFrame);
          onDragging?.(getCurrentTransform(nextFrame, 'scale'));
        }}
        // 旋转事件 - 同步旋转时的位置变化
        onRotate={({ beforeRotation, drag }) => {
          const translate = drag.beforeTranslate as [number, number];
          const nextFrame = { ...tempState.value, rotate: beforeRotation, translate };
          tempState.set(nextFrame);
          onDragging?.(getCurrentTransform(nextFrame, 'rotation'));
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
    return { fileName, direction, directory: 'figure' };
  }
  if (event.lineContent.startsWith('changeBg') && !/changeBg:\s*none/.test(event.lineContent)) {
    const fileName = event.lineSentence?.content || '';
    const direction = parseFigureCommand(event.lineContent).direction;
    return { fileName, direction, directory: 'background' };
  }
  if (event.lineContent.startsWith('setTransform')) {
    const target = event.lineSentence?.args.find((arg) => arg.key === 'target')?.value;
    const res = await GetImgPathAndDirection(target as string, event.scenePath, event.lineNumber);
    return res;
  }
  if (event.lineContent.startsWith('setTempAnimation')) {
    const target = event.lineSentence?.args.find((arg) => arg.key === 'target')?.value;
    const res = await GetImgPathAndDirection(target as string, event.scenePath, event.lineNumber);
    return res;
  }
  return { fileName: '', direction: '', directory: '' };
};

const getSize = async (directory: string, fileName: string, scenePath: string) => {
  if (fileName === 'none' || fileName === '') {
    throw new Error('Empty image resource');
  }
  let size: [number, number];
  if (!fileName.endsWith('.json')) {
    const filePath = convertCommandPathToFilePath(directory, fileName, scenePath) || ''; // 提取图片路径
    const res = await api.assetsControllerGetImageDimensions(filePath);
    size = [res.data.width, res.data.height];
  } else {
    const { width, height } = await getLive2dSize();
    size = [width, height];
  }
  if (size.some((value) => !Number.isFinite(value) || value <= 0)) throw new Error('Invalid image dimensions');
  return size;
};
