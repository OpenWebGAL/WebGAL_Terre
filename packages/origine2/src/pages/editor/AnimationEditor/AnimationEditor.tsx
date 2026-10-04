import { useEffect, useMemo, useState } from 'react';
import type { JsonValue } from '@webgal/editor-preview-protocol';
import useEditorStore from '@/store/useEditorStore';
import { ResizableSplit } from './components/ResizableSplit';
import { toAnimationObject } from './model/animationDocument';
import { useAnimationFileDocument } from './model/useAnimationDocument';
import { AnimationPreview } from './preview/AnimationPreview';
import { usePreviewSettings } from './preview/previewSettings';
import { AnimationSettingsPanel } from './settings/AnimationSettingsPanel';
import { AnimationTimeline } from './timeline/AnimationTimeline';

interface IAnimationEditorProps {
  url: string;
  initialText: string;
}

/**
 * Animation v2 的图形编辑器。
 * 上半部分左为预览、右为与时间轴无关的设置，下半部分为时间轴，区域之间的分割线可拖动
 */
export function AnimationEditor({ url, initialText }: IAnimationEditorProps) {
  const { doc, updateTracks, updateFields } = useAnimationFileDocument(url, initialText);
  const [previewSettings, updatePreviewSettings] = usePreviewSettings();
  /** 播放头时刻（毫秒） */
  const [time, setTime] = useState(0);
  // 动画对象由 JSON 解析而来，必定可以序列化
  const animation = useMemo(() => toAnimationObject(doc) as JsonValue, [doc]);
  const updateIsAnimationEditorOpen = useEditorStore.use.updateIsAnimationEditorOpen();

  // 编辑器自带预览，打开期间隐藏左侧的游戏预览，避免把两个预览混淆；只有当前标签页会挂载编辑器
  useEffect(() => {
    updateIsAnimationEditorOpen(true);
    return () => updateIsAnimationEditorOpen(false);
  }, [updateIsAnimationEditorOpen]);

  const preview = <AnimationPreview animation={animation} time={time} settings={previewSettings} />;
  const settings = (
    <AnimationSettingsPanel
      fields={doc.fields}
      updateFields={updateFields}
      preview={previewSettings}
      onPreviewChange={updatePreviewSettings}
    />
  );

  return (
    <ResizableSplit
      direction="vertical"
      storageKey="animation-editor-timeline-split"
      first={<ResizableSplit direction="horizontal" storageKey="animation-editor-preview-split" first={preview} second={settings} />}
      second={
        <AnimationTimeline
          doc={doc}
          updateTracks={updateTracks}
          updateFields={updateFields}
          time={time}
          onTimeChange={setTime}
        />
      }
    />
  );
}
