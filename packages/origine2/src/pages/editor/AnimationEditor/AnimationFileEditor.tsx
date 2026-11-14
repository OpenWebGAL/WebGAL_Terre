import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import EditorToolbar from '@/pages/editor/MainArea/EditorToolbar';
import { CharacterEditor } from '@/pages/editor/CharacterEditor/CharacterEditor';
import { isEditableCharacter } from '@/pages/editor/CharacterEditor/model/characterDocument';
import {
  JsonResourceDisplay,
  useJsonFileText,
} from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import { AnimationEditor } from './AnimationEditor';
import { isEditableAnimation } from './model/animationDocument';
import styles from './animationFileEditor.module.scss';

type EditorKind = 'animation' | 'character' | 'json';

function detectEditorKind(data: string, url: string, isInAnimationDir: boolean): EditorKind {
  if (isEditableAnimation(data, isInAnimationDir)) return 'animation';
  if (isEditableCharacter(data, url)) return 'character';
  return 'json';
}

/**
 * 打开 JSON 文件：v2 动画与合成角色可在图形编辑器与脚本编辑器之间切换，其他 JSON 只用脚本编辑器
 */
export function AnimationFileEditor({ url }: { url: string }) {
  const { data } = useJsonFileText(url);
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isInAnimationDir = url.includes('/game/animation/');
  /**
   * 打开时识别的文件类型。之后即使在脚本编辑器中暂时改坏了内容，也保留切换按钮，
   * 避免按钮随输入闪烁、代码编辑器被重新创建
   */
  const [editorKind, setEditorKind] = useState<EditorKind | null>(null);

  useEffect(() => {
    if (data !== undefined) setEditorKind((prev) => prev ?? detectEditorKind(data, url, isInAnimationDir));
  }, [data, url, isInAnimationDir]);

  if (data === undefined || editorKind === null) return null;

  const getEditor = () => {
    if (editorKind === 'json' || isCodeMode) return <JsonResourceDisplay url={url} />;
    if (editorKind === 'character') {
      if (!isEditableCharacter(data, url)) {
        return <div className={styles.invalid}>{t`文件内容不是有效的角色描述文件，请在脚本编辑器中修改`}</div>;
      }
      return <CharacterEditor url={url} initialText={data} />;
    }
    if (!isEditableAnimation(data, isInAnimationDir)) {
      return <div className={styles.invalid}>{t`文件内容不是有效的 v2 动画，请在脚本编辑器中修改`}</div>;
    }
    return <AnimationEditor url={url} initialText={data} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.editor}>{getEditor()}</div>
      {(editorKind === 'animation' || editorKind === 'character') && <EditorToolbar showSceneInfo={false} />}
    </div>
  );
}
