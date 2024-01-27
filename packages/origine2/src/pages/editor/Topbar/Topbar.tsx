import styles from "./topbar.module.scss";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../store/origineStore";
import {language, setDashboardShow, setEditMode, statusActions, TopbarTabs} from "../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import GithubIcon from './assets/github.svg';
import TerreIcon from './assets/wgfav-new-blue.png';
import {useEffect} from "react";
import TopbarTabButton from "@/pages/editor/Topbar/TopbarTabButton";
import ConfigTab from "@/pages/editor/Topbar/tabs/GameConfig/ConfigTab";
import {setAutoHideToolbar} from "@/store/userDataReducer";
import {ViewTab} from "@/pages/editor/Topbar/tabs/ViewConfig/ViewTab";
import {SettingsTab} from "@/pages/editor/Topbar/tabs/Settings/SettingsTab";
import {HelpTab} from "@/pages/editor/Topbar/tabs/Help/HelpTab";
import {ExportTab} from "@/pages/editor/Topbar/tabs/Export/ExportTab";
import TopbarTabButtonSpecial from "@/pages/editor/Topbar/TopbarTabButtonSpecial";
import {AddSentenceTab} from "@/pages/editor/Topbar/tabs/AddSentence/AddSentenceTab";
import {useTranslation} from "react-i18next";
import {Toolbar, Menu, MenuTrigger, ToolbarButton, MenuPopover, MenuList, MenuItem} from "@fluentui/react-components";
import {EyeOff24Filled, EyeOff24Regular, PaddingTop24Filled, PaddingTop24Regular, bundleIcon} from "@fluentui/react-icons";

export default function TopBar() {
  const {t} = useTranslation();
  const setLanguage = useLanguage();
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode); // false 是脚本模式 true 是图形化模式
  const dispatch = useDispatch();
  const isAutoHideToolbar = useSelector((state: RootState) => state.userData.isAutoHideToolbar);

  const PaddingTopIcon = bundleIcon(PaddingTop24Filled, PaddingTop24Regular);
  const EyeOffIcon = bundleIcon(EyeOff24Filled, EyeOff24Regular);

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

  const currentTab = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const tabs = useSelector((state: RootState) => state.status.editor.tags);
  const currentTabType = tabs.find(e => e.tagTarget === currentTab)?.tagType;
  const isShowAddSceneTab = currentTabType === 'scene' && !isCodeMode;

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
      <TopbarTabButton text={t("文件")} isActive={false} onClick={() => dispatch(setDashboardShow(true))}/>
      <TopbarTabButton text={t("配置")} isActive={currentTopbarTab === TopbarTabs.Config}
        onClick={() => handleTabClick(TopbarTabs.Config)}/>
      <TopbarTabButton text={t("视图")} isActive={currentTopbarTab === TopbarTabs.View}
        onClick={() => handleTabClick(TopbarTabs.View)}/>
      <TopbarTabButton text={t("设置")} isActive={currentTopbarTab === TopbarTabs.Settings}
        onClick={() => handleTabClick(TopbarTabs.Settings)}/>
      <TopbarTabButton text={t("帮助")} isActive={currentTopbarTab === TopbarTabs.Help}
        onClick={() => handleTabClick(TopbarTabs.Help)}/>
      <TopbarTabButton text={t("导出")} isActive={currentTopbarTab === TopbarTabs.Export}
        onClick={() => handleTabClick(TopbarTabs.Export)}/>
      {isShowAddSceneTab &&
        <TopbarTabButtonSpecial text={t("添加语句")} isActive={currentTopbarTab === TopbarTabs.AddSentence}
          onClick={() => handleTabClick(TopbarTabs.AddSentence)}/>}
      <div className={styles.topbar_gamename}>
        {editingGame}
      </div>
      <Toolbar>
        <Menu>
          <MenuTrigger>
            <ToolbarButton icon={isAutoHideToolbar ? <EyeOffIcon /> : <PaddingTopIcon />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<PaddingTopIcon />} onClick={setAlwaysShowToolbarCallback}>{t('一直显示功能区')??''}</MenuItem>
              <MenuItem icon={<EyeOffIcon />} onClick={setAutoHideToolbarCallback}>{t('自动隐藏功能区')??''}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarButton 
          icon={<img src={TerreIcon} height={20} width={20} alt="WebGAL Homepage"/>} 
          onClick={() => window.open("https://openwebgal.com", "_blank")}
          style={{fontWeight: 'normal', fontSize: '14px'}}
        >
          {t("主页")}
        </ToolbarButton>
        <ToolbarButton 
          icon={<img src={GithubIcon} height={20} width={20} alt="GitHub Repo"/>} 
          onClick={() => window.open("https://github.com/OpenWebGAL/WebGAL_Terre", "_blank")}
          style={{fontWeight: 'normal', fontSize: '14px'}}
        >
          {t("源代码")}
        </ToolbarButton>
      </Toolbar>
    </div>
    {currentTopbarTab === TopbarTabs.Config && <ConfigTab/>}
    {currentTopbarTab === TopbarTabs.View && <ViewTab/>}
    {currentTopbarTab === TopbarTabs.Settings && <SettingsTab/>}
    {currentTopbarTab === TopbarTabs.Help && <HelpTab/>}
    {currentTopbarTab === TopbarTabs.Export && <ExportTab/>}
    {currentTopbarTab === TopbarTabs.AddSentence && <AddSentenceTab/>}
  </div>;
}
