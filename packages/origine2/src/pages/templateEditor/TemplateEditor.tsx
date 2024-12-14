import React, { useEffect, useState } from "react";
import TemplateEditorSidebar from "./TemplateEditorSidebar/TemplateEditorSidebar";
import TemplateEditorMainAria from "./TemplateEditorMainAria/TemplateEditorMainAria";
import styles from "./templateEditor.module.scss";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";
import { WsUtil } from "@/utils/wsUtil";
import {
  useComponentTreeChoose,
  useComponentTreeTextbox,
  useComponentTreeTitle,
  useTemplateTempScene
}
  from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree";

export default function TemplateEditor() {
  return (
    <div className={styles.editor}>
      <TemplateEditorSidebar />
      <SideberResizer />
      <TemplateEditorMainAria />
    </div>
  );
}

export const sendComponentPreviewMessage = (componentPath: string, componentClass: string)=> {
  console.debug(componentPath, componentClass);
  if (componentPath.includes(useComponentTreeTitle().path)) {
    // set scene to title
    WsUtil.setComponentVisibility([
      { component: "showTitle", visibility: true },
      { component: "showPanicOverlay", visibility: false },
    ]);
  }
  else if (componentPath.includes(useComponentTreeTextbox().path)) {
    const miniAvatar = !componentClass.toLowerCase().includes("miniavataroff") ? "stand.png" : "";
    WsUtil.createTempScene(`changeBg:bg.png -next;\nminiAvatar:${miniAvatar} -next;\n${useTemplateTempScene().textbox}`);
  }
  else if (componentPath.includes(useComponentTreeChoose().path)) {
    WsUtil.createTempScene(`changeBg:bg.png -next;${useTemplateTempScene().choose}`);
  }
};

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
      sidebarWidth > maxWidth && updateSidebarWidth(Math.max(maxWidth, minWidth));
    },
    [maxWidth]
  );

  return (
    <div
      className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.dividerLine} />
    </div>
  );
};
