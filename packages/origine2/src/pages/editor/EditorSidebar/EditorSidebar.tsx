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

enum DraggingDivider {
  None,
  EditorSideBarWidth,
  PreviewWindowHeight,
}

let startX = 0;
let startY = 0;
let prevXvalue = 0;
let prevYvalue = 0;
let isMouseDown = false;
let draggingDivider = DraggingDivider.None;

const ArrowClockwiseIcon = bundleIcon(ArrowClockwiseFilled, ArrowClockwiseRegular);
const OpenIcon = bundleIcon(OpenFilled, OpenRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);

export default function EditorSideBar() {
  const gameName = useEditorStore.use.subPage();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const isUseFontOptimization = useEditorStore.use.isUseFontOptimization();

  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const currentSidebarTab = useGameEditorContext((state) => state.currentSidebarTab);
  const updateCurrentSidebarTab = useGameEditorContext((state) => state.updateCurrentSidebarTab);
  const tags = useGameEditorContext((state) => state.tags);
  const addTag = useGameEditorContext((state) => state.addTag);
  const updateCurrentTag = useGameEditorContext((state) => state.updateCurrentTag);

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
    const storeHeight = localStorage.getItem('sidebar-height');
    if (!storeWidth) {
      const initWidth = window.innerWidth * 0.35;
      localStorage.setItem('sidebar-width', initWidth.toString());
      document.body.style.setProperty("--sidebar-width", `${initWidth}px`);
    } else {
      document.body.style.setProperty("--sidebar-width", `${storeWidth}px`);
    }
    if (!storeHeight) {
      const initHeight = window.innerHeight * 0.35;
      localStorage.setItem('sidebar-height', initHeight.toString());
      document.body.style.setProperty("--sidebar-height", `${initHeight}px`);
    } else {
      document.body.style.setProperty("--sidebar-height", `${storeHeight}px`);
    }
  }, []);

  const handleVerticalDividerDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    startX = event.clientX;
    const prevX = document.body.style.getPropertyValue("--sidebar-width");
    prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
    isMouseDown = true;
    draggingDivider = DraggingDivider.EditorSideBarWidth;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'none';
  };

  const handleVerticalDividerDrag = (event: MouseEvent) => {
    if (isMouseDown && draggingDivider === DraggingDivider.EditorSideBarWidth) {
      const deltaX = event.clientX - (startX);
      const newValue = prevXvalue + deltaX;
      document.body.style.setProperty("--sidebar-width", `${(newValue < 192) ? 192 : newValue}px`);
    }

  };

  const handleVerticalDividerDragEnd = (event: MouseEvent) => {
    setTimeout(() => {
      const prevX = document.body.style.getPropertyValue("--sidebar-width");
      prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
      localStorage.setItem('sidebar-width', prevXvalue.toString());
    }, 10);
    isMouseDown = false;
    draggingDivider = DraggingDivider.None;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'auto';
  };

  const handleHorizontalDividerDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    startY = event.clientY;
    const prevY = document.body.style.getPropertyValue("--sidebar-height");
    prevYvalue = parseInt(prevY.substring(0, prevY.length - 2), 10);
    isMouseDown = true;
    draggingDivider = DraggingDivider.PreviewWindowHeight;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'none';
  };

  const handleHorizontalDividerDrag = (event: MouseEvent) => {
    if (isMouseDown && draggingDivider === DraggingDivider.PreviewWindowHeight) {
      const deltaY = event.clientY - (startY);
      const newValue = prevYvalue + deltaY;
      document.body.style.setProperty("--sidebar-height", `${(newValue < 108) ? 108 : newValue}px`);
    }

  };

  const handleHorizontalDividerDragEnd = (event: MouseEvent) => {
    setTimeout(() => {
      const prevY = document.body.style.getPropertyValue("--sidebar-height");
      prevYvalue = parseInt(prevY.substring(0, prevY.length - 2), 10);
      localStorage.setItem('sidebar-height', prevYvalue.toString());
    }, 10);
    isMouseDown = false;
    draggingDivider = DraggingDivider.None;
    const previewFrame = document.getElementById("gamePreviewIframe");
    if (previewFrame)
      previewFrame.style.pointerEvents = 'auto';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleVerticalDividerDrag);
    window.addEventListener('mousemove', handleHorizontalDividerDrag);
    window.addEventListener('mouseup', handleVerticalDividerDragEnd);
    window.addEventListener('mouseup', handleHorizontalDividerDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleVerticalDividerDrag);
      window.removeEventListener('mousemove', handleHorizontalDividerDrag);
      window.removeEventListener('mouseup', handleVerticalDividerDragEnd);
      window.removeEventListener('mouseup', handleHorizontalDividerDragEnd);
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
    [`games/${gameName}/game/animation`, { desc: t`动画`, folderType: 'animation', isProtected: true }],
    [`games/${gameName}/game/animation/animationTable.json`, { isProtected: true }],
    [`games/${gameName}/game/background`, { desc: t`背景`, folderType: 'background', isProtected: true }],
    [`games/${gameName}/game/bgm`, { desc: t`音乐`, folderType: 'bgm', isProtected: true }],
    [`games/${gameName}/game/figure`, { desc: t`立绘`, folderType: 'figure', isProtected: true }],
    [`games/${gameName}/game/scene`, { desc: t`场景`, folderType: 'scene', isProtected: true }],
    [`games/${gameName}/game/scene/start.txt`, { isProtected: true }],
    [`games/${gameName}/game/template`, { desc: t`模板`, folderType: 'template', isProtected: true }],
    [`games/${gameName}/game/tex`, { desc: t`纹理`, folderType: 'tex', isProtected: true }],
    [`games/${gameName}/game/video`, { desc: t`视频`, folderType: 'video', isProtected: true }],
    [`games/${gameName}/game/vocal`, { desc: t`语音`, folderType: 'vocal', isProtected: true }],
    [`games/${gameName}/game/config.txt`, { desc: t`游戏配置`, isProtected: true }],
    [`games/${gameName}/game/userStyleSheet.css`, { isProtected: true }],
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

  return <>
    {isShowSidebar &&
      <div className={styles.editor_sidebar}>
        <div className={styles.preview_container} id="gamePreview">
          {/* eslint-disable-next-line react/iframe-missing-sandbox */}
          <div>
            <iframe
              ref={ifRef}
              id="gamePreviewIframe"
              frameBorder="0"
              className={styles.previewWindow}
              src={`/games/${gameName}`}
            />
            <div
              className={styles.horizontalDivider}
              onMouseDown={handleHorizontalDividerDragStart}
            />
          </div>
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
              onClick={() => window.open(`/games/${gameName}`, "_blank")}
            />
            <Button
              appearance="subtle"
              icon={isEnableLivePreview ? <LiveIcon /> : <LiveOffIcon />}
              title={isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}
              onClick={() => updateIsEnableLivePreview(!isEnableLivePreview)}
            />
          </div>
        </div>

        <TabList style={{padding:'0 0 4px 0'}} size="small" selectedValue={currentSidebarTab}
          onTabSelect={(_, data) => updateCurrentSidebarTab(data.value as unknown as IGameEditorSidebarTabs)}
        >
          <Tab value="asset">{t`资源`}</Tab>
          <Tab value="scene">{t`场景`}</Tab>
        </TabList>
        {/* <div className={styles.sidebarTab}> */}
        {/*  <input */}
        {/*    type="radio" */}
        {/*    id="sidebarTabAssets" */}
        {/*    name="sidebarTab" */}
        {/*    value="assets" */}
        {/*    checked={currentSidebarTab === 'asset'} */}
        {/*    onChange={() => updateCurrentSidebarTab('asset')} */}
        {/*  /> */}
        {/*  <label htmlFor="sidebarTabAssets">{t`资源`}</label> */}
        {/*  <input */}
        {/*    type="radio" */}
        {/*    id="sidebarTabScenes" */}
        {/*    name="sidebarTab" */}
        {/*    value="scene" */}
        {/*    checked={currentSidebarTab === 'scene'} */}
        {/*    onChange={() => updateCurrentSidebarTab('scene')} */}
        {/*  /> */}
        {/*  <label htmlFor="sidebarTabScenes">{t`场景`}</label> */}
        {/* </div> */}
        <div className={styles.sidebarContent}>
          {currentSidebarTab === 'asset' &&
            <Assets
              basePath={['games', gameName, 'game']}
              fileConfig={fileConfig}
              fileFunction={fileFunction}
            />}
          {currentSidebarTab === 'scene' &&
            <Assets
              basePath={['games', gameName, 'game', 'scene']}
              fileConfig={fileConfig}
              fileFunction={fileFunction}
            />}
        </div>

        <div
          className={styles.verticalDivider}
          onMouseDown={handleVerticalDividerDragStart}
        // onMouseUp={handleDragEnd}
        // onMouseLeave={handleDragEnd}
        />

      </div >
    }
  </>;
}
