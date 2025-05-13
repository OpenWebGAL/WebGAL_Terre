import styles from "./editorSidebar.module.scss";
import Assets, { IFile, IFileConfig, IFileFunction } from "@/components/Assets/Assets";
import React, { useEffect, useRef } from "react";
import { eventBus } from "@/utils/eventBus";
import {Button, Tab, TabList} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import {IGameEditorSidebarTabs, IGameEditorTopbarTabs, ITag} from "@/types/gameEditor";
import { t } from "@lingui/macro";
import { ArrowClockwiseFilled, ArrowClockwiseRegular, LiveFilled, LiveOffFilled, LiveOffRegular, LiveRegular, OpenFilled, OpenRegular, bundleIcon } from "@fluentui/react-icons";
import { WsUtil } from "@/utils/wsUtil";

let startX = 0;
let prevXvalue = 0;
let isMouseDown = false;

const ArrowClockwiseIcon = bundleIcon(ArrowClockwiseFilled, ArrowClockwiseRegular);
const OpenIcon = bundleIcon(OpenFilled, OpenRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);

export default function EditorSideBar() {
  const gameDir = useEditorStore.use.subPage();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const isUseFontOptimization = useEditorStore.use.isUseFontOptimization();

  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const currentSidebarTab = useGameEditorContext((state) => state.currentSidebarTab);
  const updateCurrentSidebarTab = useGameEditorContext((state) => state.updateCurrentSidebarTab);
  const tags = useGameEditorContext((state) => state.tags);
  const addTag = useGameEditorContext((state) => state.addTag);
  const updateCurrentTag = useGameEditorContext((state) => state.updateCurrentTag);

  const viewType = useGameEditorContext((state) => state.viewType);
  const updateViewType = useGameEditorContext((state) => state.updateViewType);
  const sortBy = useGameEditorContext((state) => state.sortBy);
  const updateSortBy = useGameEditorContext((state) => state.updateSortBy);
  const sortOrder = useGameEditorContext((state) => state.sortOrder);
  const updateSortOrder = useGameEditorContext((state) => state.updateSortOrder);

  const ifRef = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    if (ifRef.current) {
      // @ts-ignore
      ifRef!.current!.contentWindow.console.log = function () {
      };

      ifRef.current.onload = () => setTimeout(() => WsUtil.sendFontOptimizationCommand(isUseFontOptimization), 1000);
    }
  });

  useEffect(() => {
    WsUtil.sendFontOptimizationCommand(isUseFontOptimization);
  }, [isUseFontOptimization]);

  useEffect(() => {
    const storeWidth = localStorage.getItem('sidebar-width');
    if (!storeWidth) {
      const initWidth = window.innerWidth * 0.35;
      localStorage.setItem('sidebar-width', initWidth.toString());
      document.body.style.setProperty("--sidebar-width", `${initWidth}px`);
    } else {
      document.body.style.setProperty("--sidebar-width", `${storeWidth}px`);
    }
  }, []);

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    startX = event.clientX;
    const prevX = document.body.style.getPropertyValue("--sidebar-width");
    prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
    isMouseDown = true;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'none';
  };

  const handleDrag = (event: MouseEvent) => {
    if (isMouseDown) {
      const deltaX = event.clientX - (startX);
      const newValue = prevXvalue + deltaX;
      document.body.style.setProperty("--sidebar-width", `${(newValue < 240) ? 240 : newValue}px`);
    }

  };

  const handleDragEnd = (event: MouseEvent) => {
    setTimeout(() => {
      const prevX = document.body.style.getPropertyValue("--sidebar-width");
      prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
      localStorage.setItem('sidebar-width', prevXvalue.toString());
    }, 10);
    isMouseDown = false;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'auto';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  const refreshGame = () => (ifRef?.current as unknown as HTMLIFrameElement).contentWindow?.location.reload();

  useEffect(() => {
    eventBus.on('refGame', refreshGame);
    return () => {
      eventBus.off('refGame', refreshGame);
    };
  }, []);

  const fileConfig: IFileConfig = new Map([
    [`animation`, { desc: t`动画`, folderType: 'animation', isProtected: true }],
    [`animation/animationTable.json`, { isProtected: true }],
    [`background`, { desc: t`背景`, folderType: 'background', isProtected: true }],
    [`bgm`, { desc: t`音乐`, folderType: 'bgm', isProtected: true }],
    [`figure`, { desc: t`立绘`, folderType: 'figure', isProtected: true }],
    [`scene`, { desc: t`场景`, folderType: 'scene', isProtected: true }],
    [`scene/start.txt`, { isProtected: true }],
    [`template`, { desc: t`模板`, folderType: 'template', isProtected: true }],
    [`tex`, { desc: t`纹理`, folderType: 'tex', isProtected: true }],
    [`video`, { desc: t`视频`, folderType: 'video', isProtected: true }],
    [`vocal`, { desc: t`语音`, folderType: 'vocal', isProtected: true }],
    [`config.txt`, { desc: t`游戏配置`, isProtected: true }],
    [`userStyleSheet.css`, { isProtected: true }],
  ]);

  const handleOpen: IFileFunction['open'] = async (file, type) => {
    const target = file.path;
    const tag: ITag = {
      name: file.name,
      path: file.path,
      type: type,
    };
    // 先要确定没有这个tag
    const result = tags.findIndex((e) => e.path === target);
    if (result < 0) addTag(tag);
    updateCurrentTag(tag);
  };

  const fileFunction: IFileFunction = {
    open: handleOpen,
  };

  const assetsTabs =(
    <TabList style={{padding:'0 0 2px 0'}} size="small" selectedValue={currentSidebarTab}
      onTabSelect={(_, data) => updateCurrentSidebarTab(data.value as unknown as IGameEditorSidebarTabs)}
    >
      <Tab value="asset">{t`资源`}</Tab>
      <Tab value="scene">{t`场景`}</Tab>
    </TabList>
  );

  return <>
    {isShowSidebar &&
      <div className={styles.editor_sidebar}>
        <div className={styles.preview_container} id="gamePreview">
          {/* eslint-disable-next-line react/iframe-missing-sandbox */}
          <iframe
            ref={ifRef}
            id="gamePreviewIframe"
            frameBorder="0"
            className={styles.previewWindow}
            src={`/games/${gameDir}`}
          />
          <div className={styles.gamePreviewButons}>
            <Button
              appearance="subtle"
              icon={<ArrowClockwiseIcon />}
              title={t`刷新`}
              onClick={refreshGame}
            />
            <Button
              appearance="subtle"
              icon={<OpenIcon />}
              title={t`在新标签页中预览`}
              onClick={() => window.open(`/games/${gameDir}`, "_blank")}
            />
            <Button
              appearance="subtle"
              icon={isEnableLivePreview ? <LiveIcon /> : <LiveOffIcon />}
              title={isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}
              onClick={() => updateIsEnableLivePreview(!isEnableLivePreview)}
            />
          </div>
        </div>

        <div className={styles.sidebarContent}>
          {
            currentSidebarTab === 'asset' &&
            <Assets
              rootPath={['games', gameDir, 'game']}
              leading={assetsTabs}
              fileConfig={fileConfig}
              fileFunction={fileFunction}
              viewType={viewType}
              sortBy={sortBy}
              sortOrder={sortOrder}
              updateViewType={updateViewType}
              updateSortBy={updateSortBy}
              updateSortOrder={updateSortOrder}
            />
          }
          {
            currentSidebarTab === 'scene' &&
            <Assets
              rootPath={['games', gameDir, 'game']}
              basePath={['scene']}
              leading={assetsTabs}
              fileConfig={fileConfig}
              fileFunction={fileFunction}
              viewType={viewType}
              sortBy={sortBy}
              sortOrder={sortOrder}
              updateViewType={updateViewType}
              updateSortBy={updateSortBy}
              updateSortOrder={updateSortOrder}
            />
          }
        </div>

        <div
          className={styles.divider}
          onMouseDown={handleDragStart}
        // onMouseUp={handleDragEnd}
        // onMouseLeave={handleDragEnd}
        />

      </div >
    }
  </>;
}
