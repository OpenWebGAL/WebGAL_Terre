import styles from "./editorSidebar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { setEditorSidebarTag, sidebarTag } from "../../../store/statusReducer";
import Assets from "./SidebarTags/Assets/Assets";
import Scenes from "./SidebarTags/Scenes/Scenes";
import React, { useEffect, useRef } from "react";
import useTrans from "@/hooks/useTrans";
import { IconButton, TooltipHost } from "@fluentui/react";
import {eventBus} from "@/utils/eventBus";

let startX = 0;
let prevXvalue = 0;
let isMouseDown = false;

export default function EditorSideBar() {
  const t = useTrans("editor.sideBar.");
  const state = useSelector((state: RootState) => state.status.editor);
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
      document.body.style.setProperty("--sidebar-width", `${newValue}px`);
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

  const isEnableLivePreview = useSelector((state: RootState) => state.status.editor.isEnableLivePreview);
  const dispatch = useDispatch();

  const setSidebarTab = (currentTag: sidebarTag) => {
    dispatch(setEditorSidebarTag(currentTag));
  };

  const isShowSidebar = useSelector((state:RootState)=>state.userData.isShowSidebar);

  const refreshGame = () => (ifRef?.current as unknown as HTMLIFrameElement).contentWindow?.location.reload();

  useEffect(() => {
    eventBus.on('refGame',refreshGame);
    return ()=>{
      eventBus.off('refGame',refreshGame);
    };
  }, []);

  return <>
    {isShowSidebar && <div className={styles.editor_sidebar}>
      <div className={styles.divider}
        onMouseDown={handleDragStart}
      // onMouseUp={handleDragEnd}
      // onMouseLeave={handleDragEnd}
      />
      {
        state.showPreview &&
        <div className={styles.preview_container} id="gamePreview">
          {/*
        <div className={styles.livePreviewNotice}>
          <TerreToggle title={t('livePreview')} isChecked={isEnableLivePreview} onChange={(v)=>{dispatch(setIsLivePreview(v));}} onText="" offText=""/>
          <div>
            {t('notice')}
          </div>
        </div> */}
          {/* eslint-disable-next-line react/iframe-missing-sandbox */}
          <iframe
            ref={ifRef}
            id="gamePreviewIframe"
            frameBorder="0"
            className={styles.previewWindow}
            src={`/games/${state.currentEditingGame}`}
          />
          <div className={styles.gamePreviewButons}>
            <IconButton
              iconProps={{ iconName: 'Refresh' }}
              title={t("preview.refresh")}
              onClick={refreshGame}
            />
            <IconButton
              iconProps={{ iconName: 'OpenInNewWindow' }}
              title={t("preview.previewInNewTab")}
              onClick={() => window.open(`/games/${state.currentEditingGame}`, "_blank")}
            />

          </div>
        </div>
      }

      <div className={styles.sidebarTab}>
        <input
          type="radio"
          id="sidebarTabAssets"
          name="sidebarTab"
          value={sidebarTag.assets}
          checked={state.currentSidebarTag === sidebarTag.assets}
          onChange={() => setSidebarTab(sidebarTag.assets)}
        />
        <label htmlFor="sidebarTabAssets">{t('assets.title')}</label>

        <input
          type="radio"
          id="sidebarTabScenes"
          name="sidebarTab"
          value={sidebarTag.scenes}
          checked={state.currentSidebarTag === sidebarTag.scenes}
          onChange={() => setSidebarTab(sidebarTag.scenes)}
        />
        <label htmlFor="sidebarTabScenes">{t('scenes.title')}</label>
      </div>

      <div className={styles.sidebarContent}>
        {/* {state.currentSidebarTag === sidebarTag.gameconfig && <GameConfig />} */}
        {state.currentSidebarTag === sidebarTag.assets && <Assets />}
        {state.currentSidebarTag === sidebarTag.scenes && <Scenes />}
      </div>

    </div >
    }
  </>;
}
