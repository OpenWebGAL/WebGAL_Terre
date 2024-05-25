/* eslint-disable react/iframe-missing-sandbox */
import useEditorStore from '@/store/useEditorStore';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import React, { useRef, useState, useEffect } from 'react';
import styles from './templatePreview.module.scss';

export default function TemplatePreview() {
  const templateName = useEditorStore.use.subPage();

  const previewHeight = useTemplateEditorContext((state) => state.previewHeight);
  const updatePreviewHeight = useTemplateEditorContext((state) => state.updatePreviewHeight);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewWidth = previewRef.current?.offsetWidth;
  const previewMinHight = 36;
  const previewMaxHeight = previewWidth ? (previewWidth / 16 * 9) : innerHeight - previewMinHight;
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
        const newHeight = Math.min(previewMaxHeight, Math.max(previewMinHight, previewHeight + deltaY));
        updatePreviewHeight(newHeight);
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

  useEffect(
    () => {
      previewHeight > previewMaxHeight && updatePreviewHeight(previewMaxHeight);
    },
    [previewMaxHeight]
  );

  return (
    <>
      <div
        className={styles.preview}
        style={{
          height: `${previewHeight}px`,
          // minHeight: `${previewMinHight}px`,
          maxHeight: `${previewMaxHeight}px`,
        }}
        ref={previewRef}
      >
        <iframe
          title={templateName}
          frameBorder={0}
          className={styles.previewWindow}
          id='templatePreviewIframe'
          src={`/template-preview/${templateName}`}
        />
      </div>
      <div
        className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.dividerLine} />
      </div>
    </>
  );
}