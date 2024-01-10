import { useEffect, useRef } from "react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import { logger } from "../../utils/logger";
import { Message, TestRefRef } from "../../components/message/Message";
import styles from "./dashboard.module.scss";
import Sidebar from "./Sidebar";
import GamePreview from "./GamePreview";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import { language } from "@/store/statusReducer";
import About from "./About";
import { WebgalParser } from "../editor/GraphicalEditor/parser";
import { Card, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Toolbar, ToolbarButton } from "@fluentui/react-components";
import { LocalLanguage24Filled, LocalLanguage24Regular, bundleIcon } from "@fluentui/react-icons";

// 返回的文件信息（单个）
interface IFileInfo {
  name: string;
  isDir: boolean;
}
// 游戏信息
export interface GameInfo {
  dir: string;
  title: string;
  cover: string;
}

export default function DashBoard() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const trans = useTrans('dashBoard.');

  const LocalLanguageIcon = bundleIcon(LocalLanguage24Filled, LocalLanguage24Regular);

  const isDashboardShow:boolean = useSelector((state: RootState) => state.status.dashboard.showDashBoard);

  const messageRef = useRef<TestRefRef>(null);

  // 当前选中的游戏
  const currentGame = useValue<string | null>(null);
  
  const setCurrentGame = (e: string | null) => currentGame.set(e);

  // 游戏列表
  const gameInfoList = useValue<Array<GameInfo>>([]);

  async function getDirInfo() {
    return await axios.get("/api/manageGame/gameList").then(r => r.data);
  }

  async function createGame(gameName:string) {
    const res = await axios.post("/api/manageGame/createGame", { gameName: gameName }).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`${gameName} ` + trans('msgs.created'), 2000);
    refreashDashboard();
    setCurrentGame(null);
  }

  function refreashDashboard() {
    getDirInfo().then(response => {
      const gameList = (response as Array<IFileInfo>)
        .filter(e => e.isDir)
        .map(e => e.name);
      logger.info("返回的游戏列表", gameList);

      const getGameInfoList = gameList.map(
        async (gameName) : Promise<GameInfo> => {
          const gameConfigData = (await axios.get(`/api/manageGame/getGameConfig/${gameName}`)).data;
          const gameConfig = WebgalParser.parseConfig(gameConfigData);
          return {
            dir: gameName,
            title: gameConfig.find(e => e.command === "Game_name")?.args?.join('') ?? "",
            cover: gameConfig.find(e => e.command === "Title_img")?.args?.join('') ?? "",
          };
        });

      Promise.all(getGameInfoList).then(list => gameInfoList.set(list));
    });
  }

  useEffect(() => {
    refreashDashboard();
  }, []);

  const refreash = () => {
    refreashDashboard();
    setCurrentGame(null);
  };

  return <>
    { isDashboardShow &&
      <div className={styles.dashboard_container}>
        <div className={styles.topBar}>
        WebGAL Terre
          <Toolbar>
            <About />
            <Menu>
              <MenuTrigger>
                <ToolbarButton aria-label={t('commandBar.items.language.text')} icon={<LocalLanguageIcon />}>{t('commandBar.items.language.text')}</ToolbarButton>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={() => setLanguage(language.zhCn)}>简体中文</MenuItem>
                  <MenuItem onClick={() => setLanguage(language.en)}>English</MenuItem>
                  <MenuItem onClick={() => setLanguage(language.jp)}>日本语</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </Toolbar>
        </div>
        <div className={styles.dashboard_main}>
          <Message ref={messageRef} />
          {
            currentGame.value &&
                <GamePreview
                  currentGame={currentGame.value}
                  setCurrentGame={setCurrentGame}
                  gameInfo={gameInfoList.value.find(e => e.dir === currentGame.value)!}
                />
          }
          <Sidebar
            refreash={refreash}
            createGame={createGame}
            setCurrentGame={setCurrentGame}
            currentSetGame={currentGame.value}
            gameList={gameInfoList.value} />
        </div>
      </div>}
  </>;
}
