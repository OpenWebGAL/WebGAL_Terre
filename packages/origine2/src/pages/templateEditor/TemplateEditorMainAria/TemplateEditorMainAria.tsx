/* eslint-disable react/iframe-missing-sandbox */
import React, { useEffect, useState } from 'react';
import useEditorStore from '@/store/useEditorStore';
import styles from './templateEditorMainAria.module.scss';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';

export default function TemplateMainAria() {
  const templateName = useEditorStore.use.subPage();
  const editorHeight = useTemplateEditorContext((state) => state.editorHeight);
  const updateEditorHeight = useTemplateEditorContext((state) => state.updateEditorHeight);

  const minHeight = 0;
  const [isDragging, setIsDragging] = useState(false);
  const [initY, setInitY] = useState(0);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setInitY(event.clientY);
    const previewFrame = document.getElementById("templatePreviewIframe");
    if (previewFrame) {
      previewFrame.style.pointerEvents = 'none';
    }
  };

  useEffect(
    () => {
      const moveHandler = (event: any) => {
        if (!isDragging) return;
        const deltaY = event.clientY - initY;
        const newHeight = Math.max(minHeight, editorHeight - deltaY);
        updateEditorHeight(newHeight);
      };

      const upHandler = () => {
        setIsDragging(false);
        const previewFrame = document.getElementById("templatePreviewIframe");
        if (previewFrame) {
          previewFrame.style.pointerEvents = 'auto';
        }
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);

      return () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      };
    },
    [isDragging, initY]
  );

  return (
    <div className={styles.mainAria}>
      <div className={styles.preview}>
        <iframe
          title={templateName}
          frameBorder={0}
          className={styles.previewWindow}
          id='templatePreviewIframe'
          src={`/template-preview/${templateName}`}
        />
      </div>
      <div className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`} onMouseDown={handleMouseDown}><div className={styles.dividerLine}>‖</div></div>
      <div className={styles.editor} style={{ height: `${editorHeight}px` }}>Editor</div>
    </div>
  );
}