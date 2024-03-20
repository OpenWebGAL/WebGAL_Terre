/* eslint-disable react/iframe-missing-sandbox */
import useEditorStore from '@/store/useEditorStore';
import styles from './templateEditorMainAria.module.scss';

export default function TemplateMainAria() {
  const templateName = useEditorStore.use.subPage();
  const editorHeight = 380;
  return (
    <div className={styles.mainAria}>
      <div className={styles.preview}>
        <iframe
          title={templateName}
          frameBorder={0}
          className={styles.previewWindow}
          src={`/template-preview/${templateName}`}
        />
      </div>
      <div className={styles.divider}><div className={styles.dividerLine}>‖</div></div>
      <div className={styles.editor} style={{ height: `${editorHeight}px` }}>Editor</div>
    </div>
  );
}