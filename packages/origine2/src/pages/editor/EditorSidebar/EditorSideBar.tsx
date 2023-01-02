import styles from "./editorSideBar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { sidebarTag } from "../../../store/statusReducer";
import GameConfig from "./SidebarTags/GameConfig";
import Assets from "./SidebarTags/Assets";
import Scenes from "./SidebarTags/Scenes";
import { useRef } from "react";


export default function EditorSideBar() {
  const state = useSelector((state: RootState) => state.status.editor);
  const ifRef = useRef(null);
  return <>
    {(state.currentSidebarTag !== sidebarTag.none || state.showPreview) && <div className={styles.editor_sidebar}>
      {state.showPreview && <div className={styles.preview_container}>
        <div className={styles.preview_top_title_container}>
          <div className={styles.preview_title}>
            游戏预览
          </div>
          <div onClick={()=>{
            // @ts-ignore
            ( ifRef.current as HTMLIFrameElement).contentWindow.location.reload();
          }
          }
          style={{
            fontWeight: "bold",
            margin: "0 0 0 auto",
            padding: "3px 7px 3px 7px",
            color: "#005caf",
            background: "rgba(0,92,175,0.1)",
            cursor: "pointer",
            borderRadius: "4px"
          }}>刷新
          </div>
          <div onClick={()=>{
            window.open(`/games/${state.currentEditingGame}`,'_blank');
          }
          }
          style={{
            fontWeight: "bold",
            margin: "0 0 0 5px",
            padding: "3px 7px 3px 7px",
            color: "#005caf",
            background: "rgba(0,92,175,0.1)",
            cursor: "pointer",
            borderRadius: "4px"
          }}>在新标签页预览
          </div>
        </div>

        {/* eslint-disable-next-line react/iframe-missing-sandbox */}
        <iframe ref={ifRef} id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow}
          src={`/games/${state.currentEditingGame}`} />
      </div>}
      <div style={{height:'50%'}}>
        {state.currentSidebarTag === sidebarTag.gameconfig && <GameConfig />}
        {state.currentSidebarTag === sidebarTag.assets && <Assets />}
        {state.currentSidebarTag === sidebarTag.scenes && <Scenes />}
      </div>

    </div>
    }
  </>;
}
