import styles from "./editorSideBar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { sidebarTag } from "../../../store/statusReducer";
import GameConfig from "./SidebarTags/GameConfig/GameConfig";
import Assets from "./SidebarTags/Assets/Assets";
import Scenes from "./SidebarTags/Scenes/Scenes";
import React, { useEffect, useRef } from "react";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";

let lastClientX = 0;
let startX = 0;
let prevXvalue = 0;

export default function EditorSideBar() {
  const t = useTrans("editor.sideBar.preview.");
  const state = useSelector((state: RootState) => state.status.editor);
  const ifRef = useRef(null);
  useEffect(() => {
    if (ifRef.current) {
      // @ts-ignore
      ifRef!.current!.contentWindow.console.log = function() {
      };
    }
  });

  useEffect(() => {
    const storeWidth = localStorage.getItem('sidebar-width');
    if(!storeWidth){
      const initWidth = window.innerWidth * 0.35;
      localStorage.setItem('sidebar-width',initWidth.toString());
      document.body.style.setProperty("--sidebar-width", `${initWidth}px`);
    }else{
      document.body.style.setProperty("--sidebar-width", `${storeWidth}px`);
    }
  }, []);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const img = new Image();
    event.dataTransfer.setDragImage(img,0,0);
    startX = event.clientX;
    lastClientX = event.clientX;
    const prevX = document.body.style.getPropertyValue("--sidebar-width");
    prevXvalue = parseInt(prevX.substring(0, prevX.length - 2), 10);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - (startX);
    const newValue = prevXvalue + deltaX;
    document.body.style.setProperty("--sidebar-width", `${newValue}px`);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - (startX);
    const newValue = prevXvalue + deltaX;
    localStorage.setItem('sidebar-width',newValue.toString());
    document.body.style.setProperty("--sidebar-width", `${newValue}px`);
  };


  return <>
    {(state.currentSidebarTag !== sidebarTag.none || state.showPreview) && <div className={styles.editor_sidebar}>
      <div draggable className={styles.divider} onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd} />
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
        </>} />
        {/* eslint-disable-next-line react/iframe-missing-sandbox */}
        <iframe ref={ifRef} id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow}
          src={`/games/${state.currentEditingGame}`} />
      </div>}
      <div style={{ flex: 1, overflow: "auto" }}>
        {state.currentSidebarTag === sidebarTag.gameconfig && <GameConfig />}
        {state.currentSidebarTag === sidebarTag.assets && <Assets />}
        {state.currentSidebarTag === sidebarTag.scenes && <Scenes />}
      </div>

    </div>
    }
  </>;
}
