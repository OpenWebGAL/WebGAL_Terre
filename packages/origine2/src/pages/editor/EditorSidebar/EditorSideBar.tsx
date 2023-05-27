import styles from "./editorSideBar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { sidebarTag } from "../../../store/statusReducer";
import GameConfig from "./SidebarTags/GameConfig/GameConfig";
import Assets from "./SidebarTags/Assets/Assets";
import Scenes from "./SidebarTags/Scenes/Scenes";
import { useEffect, useRef } from "react";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";


export default function EditorSideBar() {
  const t = useTrans('editor.sideBar.preview.');
  const state = useSelector((state: RootState) => state.status.editor);
  const ifRef = useRef(null);
  useEffect(()=>{
    if(ifRef.current){
      // @ts-ignore
      ifRef!.current!.contentWindow.console.log = function(){};
    }

  });
  return <>
    {(state.currentSidebarTag !== sidebarTag.none || state.showPreview) && <div className={styles.editor_sidebar}>
      {state.showPreview && <div className={styles.preview_container}>
        <TagTitleWrapper title={ t('title')} extra={<>          <div onClick={()=>{
          // @ts-ignore
          ( ifRef.current as HTMLIFrameElement).contentWindow.location.reload();
        }
        }
        className="tag_title_button">
          {t('refresh')}
        </div>
        <div onClick={()=>{
          window.open(`/games/${state.currentEditingGame}`,'_blank');
        }
        }
        className="tag_title_button">
          {t('previewInNewTab')}
        </div></>}/>
        {/* eslint-disable-next-line react/iframe-missing-sandbox */}
        <iframe ref={ifRef} id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow}
          src={`/games/${state.currentEditingGame}`} />
      </div>}
      <div style={{flex:1, overflow:"auto"}}>
        {state.currentSidebarTag === sidebarTag.gameconfig && <GameConfig />}
        {state.currentSidebarTag === sidebarTag.assets && <Assets />}
        {state.currentSidebarTag === sidebarTag.scenes && <Scenes />}
      </div>

    </div>
    }
  </>;
}
