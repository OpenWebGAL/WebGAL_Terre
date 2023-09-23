import styles from "./editorSideBar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ReactElement } from "react";
import { setEditorPreviewShow, setEditorSidebarTag, sidebarTag } from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import { IIconProps } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';

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
  const t = useTrans("editor.sideBar.");
  const dispatch = useDispatch();

  const previewOpenIcon: IIconProps = { iconName: 'Video', style: { transform: "scale(1.2)" } };
  const previewCloseIcon: IIconProps = { iconName: 'VideoOff', style: { transform: "scale(1.2)" } };
  const gameConfigIcon: IIconProps = { iconName: 'Settings', style: { transform: "scale(1.2)" } };
  const assetsIcon: IIconProps = { iconName: 'Media', style: { transform: "scale(1.2)" } };
  const scenesIcon: IIconProps = { iconName: 'MyMoviesTV', style: { transform: "scale(1.2)" } };

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
          {state.showPreview && <IconButton iconProps={previewOpenIcon} title="showPreview" ariaLabel="showPreview" />}
          {!state.showPreview && <IconButton iconProps={previewCloseIcon} title="closePreview" ariaLabel="closePreview" />}
        </>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.gameconfig)} style={{ margin: "auto 0 0 0" }}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.gameconfig}>
        <IconButton iconProps={gameConfigIcon} title={t("gameConfigs.title")} ariaLabel={t("gameConfigs.title")} />
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.assets)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.assets}>
        <IconButton iconProps={assetsIcon} title={t("assets.title")} ariaLabel={t("assets.title")} />
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.scenes)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.scenes}>
        <IconButton iconProps={scenesIcon} title={t("scenes.title")} ariaLabel={t("scenes.title")} />
      </SidebarIcons>
    </div>
  </div>;
}
