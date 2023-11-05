import styles from "./editorSideb.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import {setIsLivePreview, sidebarTag} from "../../../store/statusReducer";
import GameConfig from "./SidebarTags/GameConfig/GameConfig";
import Assets from "./SidebarTags/Assets/Assets";
import Scenes from "./SidebarTags/Scenes/Scenes";
import React, {useEffect, useRef} from "react";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import TerreToggle from "@/components/terreToggle/TerreToggle";

let startX = 0;
let prevXvalue = 0;
let isMouseDown = false;

export default function EditorSideBar() {
  const t = useTrans("editor.sideBar.preview.");
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
    document.getElementById("gamePreviewIframe")!.style.zIndex = '-1';
  };

  const handleDrag = (event: MouseEvent) => {
    if (isMouseDown) {
      const deltaX = event.clientX - (startX);
      const newValue = prevXvalue + deltaX;
      document.body.style.setProperty("--sidebar-width", `${newValue}px`);
    }

  };

  const handleDragEnd = (event: MouseEvent) => {
    setTimeout(()=>{
      const prevX = document.body.style.getPropertyValue("--sidebar-width");
      prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
      localStorage.setItem('sidebar-width', prevXvalue.toString());
    },10);
    isMouseDown = false;
    document.getElementById("gamePreviewIframe")!.style.zIndex = '0';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup',handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup',handleDragEnd);
    };
  }, []);

  const isEnableLivePreview = useSelector((state:RootState)=>state.status.editor.isEnableLivePreview);
  const dispatch = useDispatch();


  return <>
    {(state.currentSidebarTag !== sidebarTag.none || state.showPreview) && <div className={styles.editor_sidebar}>
      <div className={styles.divider}
        onMouseDown={handleDragStart}
        // onMouseUp={handleDragEnd}
        // onMouseLeave={handleDragEnd}
      />
      {state.showPreview && <div className={styles.preview_container}>
        <TagTitleWrapper title={t("title")} extra={<>
          <div onClick={() => {
            // @ts-ignore
            (ifRef.current as HTMLIFrameElement).contentWindow.location.reload();
          }
          }
          className="tag_title_button">
            {t("refresh")}
          </div>
          <div onClick={() => {
            window.open(`/games/${state.currentEditingGame}`, "_blank");
          }
          }
          className="tag_title_button">
            {t("previewInNewTab")}
          </div>
        </>}/>
        <div className={styles.livePreviewNotice}>
          <TerreToggle title={t('livePreview')} isChecked={isEnableLivePreview} onChange={(v)=>{dispatch(setIsLivePreview(v));}} onText="" offText=""/>
          <div>
            {t('notice')}
          </div>
        </div>
        {/* eslint-disable-next-line react/iframe-missing-sandbox */}
        <iframe ref={ifRef} id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow}
          src={`/games/${state.currentEditingGame}`}/>
      </div>}
      <div style={{flex: 1, overflow: "auto"}}>
        {state.currentSidebarTag === sidebarTag.gameconfig && <GameConfig/>}
        {state.currentSidebarTag === sidebarTag.assets && <Assets/>}
        {state.currentSidebarTag === sidebarTag.scenes && <Scenes/>}
      </div>

    </div>
    }
  </>;
}
