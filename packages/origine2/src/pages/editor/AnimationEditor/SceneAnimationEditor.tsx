import { useMemo, useState } from 'react';
import type { JsonValue } from '@webgal/editor-preview-protocol';
import { toAnimationObject } from './model/animationDocument';
import { useAnimationDocument } from './model/useAnimationDocument';
import { IScenePreviewSentence, useScenePreviewAnimation } from './preview/useScenePreviewAnimation';
import { AnimationSettingsPanel } from './settings/AnimationSettingsPanel';
import { AnimationTimeline } from './timeline/AnimationTimeline';
import styles from './sceneAnimationEditor.module.scss';

interface ISceneAnimationEditorProps {
  /** 打开时的动画 JSON（v2），之后以编辑器中的状态为准 */
  initialText: string;
  /** 动画修改后调用，参数为单行的动画 JSON，可直接写入语句 */
  onChange: (text: string) => void;
  /** 动画所在的语句，用于在游戏预览中预览 */
  sentence: IScenePreviewSentence;
}

/**
 * 编辑场景语句中的动画（多段动画）。与动画文件的编辑器基本一致，
 * 但不自带预览：动画运行在真实的场景中，直接在游戏预览里从语句执行前的状态开始预览
 */
export function SceneAnimationEditor({ initialText, onChange, sentence }: ISceneAnimationEditorProps) {
  // 语句只能写在一行里，因此不缩进
  const { doc, updateTracks, updateFields } = useAnimationDocument(initialText, (next) =>
    onChange(JSON.stringify(toAnimationObject(next))),
  );
  /** 播放头时刻（毫秒） */
  const [time, setTime] = useState(0);
  // 动画对象由 JSON 解析而来，必定可以序列化
  const animation = useMemo(() => toAnimationObject(doc) as JsonValue, [doc]);
  useScenePreviewAnimation(sentence, animation, time);

  return (
    <div className={styles.editor}>
      <div className={styles.settings}>
        <AnimationSettingsPanel fields={doc.fields} updateFields={updateFields} />
      </div>
      <div className={styles.timeline}>
        <AnimationTimeline
          doc={doc}
          updateTracks={updateTracks}
          updateFields={updateFields}
          time={time}
          onTimeChange={setTime}
        />
      </div>
    </div>
  );
}
