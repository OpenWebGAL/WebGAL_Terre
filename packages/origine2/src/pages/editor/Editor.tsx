import TopBar from './Topbar/Topbar';
import styles from './editor.module.scss';
import EditorSideBar from './EditorSidebar/EditorSidebar';
import MainArea from './MainArea/MainArea';
import SplitPane from '@/components/SplitPane/SplitPane';
import SplitPaneCornerHandle from '@/components/SplitPane/SplitPaneCornerHandle';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import FastPreviewTimeoutDialog from './FastPreviewTimeoutDialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, DIVIDER_SIZE, PREVIEW_MIN, readStorageNumber, SIDEBAR_MIN } from './editorLayoutUtils';

export default function Editor() {
  const isAutoHideToolbar = useEditorStore.use.isAutoHideToolbar();
  const updateCurrentTopbarTab = useGameEditorContext((state) => state.updateCurrentTopbarTab);
  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);

  const handleMainAreaClick = () => isAutoHideToolbar && updateCurrentTopbarTab(null);

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

  const [sidebarWidth, setSidebarWidth] = useState(() =>
    readStorageNumber('editor-sidebar-width', window.innerWidth * 0.35),
  );
  const [previewHeight, setPreviewHeight] = useState(() =>
    readStorageNumber('editor-preview-height', Math.round(window.innerWidth * 0.35 * (9 / 16)) + 40),
  );

  const maxSidebarWidth = Math.max(SIDEBAR_MIN, containerSize.width - DIVIDER_SIZE);
  const maxPreviewHeight = Math.max(PREVIEW_MIN, containerSize.height - DIVIDER_SIZE - PREVIEW_MIN);

  const dragStartRef = useRef({ sidebarWidth: 0, previewHeight: 0 });

  const handleSidebarResizeEnd = useCallback((size: number) => {
    try {
      localStorage.setItem('editor-sidebar-width', String(size));
    } catch {
      /* ignore */
    }
  }, []);

  const handlePreviewHeightResizeEnd = useCallback((size: number) => {
    try {
      localStorage.setItem('editor-preview-height', String(size));
    } catch {
      /* ignore */
    }
  }, []);

  const handleCornerStart = useCallback(() => {
    dragStartRef.current = { sidebarWidth, previewHeight };
  }, [sidebarWidth, previewHeight]);

  const handleCornerResize = useCallback(
    (dx: number, dy: number) => {
      setSidebarWidth(clamp(dragStartRef.current.sidebarWidth + dx, SIDEBAR_MIN, maxSidebarWidth));
      setPreviewHeight(clamp(dragStartRef.current.previewHeight + dy, PREVIEW_MIN, maxPreviewHeight));
    },
    [maxSidebarWidth, maxPreviewHeight],
  );

  const handleCornerEnd = useCallback(() => {
    handleSidebarResizeEnd(sidebarWidth);
    handlePreviewHeightResizeEnd(previewHeight);
  }, [sidebarWidth, previewHeight, handleSidebarResizeEnd, handlePreviewHeightResizeEnd]);

  return (
    <div className={styles.editor}>
      <FastPreviewTimeoutDialog />
      <TopBar />
      <div className={styles.container} onClick={() => handleMainAreaClick()} ref={containerRef}>
        <SplitPane
          direction="horizontal"
          value={sidebarWidth}
          onChange={setSidebarWidth}
          minSize={SIDEBAR_MIN}
          maxSize={maxSidebarWidth}
          fixedPanel="first"
          disablePointerOn="#gamePreviewIframe"
          onResize={handleSidebarResizeEnd}
        >
          <EditorSideBar
            previewHeight={previewHeight}
            onPreviewHeightChange={setPreviewHeight}
            maxPreviewHeight={maxPreviewHeight}
            onPreviewHeightResizeEnd={handlePreviewHeightResizeEnd}
          />
          <MainArea />
        </SplitPane>

        {isShowSidebar && (
          <SplitPaneCornerHandle
            x={sidebarWidth + DIVIDER_SIZE / 2}
            y={previewHeight + DIVIDER_SIZE / 2}
            onResizeStart={handleCornerStart}
            onResize={handleCornerResize}
            onResizeEnd={handleCornerEnd}
            disablePointerOn="#gamePreviewIframe"
          />
        )}
      </div>
    </div>
  );
}
