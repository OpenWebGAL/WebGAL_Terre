import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import styles from './templateEditorToolbar.module.scss';
import { CodeTextEditFilled, CodeTextEditRegular, SlideGridFilled, SlideGridRegular, bundleIcon } from '@fluentui/react-icons';
import { FileCodeOne, ListView } from '@icon-park/react';
import { t } from '@lingui/macro';

export default function TemplateEditorToolbar() {

  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const isClass = currentTab?.class && currentTab?.class?.length > 0;
  const isCodeMode = useTemplateEditorContext((state) => state.isCodeMode);
  const updateIsCodeMode = useTemplateEditorContext((state) => state.updateIsCodeMode);

  return (
    <div className={styles.editorToolbar}>
      <div>
        {null}
      </div>
      <div className={styles.toolbarButtonGroup}>
        {
          isClass && 
        <>
          <div
            className={`${styles.toolbarButton} ${isCodeMode ? styles.toolbarButtonActive : ''}`}
            onClick={() => updateIsCodeMode(true)}
          >
            <FileCodeOne theme="outline" size="20" fill={isCodeMode ? 'var(--primary)' : 'var(--text)'} strokeWidth={3} />
            {t`脚本编辑器`}
          </div>
          <div
            className={`${styles.toolbarButton} ${!isCodeMode ? styles.toolbarButtonActive : ''}`}
            onClick={() => updateIsCodeMode(false)}
          >
            <ListView theme="outline" size="20" fill={isCodeMode ? 'var(--text)' : 'var(--primary)'} strokeWidth={3} />
            {t`图形编辑器`}
          </div>
        </>
        }
      </div>
    </div>
  );
}