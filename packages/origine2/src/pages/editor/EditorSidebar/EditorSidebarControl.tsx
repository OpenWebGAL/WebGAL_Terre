import styles from "./editorSideBar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ReactElement } from "react";
import { setEditorPreviewShow, setEditorSidebarTag, setTheme, sidebarTag, theme } from "@/store/statusReducer";
import { useColorMode } from 'theme-ui';
import useTheme from "@/hooks/useTheme";
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
  const dispatch = useDispatch();
  const [colorMode, setColorMode] = useColorMode();
  const { loadThemeForFluentUI } = useTheme();

  // 获取 Fluent UI 的 icon
  const previewOpenIcon: IIconProps = { iconName: 'Video' };
  const previewCloseIcon: IIconProps = { iconName: 'VideoOff' };
  const lightModeIcon: IIconProps = { iconName: 'Sunny' };
  const darkModeIcon: IIconProps = { iconName: 'ClearNight' };
  const configIcon: IIconProps = { iconName: 'Settings' };
  const assetLibraryIcon: IIconProps = { iconName: 'Media' };
  const sceneLibraryIcon: IIconProps = { iconName: 'MyMoviesTV' };

  function switchPreview() {
    dispatch(setEditorPreviewShow(!state.showPreview));
  }

  // 在主题样式中循环切换
  const switchTheme = () => {
    const selectedTheme = ( state.theme + 1 ) % ( Object.keys(theme).length / 2);
    setColorMode(selectedTheme === theme.light ? 'light' : 'dark');
    dispatch(setTheme(selectedTheme));
    loadThemeForFluentUI(selectedTheme);
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
          {state.showPreview && <IconButton iconProps={previewOpenIcon} title="showPreview" ariaLabel="showPreview"/>}
          {!state.showPreview && <IconButton iconProps={previewCloseIcon} title="closePreview" ariaLabel="closePreview"/>}
        </>
      </SidebarIcons>
    </div>
    <div onClick={switchTheme}>
      <>
        {state.theme === theme.dark && <IconButton iconProps={darkModeIcon} title="dark" ariaLabel="dark"/>}
        {state.theme === theme.light && <IconButton iconProps={lightModeIcon} title="light" ariaLabel="light"/>}
      </>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.gameconfig)} style={{ margin: "auto 0 0 0" }}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.gameconfig}>
        <IconButton iconProps={configIcon} title="config" ariaLabel="config"/>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.assets)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.assets}>
        <IconButton iconProps={assetLibraryIcon} title="asset library" ariaLabel="asset library"/>
      </SidebarIcons>
    </div>
    <div onClick={() => switchSidebarTag(sidebarTag.scenes)}>
      <SidebarIcons isActive={state.currentSidebarTag === sidebarTag.scenes}>
        <IconButton iconProps={sceneLibraryIcon} title="scene library" ariaLabel="scene library"/>
      </SidebarIcons>
    </div>
  </div>;
}
