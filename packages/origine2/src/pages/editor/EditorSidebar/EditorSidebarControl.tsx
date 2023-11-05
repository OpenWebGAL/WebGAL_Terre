import styles from "./editorSideBar.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import {ReactElement} from "react";
import {FolderOpen, PlayTwo, PreviewCloseOne, PreviewOpen, SettingConfig} from "@icon-park/react";
import {setEditorPreviewShow, setEditorSidebarTag, sidebarTag} from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import {IIconProps} from '@fluentui/react';
import {IconButton} from '@fluentui/react/lib/Button';
import {registerIcons} from '@fluentui/react/lib/Styling';
import {TooltipHost} from '@fluentui/react/lib/Tooltip';

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
  const size = 22;
  const sizeStr = `${size}px`;

  // Register custom SVG icons
  registerIcons({
    icons: {
      previewOpen: <PreviewOpen size={size} theme="outline" fill="#0B346E" strokeWidth={3}/>,
      previewClose: <PreviewCloseOne size={size} theme="outline" fill="#666" strokeWidth={3}/>,
      gameConfig: <SettingConfig size={size} theme="outline" fill="#0B346E" strokeWidth={3}/>,
      gameConfigClose: <SettingConfig size={size} theme="outline" fill="#666" strokeWidth={3}/>,
      assetsOpen: <FolderOpen size={size} theme="outline" fill="#0B346E" strokeWidth={3}/>, // assets when open or active
      assetsClose: <FolderOpen size={size} theme="outline" fill="#666" strokeWidth={3}/>,  // assets when closed or inactive
      scenesOpen: <PlayTwo size={size} theme="outline" fill="#0B346E" strokeWidth={3}/>,    // scenes when open or active
      scenesClose: <PlayTwo size={size} theme="outline" fill="#666" strokeWidth={3}/>       // scenes when closed or inactive
    }
  });

  const previewOpenIcon: IIconProps = {iconName: 'previewOpen', style: {height: size, lineHeight: sizeStr}};
  const previewCloseIcon: IIconProps = {iconName: 'previewClose', style: {height: size, lineHeight: sizeStr}};
  const gameConfigOpenIcon: IIconProps = {iconName: 'gameConfig', style: {height: size, lineHeight: sizeStr}};        // When open or active
  const gameConfigCloseIcon: IIconProps = {iconName: 'gameConfigClose', style: {height: size, lineHeight: sizeStr}};  // When closed or inactive
  const assetsOpenIcon: IIconProps = {iconName: 'assetsOpen', style: {height: size, lineHeight: sizeStr}};            // When open or active
  const assetsCloseIcon: IIconProps = {iconName: 'assetsClose', style: {height: size, lineHeight: sizeStr}};          // When closed or inactive
  const scenesOpenIcon: IIconProps = {iconName: 'scenesOpen', style: {height: size, lineHeight: sizeStr}};            // When open or active
  const scenesCloseIcon: IIconProps = {iconName: 'scenesClose', style: {height: size, lineHeight: sizeStr}};          // When closed or inactive


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
    <div onClick={() => switchSidebarTag(sidebarTag.gameconfig)} style={{margin: "auto 0 0 0"}}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.gameconfig}>
        <TooltipHost content={t("gameConfigs.title")}>
          <IconButton
            iconProps={state.currentSidebarTag === sidebarTag.gameconfig ? gameConfigOpenIcon : gameConfigCloseIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.assets)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.assets}>
        <TooltipHost content={t("assets.title")}>
          <IconButton
            iconProps={state.currentSidebarTag === sidebarTag.assets ? assetsOpenIcon : assetsCloseIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.scenes)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.scenes}>
        <TooltipHost content={t("scenes.title")}>
          <IconButton
            iconProps={state.currentSidebarTag === sidebarTag.scenes ? scenesOpenIcon : scenesCloseIcon}/>
        </TooltipHost>
      </SidebarIcons>
    </div>
  </div>;
}
