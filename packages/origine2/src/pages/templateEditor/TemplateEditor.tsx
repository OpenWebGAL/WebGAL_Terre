import TemplateEditorSidebar from './TemplateEditorSidebar/TemplateEditorSidebar';
import TemplateEditorMainAria from './TemplateEditorMainAria/TemplateEditorMainAria';
import SplitPane from '@/components/SplitPane/SplitPane';
import SplitPaneCornerHandle from '@/components/SplitPane/SplitPaneCornerHandle';
import styles from './templateEditor.module.scss';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import {
  useComponentTreeChoose,
  useComponentTreeTextbox,
  useComponentTreeTitle,
  useTemplateTempScene,
} from '@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, DIVIDER_SIZE, readStorageNumber } from '@/pages/editor/editorLayoutUtils';

const SIDEBAR_MIN = 200;
const PREVIEW_MIN = 36;

export default function TemplateEditor() {
  const [sidebarWidth, setSidebarWidth] = useState(() => readStorageNumber('template-sidebar-width', 280));

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [previewHeight, setPreviewHeight] = useState(() => readStorageNumber('template-preview-height', 280));

  const maxSidebarWidth = Math.max(SIDEBAR_MIN, containerSize.width - DIVIDER_SIZE);
  const maxPreviewHeight = Math.max(PREVIEW_MIN, containerSize.height - DIVIDER_SIZE - PREVIEW_MIN);

  const handleSidebarResizeEnd = useCallback((size: number) => {
    try {
      localStorage.setItem('template-sidebar-width', String(size));
    } catch {
      /* ignore */
    }
  }, []);

  const handlePreviewHeightResizeEnd = useCallback((size: number) => {
    try {
      localStorage.setItem('template-preview-height', String(size));
    } catch {
      /* ignore */
    }
  }, []);

  const dragStartRef = useRef({ sidebarWidth: 0, previewHeight: 0 });

  const handleCornerStart = useCallback(() => {
    dragStartRef.current = { sidebarWidth, previewHeight };
  }, [sidebarWidth, previewHeight]);

  const handleCornerResize = useCallback(
    (dx: number, dy: number) => {
      setSidebarWidth(clamp(dragStartRef.current.sidebarWidth + dx, SIDEBAR_MIN, maxSidebarWidth));
      setPreviewHeight(clamp(dragStartRef.current.previewHeight + dy, PREVIEW_MIN, maxPreviewHeight));
    },
    [maxSidebarWidth, maxPreviewHeight, setSidebarWidth, setPreviewHeight],
  );

  const handleCornerEnd = useCallback(() => {
    handleSidebarResizeEnd(sidebarWidth);
    handlePreviewHeightResizeEnd(previewHeight);
  }, [sidebarWidth, previewHeight, handleSidebarResizeEnd, handlePreviewHeightResizeEnd]);

  return (
    <div className={styles.editor} ref={containerRef}>
      <SplitPane
        direction="horizontal"
        value={sidebarWidth}
        onChange={setSidebarWidth}
        minSize={SIDEBAR_MIN}
        maxSize={maxSidebarWidth}
        fixedPanel="first"
        disablePointerOn="#templatePreviewIframe, #templateEditorAria"
        onResize={handleSidebarResizeEnd}
      >
        <TemplateEditorSidebar sidebarWidth={sidebarWidth} />
        <TemplateEditorMainAria
          previewHeight={previewHeight}
          onPreviewHeightChange={setPreviewHeight}
          maxPreviewHeight={maxPreviewHeight}
          onPreviewHeightResizeEnd={handlePreviewHeightResizeEnd}
        />
      </SplitPane>

      <SplitPaneCornerHandle
        x={sidebarWidth + DIVIDER_SIZE / 2}
        y={previewHeight + DIVIDER_SIZE / 2}
        cursor="nesw-resize"
        onResizeStart={handleCornerStart}
        onResize={handleCornerResize}
        onResizeEnd={handleCornerEnd}
        disablePointerOn="#templatePreviewIframe, #templateEditorAria"
      />
    </div>
  );
}

export const sendComponentPreviewMessage = (componentPath: string, componentClass: string) => {
  if (componentPath.includes(useComponentTreeTitle().path)) {
    EditorPreviewClient.setComponentVisibility({
      showTitle: true,
      showPanicOverlay: false,
    });
  } else if (componentPath.includes(useComponentTreeTextbox().path)) {
    const miniAvatar = componentClass.toLowerCase().includes('miniavataroff') ? '' : 'miniavatar.webp';
    EditorPreviewClient.runSceneContent(
      `changeBg:bg.webp -next;\nminiAvatar:${miniAvatar} -next;\n${useTemplateTempScene().textbox}`,
    );
  } else if (componentPath.includes(useComponentTreeChoose().path)) {
    EditorPreviewClient.runSceneContent(`changeBg:bg.webp -next;\n${useTemplateTempScene().choose}`);
  }
};
