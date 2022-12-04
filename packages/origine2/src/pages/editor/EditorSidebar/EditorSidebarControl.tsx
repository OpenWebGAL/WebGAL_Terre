import styles from "./editorSideBar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ReactElement } from "react";
import { FolderOpen, PlayTwo, PreviewCloseOne, PreviewOpen, SettingConfig } from "@icon-park/react";
import { setEditorPreviewShow, setEditorSidebarTag, sidebarTag } from "../../../store/statusReducer";

interface ISidebarIconsProps {
  children: ReactElement;
  isActive: boolean;
}

function SidebarIcons(props: ISidebarIconsProps) {
  let className = styles.editor_sidebar_control_button;
  if (props.isActive)
    className += ` ${styles.editor_sidebar_control_button_active}`;
  return <div className={className}>
    {props.children}
  </div>;
}


export default function EditorSidebarControl() {
  const state = useSelector((state: RootState) => state.status.editor);
  const dispatch = useDispatch();

  function switchPreview() {
    dispatch(setEditorPreviewShow(!state.showPreview));
  }

  function switchSidebarTag(currentTag: sidebarTag) {
    if (state.currentSidebarTag === currentTag) {
      dispatch(setEditorSidebarTag(sidebarTag.none));
    } else {
      dispatch(setEditorSidebarTag(currentTag));
    }
  }

  return <div className={styles.editor_sidebar_control}>
    <div onClick={switchPreview}>
      <SidebarIcons isActive={state.showPreview}>
        <>
          {state.showPreview && <PreviewOpen theme="outline" size="24" fill="#0B346E" strokeWidth={3} />}
          {!state.showPreview && <PreviewCloseOne theme="outline" size="24" fill="#0B346E" strokeWidth={3} />}
        </>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.gameconfig)} style={{ margin: "auto 0 0 0" }}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.gameconfig}>
        <SettingConfig theme="outline" size="24" fill="#0B346E" strokeWidth={3} />
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.assets)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.assets}>
        <FolderOpen theme="outline" size="24" fill="#0B346E" strokeWidth={3} />
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.scenes)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.scenes}>
        <PlayTwo theme="outline" size="24" fill="#0B346E" strokeWidth={3} />
      </SidebarIcons>
    </div>
  </div>;
}
