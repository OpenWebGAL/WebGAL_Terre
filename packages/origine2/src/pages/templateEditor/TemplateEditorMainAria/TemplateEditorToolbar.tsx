import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import styles from './templateEditorToolbar.module.scss';
import { CodeTextEditFilled, CodeTextEditRegular, SlideGridFilled, SlideGridRegular, bundleIcon } from '@fluentui/react-icons';
import { FileCodeOne, ListView } from '@icon-park/react';

export default function TemplateEditorToolbar() {

  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const isCodeMode = useTemplateEditorContext((state) => state.isCodeMode);
  const updateIsCodeMode = useTemplateEditorContext((state) => state.updateIsCodeMode);

  return (
    <div className={styles.editorToolbar}>
      <div>
        {null}
      </div>
      <div className={styles.toolbarButtonGroup}>
        <div
          className={`${styles.toolbarButton} ${isCodeMode ? styles.toolbarButtonActive : ''}`}
          onClick={() => updateIsCodeMode(true)}
        >
          <FileCodeOne theme="outline" size="20" fill={isCodeMode ? '#005CAF' : "#333"} strokeWidth={3} />
          代码编辑器
        </div>
        <div
          className={`${styles.toolbarButton} ${!isCodeMode ? styles.toolbarButtonActive : ''}`}
          onClick={() => updateIsCodeMode(false)}
        >
          <ListView theme="outline" size="20" fill={isCodeMode ? "#333" : '#005CAF'} strokeWidth={3} />
          图形编辑器
        </div>
      </div>
    </div>
  );
}