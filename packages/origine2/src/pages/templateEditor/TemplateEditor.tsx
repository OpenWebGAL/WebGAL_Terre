import React, { useEffect, useState } from "react";
import useEditorStore from "@/store/useEditorStore";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";
import { EditorPreviewClient } from "@/utils/editorPreviewClient";
import { ResizableSplit } from "@/pages/editor/AnimationEditor/components/ResizableSplit";
import {
  useComponentTreeChoose,
  useComponentTreeTextbox,
  useComponentTreeTitle,
  useTemplateTempScene
}
  from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree";
import TemplateEditorSidebar from "./TemplateEditorSidebar/TemplateEditorSidebar";
import TemplateEditorMainAria from "./TemplateEditorMainAria/TemplateEditorMainAria";
import { useTemplateScreenSession } from "./hooks/useTemplateScreenSession";
import { TemplatePreviewPane } from "./preview/TemplatePreviewPane";
import { RightInspectorPane } from "./inspector/RightInspectorPane";
import styles from "./templateEditor.module.scss";

export default function TemplateEditor() {
  const templateDir = useEditorStore.use.subPage();
  const styleTab = useTemplateEditorContext((s) => s.styleTab);
  const fullCssMode = useTemplateEditorContext((s) => s.fullCssMode);
  const isStyleCollapsed = useTemplateEditorContext((s) => s.isStyleCollapsed);
  const updateStyleTab = useTemplateEditorContext((s) => s.updateStyleTab);
  const updateFullCssMode = useTemplateEditorContext((s) => s.updateFullCssMode);
  const updateIsStyleCollapsed = useTemplateEditorContext((s) => s.updateIsStyleCollapsed);

  const session = useTemplateScreenSession(templateDir);

  if (!session.isCustomUi) {
    return (
      <div className={styles.editor}>
        <TemplateEditorSidebar />
        <SideberResizer />
        <TemplateEditorMainAria />
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <TemplateEditorSidebar
        customSession={{
          screensInfo: session.screensInfo,
          activeScreenId: session.activeScreenId,
          parts: session.parts,
          selectedPartId: session.selectedPartId,
          onSelectScreen: session.activateScreen,
          onSelectPart: session.selectPart,
          onSwitchVariant: session.switchVariant,
          onImportVariant: session.importVariant,
        }}
      />
      <SideberResizer />
      <div className={styles.workspace}>
        <ResizableSplit
          direction="horizontal"
          storageKey="template-editor-workspace-split"
          defaultRatio={0.64}
          first={
            <TemplatePreviewPane
              templateDir={templateDir}
              previewMode={session.previewMode}
              useMockData={session.useMockData}
              parts={session.parts}
              selectedPartId={session.selectedPartId}
              scssText={session.draftScssText}
              applyStyleIgnored={session.applyStyleIgnored}
              onChangePreviewMode={session.setPreviewMode}
              onChangeMockData={session.setMockData}
              onSelectPart={session.selectPart}
              onPreviewScss={session.previewScss}
              onCommitScss={session.commitScss}
            />
          }
          second={
            <RightInspectorPane
              part={session.selectedPart}
              scssText={session.draftScssText}
              templateDir={templateDir}
              scssPath={session.activeScssPath}
              styleTab={styleTab}
              fullCssMode={fullCssMode}
              lockedState={session.lockedState}
              isStyleCollapsed={isStyleCollapsed}
              onChangeStyleTab={updateStyleTab}
              onChangeFullCssMode={updateFullCssMode}
              onChangeLockedState={session.setLockedState}
              onToggleStyleCollapse={() => updateIsStyleCollapsed(!isStyleCollapsed)}
              onPreviewScss={session.previewScss}
              onCommitScss={session.commitScss}
              onCodeSaved={session.commitScssFromCode}
            />
          }
        />
      </div>
    </div>
  );
}

export const sendComponentPreviewMessage = (componentPath: string, componentClass: string)=> {
  if (componentPath.includes(useComponentTreeTitle().path)) {
    EditorPreviewClient.setComponentVisibility({
      showTitle: true,
      showPanicOverlay: false,
    });
  }
  else if (componentPath.includes(useComponentTreeTextbox().path)) {
    const miniAvatar = componentClass.toLowerCase().includes("miniavataroff") ? "" : "miniavatar.webp";
    EditorPreviewClient.runSceneContent(`changeBg:bg.webp -next;\nminiAvatar:${miniAvatar} -next;\n${useTemplateTempScene().textbox}`);
  }
  else if (componentPath.includes(useComponentTreeChoose().path)) {
    EditorPreviewClient.runSceneContent(`changeBg:bg.webp -next;\n${useTemplateTempScene().choose}`);
  }
};

function SideberResizer() {
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const updateSidebarWidth = useTemplateEditorContext((state) => state.updateSidebarWidth);

  const minWidth = 200;
  const [maxWidth, setMaxWidth] = useState(window.innerWidth * 0.5);

  const [isDragging, setIsDragging] = useState(false);
  const [initX, setInitX] = useState(0);

  const previewFrame = document.getElementById("templatePreviewIframe");
  const templateEditorAria = document.getElementById('templateEditorAria');

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setInitX(event.clientX);

    if (previewFrame) {
      previewFrame.style.pointerEvents = 'none';
    }
    if (templateEditorAria) {
      templateEditorAria.style.pointerEvents = 'none';
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

        if (previewFrame) {
          previewFrame.style.pointerEvents = 'auto';
        }
        if (templateEditorAria) {
          templateEditorAria.style.pointerEvents = 'auto';
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
