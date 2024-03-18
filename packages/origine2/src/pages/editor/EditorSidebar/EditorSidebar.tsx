import styles from "./editorSidebar.module.scss";
import Assets, { IFile, IFileConfig, IFileFunction } from "@/components/Assets/Assets";
import React, { useEffect, useRef } from "react";
import useTrans from "@/hooks/useTrans";
import {eventBus} from "@/utils/eventBus";
import { ArrowClockwise24Filled, ArrowClockwise24Regular, bundleIcon, Open24Filled, Open24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { ITag } from "@/types/gameEditor";

let startX = 0;
let prevXvalue = 0;
let isMouseDown = false;

const ArrowClockwiseIcon = bundleIcon(ArrowClockwise24Filled, ArrowClockwise24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);

export default function EditorSideBar() {
  const t = useTrans("editor.sideBar.");
  const gameName = useEditorStore.use.subPage();
  
  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const currentSidebarTab = useGameEditorContext((state) => state.currentSidebarTab);
  const updateCurrentSidebarTab = useGameEditorContext((state) => state.updateCurrentSidebarTab);
  const tags = useGameEditorContext((state) => state.tags);
  const addTag = useGameEditorContext((state) => state.addTag);
  const updateCurrentTag = useGameEditorContext((state) => state.updateCurrentTag);

  const ifRef = useRef(null);
  useEffect(() => {
    if (ifRef.current) {
      // @ts-ignore
      ifRef!.current!.contentWindow.console.log = function () {
      };
    }
  });

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
    eventBus.on('refGame',refreshGame);
    return ()=>{
      eventBus.off('refGame',refreshGame);
    };
  }, []);

  const fileConfig: IFileConfig = new Map([
    [`public/games/${gameName}/game/animation`, { desc: t('$animation'), folderType: 'animation', isProtected: true}],
    [`public/games/${gameName}/game/animation/animationTable.json`, { isProtected: true }],
    [`public/games/${gameName}/game/background`, { desc: t('$background'), folderType: 'background', isProtected: true }],
    [`public/games/${gameName}/game/bgm`, { desc: t('$bgm'), folderType: 'bgm', isProtected: true }],
    [`public/games/${gameName}/game/figure`, { desc: t('$figure'), folderType: 'figure', isProtected: true}],
    [`public/games/${gameName}/game/scene`, { desc: t('$scene'), folderType: 'scene', isProtected: true }],
    [`public/games/${gameName}/game/scene/start.txt`, { isProtected: true }],
    [`public/games/${gameName}/game/tex`, { desc: t('$tex'), folderType: 'tex', isProtected: true }],
    [`public/games/${gameName}/game/video`, { desc: t('$video'), folderType: 'video', isProtected: true }],
    [`public/games/${gameName}/game/vocal`, { desc: t('$vocal'), folderType: 'vocal', isProtected: true }],
    [`public/games/${gameName}/game/config.txt`, { desc: t('$gameConfig'), isProtected: true }],
    [`public/games/${gameName}/game/userStyleSheet.css`, { isProtected: true }],
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
    {isShowSidebar && <div className={styles.editor_sidebar}>
      <div className={styles.divider}
        onMouseDown={handleDragStart}
      // onMouseUp={handleDragEnd}
      // onMouseLeave={handleDragEnd}
      />
      <div className={styles.preview_container} id="gamePreview">
        {/* eslint-disable-next-line react/iframe-missing-sandbox */}
        <iframe
          ref={ifRef}
          id="gamePreviewIframe"
          frameBorder="0"
          className={styles.previewWindow}
          src={`/games/${gameName}`}
        />
        <div className={styles.gamePreviewButons}>
          <Button
            appearance="subtle"
            icon={<ArrowClockwiseIcon />}
            title={t("preview.refresh")}
            onClick={refreshGame}
          />
          <Button
            appearance="subtle"
            icon={<OpenIcon />}
            title={t("preview.previewInNewTab")}
            onClick={() => window.open(`/games/${gameName}`, "_blank")}
          />
        </div>
      </div>

      <div className={styles.sidebarTab}>
        <input
          type="radio"
          id="sidebarTabAssets"
          name="sidebarTab"
          value="assets"
          checked={currentSidebarTab === 'asset'}
          onChange={() => updateCurrentSidebarTab('asset')}
        />
        <label htmlFor="sidebarTabAssets">{t('$assets')}</label>

        <input
          type="radio"
          id="sidebarTabScenes"
          name="sidebarTab"
          value="scene"
          checked={currentSidebarTab === 'scene'}
          onChange={() => updateCurrentSidebarTab('scene')}
        />
        <label htmlFor="sidebarTabScenes">{t('$scene')}</label>
      </div>

      <div className={styles.sidebarContent}>
        {currentSidebarTab === 'asset' &&
          <Assets
            basePath={['public','games',gameName,'game']}
            fileConfig={fileConfig}
            fileFunction={fileFunction}
          />}
        {currentSidebarTab === 'scene' &&
          <Assets
            basePath={['public','games',gameName,'game','scene']}
            fileConfig={fileConfig}
            fileFunction={fileFunction}
          />}
      </div>

    </div >
    }
  </>;
}
