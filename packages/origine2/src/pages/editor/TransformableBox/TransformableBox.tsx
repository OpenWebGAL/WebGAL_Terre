import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import Moveable from 'react-moveable';
import { eventBus } from "@/utils/eventBus";
import axios from 'axios';
import { api } from '@/api';
import {
  calculateScaledImageSize,
  parseFigureCommand,
  convertPreviewToControl,
  convertControlToPreview,
  radiansToDegrees,
  degreesToRadians,
  convertCommandPathToFilePath,
  syncCommandToFile,
  generateTransformString,
  updateFrameState,
  parseSetTransformCommand,
  GetSceneTXT
} from './TransformUtils';
import { error } from 'console';

interface TransformableBoxProps {
  parents?: MutableRefObject<HTMLElement | null> | null;
  onChange?: (state: { x: number; y: number; width: number; height: number; rotation: number }) => void;
}

const TransformableBox: React.FC<TransformableBoxProps> = ({
  parents = null,
  onChange,
}) => {
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

  // 监听 点击事件
  useEffect(() => {
    function handlePixiSyncCommand(event: unknown) {
      if ((event as any).lineContent.includes('changeFigure') &&
        !/changeFigure:\s*none\b/.test((event as any).lineContent)) {
        Main.ChangeFigure(event);
      }
      else if ((event as any).lineContent.includes('setTransform')) {
        Main.setTransform(event);
      }
      else {
        setIsDisplay(false);
        return;
      }
    }
    eventBus.on('pixi-sync-command', handlePixiSyncCommand);
    return () => {
      eventBus.off('pixi-sync-command', handlePixiSyncCommand);
    };
  }, []);
  // 主要逻辑
  class Main {
    static ChangeFigure(event: any) {
      const filePath = convertCommandPathToFilePath(// 提取图片路径
        (event as { lineContent: string }).lineContent,
        (event as { targetPath: string }).targetPath
      ) || '';
      api.assetsControllerGetImageDimensions(filePath).then(res => {
        const scaledSize = calculateScaledImageSize(res.data.width, res.data.height);// 为了适配游戏引擎里面原本的逻辑，让图片能够完整地被容纳。
        const size = convertPreviewToControl({ x: scaledSize.width, y: scaledSize.height }, parents);
        const { direction, transformObj } = parseFigureCommand((event as { lineContent: string }).lineContent);
        commandContextRef.current = { targetPath: (event as any).targetPath, lineNumber: (event as any).lineNumber, lineContent: (event as any).lineContent };
        setIsDisplay(true);
        updateFrame(direction, transformObj, size.x, size.y);// !!!注意，这里不管高和宽怎么变都不影响最终的变换结果，因为最终影响图形高宽的元素是缩放。
        setRemountKey(prevKey => prevKey + 1); // 强制重新挂载 Moveable 以更新位置
      });
    }
    static setTransform(event: any) {
      const { transformObj, target } = parseSetTransformCommand((event as { lineContent: string }).lineContent);
      SetTransformPatch.GetImgPath(target as string, (event as { targetPath: string }).targetPath).then(res => {
        api.assetsControllerGetImageDimensions(res).then(imgRes => {
          console.log('imgRes', imgRes);
        });
      });
    }
  }

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
    updateFrameState(direction, transformObj, width, height, parents, setFrame);
  }

  // 将当前控制框的数据转换回字符串
  function FrameToChangeFigure(LineContent: string | undefined): string {
    const baseCommand = LineContent?.replace(/\s*-transform=\{[\s\S]*\};?/, '').trim() || '';// 移除原有的 -transform 部分
    const transformString = generateTransformString(LineContent || '', frame, parents);
    if (transformString) {
      return `${baseCommand} ${transformString}`;
    }
    return baseCommand;
  }

  // 用于处理 setTransform 语句
  class SetTransformPatch {
    /**
     * 将 setTransform 语句转换为 changeFigure 语句
     * @param target - 目标值
     * @param targetPath - 目标文件路径
     * @returns changeFigure 语句
    */
    static async SetFtoChangeF(target: string, targetPath: string): Promise<string> {
      const sceneTXT = await GetSceneTXT(targetPath);
      const lines = sceneTXT.split('\n');
      for (const line of lines) {
        const match = line.match(/-id=([^\s;]+)/);
        if (match && match[1] === target) {
          return line.trim();
        }
      }
      throw new Error('未找到对应的 changeFigure 语句');
    }

    /**
     * 根据 setTransform 语句获取图片路径
     * @param target - 目标值
     * @param targetPath - 目标文件路径
     * @returns 图片路径
    */
    static async GetImgPath(target: string, targetPath: string): Promise<string> {
      const ChangeF = await SetTransformPatch.SetFtoChangeF(target, targetPath)
      return convertCommandPathToFilePath(ChangeF, targetPath)
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
        // 缩放事件
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
          if (commandContextRef.current?.lineContent.includes('changeFigure')) {
            syncCommandToFile(commandContextRef.current, FrameToChangeFigure(commandContextRef.current?.lineContent))
          }
        }}
      />}
    </>
  );
};

export default TransformableBox;
