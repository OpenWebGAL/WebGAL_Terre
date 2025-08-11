import {useEffect, useRef} from "react";
import {useValue} from "../../hooks/useValue";
import {logger} from "../../utils/logger";
import {Message, TestRefRef} from "../../components/message/Message";
import styles from "./dashboard.module.scss";
import Sidebar from "./Sidebar";
import TemplateSidebar from "./TemplateSidebar";
import GamePreview from "./GamePreview";
import About from "./About";
import {WebgalParser} from "../editor/GraphicalEditor/parser";
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  Text,
  Toast,
  ToastBody,
  Toaster,
  ToastFooter,
  ToastTitle,
  ToastTrigger,
  Toolbar,
  ToolbarButton,
  useId,
  useToastController
} from "@fluentui/react-components";
import {
  AlbumFilled,
  AlbumRegular,
  bundleIcon,
  DismissFilled,
  DismissRegular,
  GamesFilled,
  GamesRegular,
  LocalLanguage24Filled,
  LocalLanguage24Regular
} from "@fluentui/react-icons";
import classNames from "classnames";
import useEditorStore from "@/store/useEditorStore";
import {api} from "@/api";
import useSWR, {useSWRConfig} from "swr";
import { goTo } from '@/router';
import {t} from "@lingui/macro";
import { useRelease } from "@/hooks/useRelease";
import { __INFO } from "@/config/info";
import {CreateGameDto, CreateTemplateDto} from "@/api/Api";

export interface DateTimeFormatOptions {
  year: 'numeric' | '2-digit';
  month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day: 'numeric' | '2-digit';
}

export const dateTimeOptions: DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

const LocalLanguageIcon = bundleIcon(LocalLanguage24Filled, LocalLanguage24Regular);
const GameIcon = bundleIcon(GamesFilled, GamesRegular);
const AlbumIcon = bundleIcon(AlbumFilled, AlbumRegular);
const DismissIcon = bundleIcon(DismissFilled, DismissRegular);

export const gameListFetcher = async () => {
  const gameList = (await api.manageGameControllerGetGameList()).data;
  logger.info("返回的游戏列表", gameList);
  return gameList;
};

export const templateListFetcher = async () => {
  const templateList = (await api.manageTemplateControllerGetTemplateList()).data;
  logger.info("返回的模板列表", templateList);
  return templateList;
};

export default function DashBoard() {
  const {mutate} = useSWRConfig();

  const subPage = useEditorStore.use.subPage();
  const updateLanguage = useEditorStore.use.updateLanguage();

  const messageRef = useRef<TestRefRef>(null);

  // 左侧栏页签
  const selectedValue = subPage;

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    goTo('dashboard', data.value as string);
  };

  // 当前选中的游戏
  const currentGame = useValue<string | null>(null);

  const setCurrentGame = (e: string | null) => currentGame.set(e);

  // 当前选中的模板
  const currentTemplate = useValue<string | null>(null);

  const setCurrentTemplate = (e: string | null) => currentTemplate.set(e);

  async function createGame(createGameData: CreateGameDto) {
    const res = await api.manageGameControllerCreateGame(createGameData).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`${createGameData.gameName} ` + t`已创建`, 2000);
    refreash();
  }

  async function createTemplate(template: CreateTemplateDto) {
    console.log("createTeplate:" + template);
    const res = await api.manageTemplateControllerCreateTemplate(template).then(r => r.data);
    logger.info("创建结果：", res);
    refreash();
  }

  const {data: gameList} = useSWR("game-list", gameListFetcher);
  const {data: templateList} = useSWR("template-list", templateListFetcher);

  const refreash = () => {
    setCurrentGame(null);
    if (selectedValue === 'game') {
      mutate('game-list');
    } else if (selectedValue === 'template') {
      mutate('template-list');
    }
  };

  // 新版本通知
  const latestRelease = useRelease();
  const ignoreVersion = useEditorStore.use.ignoreVersion();
  const updateIgnoreVersion = useEditorStore.use.updateIgnoreVersion();
  const releaseHasNotified = useRef(false);
  const releaseTimeout = 5000;

  const releaseToasterId = useId("release-toaster");
  const { dispatchToast } = useToastController(releaseToasterId);
  const releaseNotify = () => {
    if (releaseHasNotified.current || !latestRelease || ignoreVersion === __INFO.version) return;

    dispatchToast(
      <Toast>
        <ToastTitle
          action={
            <ToastTrigger>
              <Button appearance="subtle" size="small" icon={<DismissIcon />} />
            </ToastTrigger>
          }
        >
          {t`发现新版本`}
        </ToastTitle>
        <ToastBody>
          <Text size={200} style={{lineHeight: 1.5}}>
            {t`当前版本`}: {`${__INFO.version} (${__INFO.buildTime.toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}<br />
            {t`最新版本`}: {`${latestRelease.version} (${new Date(latestRelease.releaseTime).toLocaleString('zh-CN', dateTimeOptions).replaceAll('/', '-')})`}
          </Text>
        </ToastBody>
        <ToastFooter>
          <Button appearance="primary" size="small" as="a" href="https://openwebgal.com/download/" target="_blank">
            {t`获取最新版本`}
          </Button>
          <ToastTrigger>
            <Button appearance="subtle" size="small" onClick={() => updateIgnoreVersion(__INFO.version)}>
              {t`忽略此版本`}
            </Button>
          </ToastTrigger>
        </ToastFooter>
      </Toast>,
      { timeout: releaseTimeout, intent: "info" }
    );

    releaseHasNotified.current = true;
  };

  useEffect(
    () => {
      if (latestRelease?.hasNewVersion) {
        releaseNotify();
        logger.info(`发现新版本：${latestRelease.version}`, latestRelease);
      }
    },
    [latestRelease?.hasNewVersion]
  );

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.topBar}>
        WebGAL Terre
        <Toolbar>
          <About/>
          <Menu>
            <MenuTrigger>
              <ToolbarButton aria-label={t`语言`}
                icon={<LocalLanguageIcon/>}>{t`语言`}</ToolbarButton>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => updateLanguage('zhCn')}>简体中文</MenuItem>
                <MenuItem onClick={() => updateLanguage('en')}>English</MenuItem>
                <MenuItem onClick={() => updateLanguage('ja')}>日本語</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </Toolbar>
      </div>
      <div className={styles.container_main}>
        <div className={styles.tabListContainer}>
          <TabList selectedValue={selectedValue} onTabSelect={onTabSelect} vertical size="large">
            <Tab className={classNames(styles.tabItem, selectedValue === 'game' ? styles.active : '')} id="Game"
              icon={<GameIcon fontSize={24}/>} value="game">{t`游戏`}</Tab>
            <Tab className={classNames(styles.tabItem, selectedValue === 'template' ? styles.active : '')}
              id="Template" icon={<AlbumIcon fontSize={24}/>} value="template">{t`模板`}</Tab>
          </TabList>
        </div>
        {selectedValue === "game" && <div className={styles.dashboard_main}>
          <Message ref={messageRef}/>
          <Sidebar
            refreash={refreash}
            createGame={createGame}
            setCurrentGame={setCurrentGame}
            currentSetGame={currentGame.value}
            gameList={gameList ? gameList : []}
          />
          {
            currentGame.value && gameList &&
            <GamePreview
              currentGame={currentGame.value}
              setCurrentGame={setCurrentGame}
              gameInfo={gameList.find(e => e.dir === currentGame.value)!}
            />
          }
        </div>
        }
        {selectedValue === "template" && <div className={styles.dashboard_main}>
          <TemplateSidebar
            refreash={refreash}
            createTemplate={createTemplate}
            setCurrentTemplate={setCurrentTemplate}
            currentSetTemplate={currentTemplate.value}
            templateList={templateList ? templateList : []}/>
        </div>}
      </div>
      <Toaster toasterId={releaseToasterId} />
    </div>
  );
}
