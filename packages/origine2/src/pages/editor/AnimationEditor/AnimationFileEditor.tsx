import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import EditorToolbar from '@/pages/editor/MainArea/EditorToolbar';
import {
  JsonResourceDisplay,
  useJsonFileText,
} from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import { AnimationEditor } from './AnimationEditor';
import { isEditableAnimation } from './model/animationDocument';
import styles from './animationFileEditor.module.scss';

/**
 * 打开 JSON 文件：v2 动画可以在图形编辑器与脚本编辑器之间切换，其他 JSON 只用脚本编辑器
 */
export function AnimationFileEditor({ url }: { url: string }) {
  const { data } = useJsonFileText(url);
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isInAnimationDir = url.includes('/game/animation/');
  /**
   * 打开时是否为 v2 动画。之后即使在脚本编辑器中暂时改坏了内容，也保留切换按钮，
   * 避免按钮随输入闪烁、代码编辑器被重新创建
   */
  const [isAnimationFile, setIsAnimationFile] = useState<boolean | null>(null);

  useEffect(() => {
    if (data !== undefined) setIsAnimationFile((prev) => prev ?? isEditableAnimation(data, isInAnimationDir));
  }, [data, isInAnimationDir]);

  if (data === undefined || isAnimationFile === null) return null;

  const getEditor = () => {
    if (!isAnimationFile || isCodeMode) return <JsonResourceDisplay url={url} />;
    if (!isEditableAnimation(data, isInAnimationDir)) {
      return <div className={styles.invalid}>{t`文件内容不是有效的 v2 动画，请在脚本编辑器中修改`}</div>;
    }
    return <AnimationEditor url={url} initialText={data} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.editor}>{getEditor()}</div>
      {isAnimationFile && <EditorToolbar showSceneInfo={false} />}
    </div>
  );
}
