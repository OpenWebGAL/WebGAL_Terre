import styles from "./topbar.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {origineStore, RootState} from "../../../store/origineStore";
import {LeftSmall} from "@icon-park/react";
import {CommandBar, ICommandBarItemProps} from "@fluentui/react";
import {registerIcons} from "@fluentui/react/lib/Styling";
import {AndroidLogoIcon} from "@fluentui/react-icons-mdl2";
import axios from "axios";
import {language, setDashboardShow, setEditMode, statusActions, TopbarTabs} from "../../../store/statusReducer";
import TerreToggle from "../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import AndroidIcon from 'material-icon-theme/icons/android.svg';
import GithubIcon from './github.svg';
import TerreIcon from './wgfav-new-blue.png';
import React, {useState} from "react";
import TopbarTab from "@/pages/editor/Topbar/tabs/TopbarTab";
import TopbarTabButton from "@/pages/editor/Topbar/TopbarTabButton";
import ConfigTab from "@/pages/editor/Topbar/tabs/ConfigTab";



export default function TopBar() {
  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode); // false 是脚本模式 true 是图形化模式
  const dispatch = useDispatch();

  const handleChange = (newValue: boolean) => {
    dispatch(setEditMode(newValue));
  };


  const currentTopbarTab = useSelector((state:RootState)=>state.status.editor.currentTopbarTab);
  function setCurrentTopbarTab(tab:TopbarTabs|undefined){
    dispatch(statusActions.setCurrentTopbarTab(tab));
  }

  const handleTabClick = (tab: TopbarTabs) => {
    setCurrentTopbarTab(tab);
  };

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
            onClick: () => setCurrentTopbarTab(TopbarTabs.Config),
          },
          {
            key: 'item2',
            iconProps: {iconName: 'Hide3'},
            text: '自动隐藏功能区',
            onClick: () => setCurrentTopbarTab(undefined),
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
      <div className={styles.topbar_gamename}>
        {editingGame}
      </div>
      <CommandBar items={items} styles={{root: {backgroundColor: 'rgba(255,255,255,0)', height: 35, flexShrink: 0}}}/>
      <div className={styles.topbar_link}>
        <img src={TerreIcon} height={24} width={24} alt="WebGAL Homepage"/>
        <div className={styles.topbar_link_text}>WebGAL 主页</div>
      </div>
      <div className={styles.topbar_link}>
        <img src={GithubIcon} height={24} width={24} alt="GitHub Repo"/>
        <div className={styles.topbar_link_text}>源代码</div>
      </div>
    </div>
    {currentTopbarTab === TopbarTabs.Config && <ConfigTab/>}
  </div>;
}
