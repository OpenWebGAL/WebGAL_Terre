import { useEffect, useRef, useState } from 'react';
import type { JsonValue } from '@webgal/editor-preview-protocol';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { createId } from '@/utils/createId';
import { eventBus } from '@/utils/eventBus';

/** 场景中的一条动画语句，以及动画作用的对象 */
export interface IScenePreviewSentence {
  scenePath: string;
  /** 执行完这条语句后的停止指针：语句末行（0-based）+ 1，与图形编辑器保存时的同步一致 */
  lineNumber: number;
  /** 语句原文 */
  lineContent: string;
  target: string;
  /** 是否从默认状态开始（-transformFrom=default） */
  isFromDefault: boolean;
}

/**
 * 在游戏预览中预览场景里的一条动画语句，把动画在播放头处的状态写到目标上。
 *
 * 打开时以及场景保存后（保存会让预览重新执行到这条语句），让预览执行到这条语句，
 * 并记录语句执行前各对象的状态（transformBaselineRevision），预览以此作为动画的基准状态，
 * 这样无论预览执行到语句后处于什么状态，动画都从语句执行前开始。关闭时让预览回到语句执行后的真实状态
 */
export function useScenePreviewAnimation(sentence: IScenePreviewSentence, animation: JsonValue, time: number) {
  /** 每当预览的舞台状态变化时加一：同步完成、舞台重新提交后，目标会被写回舞台状态，需要重新写入 */
  const [stageRevision, setStageRevision] = useState(0);
  const sentenceRef = useRef(sentence);
  sentenceRef.current = sentence;

  useEffect(() => {
    const syncToSentence = (withBaseline: boolean) => {
      const { scenePath, lineNumber, lineContent } = sentenceRef.current;
      EditorPreviewClient.sendSyncScene({
        scenePath,
        lineNumber,
        lineCommandString: lineContent,
        force: true,
        // 记录基线时立即结算语句中的演出，避免动画语句本身在预览中播放
        settleMode: withBaseline ? 'immediate' : undefined,
        transformBaselineRevision: withBaseline ? createId() : undefined,
      });
    };
    const syncWithBaseline = () => syncToSentence(true);
    const handleStageSnapshot = () => setStageRevision((revision) => revision + 1);

    syncWithBaseline();
    eventBus.on('editor:update-scene', syncWithBaseline);
    eventBus.on('editor-preview:stage-snapshot', handleStageSnapshot);
    return () => {
      eventBus.off('editor:update-scene', syncWithBaseline);
      eventBus.off('editor-preview:stage-snapshot', handleStageSnapshot);
      syncToSentence(false);
    };
  }, []);

  const { target, isFromDefault } = sentence;
  // 播放时每帧都会触发，合并到下一个动画帧再发送
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      // 从默认状态开始时，以默认变换为基准；否则由预览取语句执行前的状态
      EditorPreviewClient.seekAnimation({ target, animation, time, baseTransform: isFromDefault ? {} : undefined });
    });
    return () => cancelAnimationFrame(frameId);
  }, [stageRevision, target, animation, time, isFromDefault]);
}
