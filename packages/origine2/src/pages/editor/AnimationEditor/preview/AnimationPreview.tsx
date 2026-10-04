import { useEffect, useRef } from 'react';
import { Spinner } from '@fluentui/react-components';
import type { JsonValue } from '@webgal/editor-preview-protocol';
import useEditorStore from '@/store/useEditorStore';
import { useDedicatedPreview } from './useDedicatedPreview';
import { buildPreviewScene, getPreviewTarget, IPreviewSettings } from './previewSettings';
import styles from './animationPreview.module.scss';

interface IAnimationPreviewProps {
  animation: JsonValue;
  /** 播放头时刻（毫秒） */
  time: number;
  settings: IPreviewSettings;
}

/**
 * 一个独立的 WebGAL 实例：按预览设置搭好舞台，再把动画在播放头处的状态写到目标上
 */
export function AnimationPreview({ animation, time, settings }: IAnimationPreviewProps) {
  const gameDir = useEditorStore.use.subPage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isReady, stageRevision, send } = useDedicatedPreview(iframeRef);

  useEffect(() => {
    if (!isReady) return;
    send('preview.command.run-scene-content', { sceneContent: buildPreviewScene(settings) });
    send('preview.command.set-component-visibility', { showTextBox: false, showControls: false });
  }, [isReady, settings, send]);

  // 播放时每帧都会触发，合并到下一个动画帧再发送；舞台变化（如立绘加载完成）后也要重新写入
  useEffect(() => {
    if (!isReady) return;
    const frameId = requestAnimationFrame(() => {
      send('preview.command.seek-animation', { target: getPreviewTarget(settings), animation, time });
    });
    return () => cancelAnimationFrame(frameId);
  }, [isReady, stageRevision, animation, time, settings, send]);

  return (
    <div className={styles.preview}>
      {/* eslint-disable-next-line react/iframe-missing-sandbox */}
      <iframe ref={iframeRef} className={styles.frame} src={`/games/${gameDir}`} title="animation-preview" />
      {!isReady && <Spinner className={styles.loading} size="small" />}
    </div>
  );
}
