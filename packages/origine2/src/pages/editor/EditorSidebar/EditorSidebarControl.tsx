import styles from "./editorSideb.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import {ReactElement} from "react";
import {FolderOpen, PlayTwo, PreviewCloseOne, PreviewOpen, SettingConfig} from "@icon-park/react";
import {setEditorPreviewShow, setEditorSidebarTag, sidebarTag} from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import {registerIcons} from '@fluentui/react/lib/Styling';
import { EditorSidebarIcon } from "./EditorSidebarIcon";
import { IIconProps } from "@fluentui/react";
import * as defaultTheme from "../../../config/themes/white.json";

export default function EditorSidebarControl() {
  const state = useSelector((state: RootState) => state.status.editor);
  const t = useTrans("editor.sideBar.");
  const dispatch = useDispatch();

  const size = 22;
  const theme = "outline";
  const strokeWidth = 3;
  const sizeStr = `${size}px`;
  const iconPressDownFill = defaultTheme.colors["sideBarIcon.pressDown"];
  const iconPressUpffill = defaultTheme.colors["sideBarIcon.pressUp"];

  // Register custom SVG icons
  registerIcons({
    icons: {
      previewOpen: <PreviewOpen size={size} theme={theme} fill={iconPressDownFill} strokeWidth={strokeWidth}/>,
      previewClose: <PreviewCloseOne size={size} theme={theme} fill={iconPressUpffill} strokeWidth={strokeWidth}/>,
      gameConfigOpen: <SettingConfig size={size} theme={theme} fill={iconPressDownFill} strokeWidth={strokeWidth}/>,
      gameConfigClose: <SettingConfig size={size} theme={theme} fill={iconPressUpffill} strokeWidth={strokeWidth}/>,
      assetsOpen: <FolderOpen size={size} theme={theme} fill={iconPressDownFill} strokeWidth={strokeWidth}/>,
      assetsClose: <FolderOpen size={size} theme={theme} fill={iconPressUpffill} strokeWidth={strokeWidth}/>,
      scenesOpen: <PlayTwo size={size} theme={theme} fill={iconPressDownFill} strokeWidth={strokeWidth}/>,
      scenesClose: <PlayTwo size={size} theme={theme} fill={iconPressUpffill} strokeWidth={strokeWidth}/>
    }
  });

  const previewOpenIcon: IIconProps = {iconName: 'previewOpen', style: {height: size, lineHeight: sizeStr}};
  const previewCloseIcon: IIconProps = {iconName: 'previewClose', style: {height: size, lineHeight: sizeStr}};
  const gameConfigOpenIcon: IIconProps = {iconName: 'gameConfigOpen', style: {height: size, lineHeight: sizeStr}}; 
  const gameConfigCloseIcon: IIconProps = {iconName: 'gameConfigClose', style: {height: size, lineHeight: sizeStr}};
  const assetsOpenIcon: IIconProps = {iconName: 'assetsOpen', style: {height: size, lineHeight: sizeStr}};
  const assetsCloseIcon: IIconProps = {iconName: 'assetsClose', style: {height: size, lineHeight: sizeStr}};
  const scenesOpenIcon: IIconProps = {iconName: 'scenesOpen', style: {height: size, lineHeight: sizeStr}};
  const scenesCloseIcon: IIconProps = {iconName: 'scenesClose', style: {height: size, lineHeight: sizeStr}};


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

  return (
    <div className={styles.editor_sidebar_control}>
      <EditorSidebarIcon
        onClick={switchPreview}
        isActive={state.showPreview}
        content={t("preview.title")}
        iconProps={state.showPreview ? previewOpenIcon : previewCloseIcon}
      />
      <EditorSidebarIcon
        onClick={() => switchSidebarTag(sidebarTag.gameconfig)}
        style={{ margin: "auto 0 0 0" }}
        isActive={state.currentSidebarTag === sidebarTag.gameconfig}
        content={t("gameConfigs.title")}
        iconProps={state.currentSidebarTag === sidebarTag.gameconfig ? gameConfigOpenIcon : gameConfigCloseIcon}
      />
      <EditorSidebarIcon
        onClick={() => switchSidebarTag(sidebarTag.assets)}
        isActive={state.currentSidebarTag === sidebarTag.assets}
        content={t("assets.title")}
        iconProps={state.currentSidebarTag === sidebarTag.assets ? assetsOpenIcon : assetsCloseIcon}
      />
      <EditorSidebarIcon
        onClick={() => switchSidebarTag(sidebarTag.scenes)}
        isActive={state.currentSidebarTag === sidebarTag.scenes}
        content={t("scenes.title")}
        iconProps={state.currentSidebarTag === sidebarTag.scenes ? scenesOpenIcon : scenesCloseIcon}
      />
    </div>
  );
}
