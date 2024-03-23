import React, { useEffect, useState } from "react";
import TemplateEditorSidebar from "./TemplateEditorSidebar/TemplateEditorSidebar";
import TemplateEditorMainAria from "./TemplateEditorMainAria/TemplateEditorMainAria";
import styles from "./templateEditor.module.scss";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";

export default function TemplateEditor() {
  return (
    <div className={styles.editor}>
      <TemplateEditorSidebar />
      <SideberResizer />
      <TemplateEditorMainAria />
    </div>
  );
}

function SideberResizer() {
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const updateSidebarWidth = useTemplateEditorContext((state) => state.updateSidebarWidth);

  const minWidth = 200;
  const [maxWidth, setMaxWidth] = useState(window.innerWidth * 0.5);

  const [isDragging, setIsDragging] = useState(false);
  const [initX, setInitX] = useState(0);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setInitX(event.clientX);
    const previewFrame = document.getElementById("templatePreviewIframe");
    if (previewFrame) {
      previewFrame.style.pointerEvents = 'none';
    }
  };

  useEffect(
    () => {
      const moveHandler = (event: any) => {
        if (!isDragging) return;
        const deltaX = event.clientX - initX;
        const newWidth = Math.min(Math.max(minWidth, sidebarWidth + deltaX), maxWidth);
        updateSidebarWidth(newWidth);
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
    [isDragging, initX]
  );

  useEffect(
    () => {
      const resizeHandler = () => {
        setMaxWidth(window.innerWidth * 0.5 - 32);
      };
      window.addEventListener("resize", resizeHandler);
      return () => {
        window.removeEventListener("resize", resizeHandler);
      };
    }, []
  );

  useEffect(
    () => {
      sidebarWidth > maxWidth && updateSidebarWidth(Math.max(maxWidth, 200));
    },
    [maxWidth]
  );

  return (
    <div
      className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.dividerLine}>‖</div>
    </div>
  );
};