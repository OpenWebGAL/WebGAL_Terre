import styles from "./editorSideBar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ReactElement } from "react";
import { FolderOpen, PlayTwo, PreviewCloseOne, PreviewOpen, SettingConfig } from "@icon-park/react";
import { setEditorPreviewShow, setEditorSidebarTag, sidebarTag } from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import { IIconProps } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';
import { registerIcons } from '@fluentui/react/lib/Styling';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';

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

  // Register custom SVG icons
  registerIcons({
    icons: {
      previewOpen: <PreviewOpen/>,
      previewClose: <PreviewCloseOne/>,
      gameConfig: <SettingConfig/>,
      assets: <FolderOpen/>,
      scenes: <PlayTwo/>,
    }
  });

  const previewOpenIcon: IIconProps = { iconName: 'previewOpen', style: { transform: "scale(1.2)" } };
  const previewCloseIcon: IIconProps = { iconName: 'previewClose', style: { transform: "scale(1.2)" } };
  const gameConfigIcon: IIconProps = { iconName: 'gameConfig', style: { transform: "scale(1.2)" } };
  const assetsIcon: IIconProps = { iconName: 'assets', style: { transform: "scale(1.2)" } };
  const scenesIcon: IIconProps = { iconName: 'scenes', style: { transform: "scale(1.2)" } };

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
        <TooltipHost content={t("preview.title")}>
          <IconButton iconProps={state.showPreview ? previewOpenIcon : previewCloseIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.gameconfig)} style={{ margin: "auto 0 0 0" }}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.gameconfig}>
        <TooltipHost content={t("gameConfigs.title")}>
          <IconButton iconProps={gameConfigIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.assets)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.assets}>
        <TooltipHost content={t("assets.title")}>
          <IconButton iconProps={assetsIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.scenes)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.scenes}>
        <TooltipHost content={t("scenes.title")}>
          <IconButton iconProps={scenesIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
  </div>;
}
