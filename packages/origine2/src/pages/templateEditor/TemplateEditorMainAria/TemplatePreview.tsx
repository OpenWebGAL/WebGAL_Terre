/* eslint-disable react/iframe-missing-sandbox */
import useEditorStore from '@/store/useEditorStore';
import styles from './templatePreview.module.scss';

/**
 * 模板预览面板：外层容器高度由父级 SplitPane 调节，iframe 内部保持 16:9 比例不变形
 */
export default function TemplatePreview() {
  const templateName = useEditorStore.use.subPage();

  return (
    <div className={styles.preview}>
      <iframe
        title={templateName}
        frameBorder={0}
        className={styles.previewWindow}
        id="templatePreviewIframe"
        src={`/template-preview/${templateName}`}
      />
    </div>
  );
}
