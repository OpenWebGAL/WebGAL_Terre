import styles from "./topbar.module.scss";
import GithubIcon from './assets/github.svg';
import TerreIcon from './assets/wgfav-new-blue.png';
import {useEffect} from "react";
import TopbarTabButton from "@/pages/editor/Topbar/TopbarTabButton";
import ConfigTab from "@/pages/editor/Topbar/tabs/GameConfig/ConfigTab";
import {ViewTab} from "@/pages/editor/Topbar/tabs/ViewConfig/ViewTab";
import {SettingsTab} from "@/pages/editor/Topbar/tabs/Settings/SettingsTab";
import {HelpTab} from "@/pages/editor/Topbar/tabs/Help/HelpTab";
import {ExportTab} from "@/pages/editor/Topbar/tabs/Export/ExportTab";
import TopbarTabButtonSpecial from "@/pages/editor/Topbar/TopbarTabButtonSpecial";
import {AddSentenceTab} from "@/pages/editor/Topbar/tabs/AddSentence/AddSentenceTab";
import {Toolbar, Menu, MenuTrigger, ToolbarButton, MenuPopover, MenuList, MenuItem} from "@fluentui/react-components";
import {EyeOff24Filled, EyeOff24Regular, PaddingTop24Filled, PaddingTop24Regular, bundleIcon} from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { IGameEditorTopbarTabs } from "@/types/gameEditor";
import { redirect } from "@/hooks/useHashRoute";
import { t } from "@lingui/macro";

const PaddingTopIcon = bundleIcon(PaddingTop24Filled, PaddingTop24Regular);
const EyeOffIcon = bundleIcon(EyeOff24Filled, EyeOff24Regular);

export default function TopBar() {
  const gameName = useEditorStore.use.subPage();

  const isAutoHideToolbar = useEditorStore.use.isAutoHideToolbar();
  const updateIsAutoHideToolbar = useEditorStore.use.updateIisAutoHideToolbar();

  const isCodeMode = useGameEditorContext((state) => state.isCodeMode); // false 是脚本模式 true 是图形化模式
  const currentTopbarTab = useGameEditorContext((state) => state.currentTopbarTab);
  const updateCurrentTopbarTab = useGameEditorContext((state) => state.updateCurrentTopbarTab);

  function setCurrentTopbarTab(tab: IGameEditorTopbarTabs | null) {
    updateCurrentTopbarTab(tab);
  }

  const handleTabClick = (tab: IGameEditorTopbarTabs) => {
    setCurrentTopbarTab(tab);
  };

  function setAlwaysShowToolbarCallback() {
    setCurrentTopbarTab('config');
    updateIsAutoHideToolbar(false);
  }

  function setAutoHideToolbarCallback() {
    setCurrentTopbarTab(null);
    updateIsAutoHideToolbar(true);
  }

  const currentTag = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  const currenttype = tags.find(e => e.path === currentTag?.path)?.type;
  const isShowAddSceneTab = currenttype === 'scene' && !isCodeMode;

  useEffect(() => {
    if (!isShowAddSceneTab && currentTopbarTab === 'addSentence') {
      if (isAutoHideToolbar) {
        // @ts-ignore
        handleTabClick(undefined);
      } else {
        handleTabClick('config');
      }
    }

    if (isShowAddSceneTab && currentTopbarTab !== 'addSentence') {
      if (!isAutoHideToolbar) {
        handleTabClick('addSentence');
      }
    }
  }, [isShowAddSceneTab]);

  return <div className={styles.editor_topbar}>
    <div className={styles.topbar_tags}>
      {/* 标签页 */}
      <TopbarTabButton text={t`文件`} isActive={false} onClick={() => redirect('dashboard', 'game')}/>
      <TopbarTabButton text={t`配置`} isActive={currentTopbarTab === 'config'}
        onClick={() => handleTabClick('config')}/>
      <TopbarTabButton text={t`视图`} isActive={currentTopbarTab === 'view'}
        onClick={() => handleTabClick('view')}/>
      <TopbarTabButton text={t`设置`} isActive={currentTopbarTab === 'settings'}
        onClick={() => handleTabClick('settings')}/>
      <TopbarTabButton text={t`帮助`} isActive={currentTopbarTab === 'help'}
        onClick={() => handleTabClick('help')}/>
      <TopbarTabButton text={t`导出`} isActive={currentTopbarTab === 'export'}
        onClick={() => handleTabClick('export')}/>
      {isShowAddSceneTab &&
        <TopbarTabButtonSpecial text={t`添加语句`} isActive={currentTopbarTab === 'addSentence'}
          onClick={() => handleTabClick('addSentence')}/>}
      <div className={styles.topbar_gamename}>
        {gameName}
      </div>
      <Toolbar style={{gap:8}}>
        <Menu>
          <MenuTrigger>
            <ToolbarButton icon={isAutoHideToolbar ? <EyeOffIcon /> : <PaddingTopIcon />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<PaddingTopIcon />} onClick={setAlwaysShowToolbarCallback}>{t`一直显示功能区`}</MenuItem>
              <MenuItem icon={<EyeOffIcon />} onClick={setAutoHideToolbarCallback}>{t`自动隐藏功能区`}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarButton
          icon={<img src={TerreIcon} height={20} width={20} alt="WebGAL Homepage"/>}
          onClick={() => window.open("https://openwebgal.com", "_blank")}
          style={{fontWeight: 'normal', fontSize: '14px', paddingLeft: '4px', paddingRight: '4px', minWidth: 0, textWrap: 'nowrap'}}
        >
          {t`主页`}
        </ToolbarButton>
        <ToolbarButton
          icon={<img src={GithubIcon} height={20} width={20} alt="GitHub Repo"/>}
          onClick={() => window.open("https://github.com/OpenWebGAL/WebGAL_Terre", "_blank")}
          style={{fontWeight: 'normal', fontSize: '14px', paddingLeft: '4px', paddingRight: '4px', minWidth: 0, textWrap: 'nowrap'}}
        >
          {t`源代码`}
        </ToolbarButton>
      </Toolbar>
    </div>
    {currentTopbarTab === 'config' && <ConfigTab/>}
    {currentTopbarTab === 'view' && <ViewTab/>}
    {currentTopbarTab === 'settings' && <SettingsTab/>}
    {currentTopbarTab === 'help' && <HelpTab/>}
    {currentTopbarTab === 'export' && <ExportTab/>}
    {currentTopbarTab === 'addSentence' && <AddSentenceTab/>}
  </div>;
}
