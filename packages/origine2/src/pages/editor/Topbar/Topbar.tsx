import styles from "./topbar.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import {CommandBar, ICommandBarItemProps} from "@fluentui/react";
import {setDashboardShow, setEditMode, statusActions, TopbarTabs} from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import GithubIcon from './assets/github.svg';
import TerreIcon from './assets/wgfav-new-blue.png';
import React, {useEffect} from "react";
import TopbarTabButton from "@/pages/editor/Topbar/TopbarTabButton";
import ConfigTab from "@/pages/editor/Topbar/tabs/GameConfig/ConfigTab";
import {setAutoHideToolbar} from "@/store/userDataReducer";
import {ViewTab} from "@/pages/editor/Topbar/tabs/ViewConfig/ViewTab";
import {SettingsTab} from "@/pages/editor/Topbar/tabs/Settings/SettingsTab";
import {HelpTab} from "@/pages/editor/Topbar/tabs/Help/HelpTab";
import {ExportTab} from "@/pages/editor/Topbar/tabs/Export/ExportTab";
import TopbarTabButtonSpecial from "@/pages/editor/Topbar/TopbarTabButtonSpecial";
import {AddSentenceTab} from "@/pages/editor/Topbar/tabs/AddSentence/AddSentenceTab";


export default function TopBar() {
  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode); // false 是脚本模式 true 是图形化模式
  const dispatch = useDispatch();
  const isAutoHideToolbar = useSelector((state: RootState) => state.userData.isAutoHideToolbar);

  const handleChange = (newValue: boolean) => {
    dispatch(setEditMode(newValue));
  };


  const currentTopbarTab = useSelector((state: RootState) => state.status.editor.currentTopbarTab);

  function setCurrentTopbarTab(tab: TopbarTabs | undefined) {
    dispatch(statusActions.setCurrentTopbarTab(tab));
  }

  const handleTabClick = (tab: TopbarTabs) => {
    setCurrentTopbarTab(tab);
  };

  function setAlwaysShowToolbarCallback() {
    setCurrentTopbarTab(TopbarTabs.Config);
    dispatch(setAutoHideToolbar(false));
  }

  function setAutoHideToolbarCallback() {
    setCurrentTopbarTab(undefined);
    dispatch(setAutoHideToolbar(true));
  }

  const items: ICommandBarItemProps[] = [
    {
      key: 'commandBarItem',
      iconOnly: true,
      iconProps: {iconName: 'PaddingTop'},
      subMenuProps: {
        items: [
          {
            key: 'item1',
            iconProps: {iconName: 'ThumbnailView'},
            text: '一直显示功能区',
            onClick: setAlwaysShowToolbarCallback,
          },
          {
            key: 'item2',
            iconProps: {iconName: 'Hide3'},
            text: '自动隐藏功能区',
            onClick: setAutoHideToolbarCallback,
          },
        ],
      },
      buttonStyles: {
        root: {
          backgroundColor: 'rgba(255,255,255,0)',
          height: 35
        }
      }
    },
  ];

  const currentTab = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tabs = useSelector((state: RootState) => state.status.editor.tags);
  const currentTabType = tabs.find(e => e.tagTarget === currentTab)?.tagType;
  const isShowAddSceneTab = currentTabType === 'scene' && !useSelector((state: RootState) => state.status.editor.isCodeMode);

  useEffect(() => {
    if (!isShowAddSceneTab && currentTopbarTab === TopbarTabs.AddSentence) {
      if (isAutoHideToolbar) {
        // @ts-ignore
        handleTabClick(undefined);
      } else {
        handleTabClick(TopbarTabs.Config);
      }
    }

    if (isShowAddSceneTab && currentTopbarTab !== TopbarTabs.AddSentence) {
      if (!isAutoHideToolbar) {
        handleTabClick(TopbarTabs.AddSentence);
      }
    }
  }, [isShowAddSceneTab]);

  return <div className={styles.editor_topbar}>
    <div className={styles.topbar_tags}>
      {/* 标签页 */}
      <TopbarTabButton text="文件" isActive={false} onClick={() => dispatch(setDashboardShow(true))}/>
      <TopbarTabButton text="配置" isActive={currentTopbarTab === TopbarTabs.Config}
        onClick={() => handleTabClick(TopbarTabs.Config)}/>
      <TopbarTabButton text="视图" isActive={currentTopbarTab === TopbarTabs.View}
        onClick={() => handleTabClick(TopbarTabs.View)}/>
      <TopbarTabButton text="设置" isActive={currentTopbarTab === TopbarTabs.Settings}
        onClick={() => handleTabClick(TopbarTabs.Settings)}/>
      <TopbarTabButton text="帮助" isActive={currentTopbarTab === TopbarTabs.Help}
        onClick={() => handleTabClick(TopbarTabs.Help)}/>
      <TopbarTabButton text="导出" isActive={currentTopbarTab === TopbarTabs.Export}
        onClick={() => handleTabClick(TopbarTabs.Export)}/>
      {isShowAddSceneTab &&
        <TopbarTabButtonSpecial text="添加语句" isActive={currentTopbarTab === TopbarTabs.AddSentence}
          onClick={() => handleTabClick(TopbarTabs.AddSentence)}/>}
      <div className={styles.topbar_gamename}>
        {editingGame}
      </div>
      <CommandBar items={items} styles={{root: {backgroundColor: 'rgba(255,255,255,0)', height: 35, flexShrink: 0}}}/>
      <div className={styles.topbar_link}
        onClick={() => window.open("https://openwebgal.com", "_blank")}>
        <img src={TerreIcon} height={20} width={20} alt="WebGAL Homepage"/>
        <div className={styles.topbar_link_text}>WebGAL 主页</div>
      </div>
      <div className={styles.topbar_link}
        onClick={() => window.open("https://github.com/OpenWebGAL/WebGAL_Terre", "_blank")}>
        <img src={GithubIcon} height={20} width={20} alt="GitHub Repo"/>
        <div className={styles.topbar_link_text}>源代码</div>
      </div>
    </div>
    {currentTopbarTab === TopbarTabs.Config && <ConfigTab/>}
    {currentTopbarTab === TopbarTabs.View && <ViewTab/>}
    {currentTopbarTab === TopbarTabs.Settings && <SettingsTab/>}
    {currentTopbarTab === TopbarTabs.Help && <HelpTab/>}
    {currentTopbarTab === TopbarTabs.Export && <ExportTab/>}
    {currentTopbarTab === TopbarTabs.AddSentence && <AddSentenceTab/>}
  </div>;
}
