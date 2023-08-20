import { useEffect, useRef } from "react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import { logger } from "../../utils/logger";
import { Message, TestRefRef } from "../../components/message/Message";
import styles from "./dashboard.module.scss";
import Sidebar from "./Sidebar";
import { GamePreview } from "./GamePreview";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import { CommandBar, ICommandBarItemProps, IIconProps, IconButton, Label, getTheme } from "@fluentui/react";
import { language, setTheme, theme as stateTheme } from "@/store/statusReducer";
import { useColorMode } from "theme-ui";
import useTheme from "@/hooks/useTheme";

// 返回的文件信息（单个）
interface IFileInfo {
  name: string;
  isDir: boolean;
}

export default function DashBoard() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const dispatch = useDispatch();
  const trans = useTrans('dashBoard.');
  const theme = getTheme();
  const currentTheme = useSelector((state: RootState) => state.status.editor.theme);
  const { getColorFromTheme, loadThemeForFluentUI } = useTheme();
  const [colorMode, setColorMode] = useColorMode();

  const isDashboardShow:boolean = useSelector((state: RootState) => state.status.dashboard.showDashBoard);

  const messageRef = useRef<TestRefRef>(null);

  // 文件目录信息（游戏名为名称的游戏目录）
  const dirInfo = useValue<Array<string>>([]);
  // 当前选中的游戏
  const currentGame = useValue<string>("");

  async function getDirInfo() {
    return await axios.get("/api/manageGame/gameList").then(r => r.data);
  }

  async function createGame(gameName:string) {
    const res = await axios.post("/api/manageGame/createGame", { gameName: gameName }).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`${gameName} ` + trans('msgs.created'), 2000);
    refreashDashboard();
  }

  function setCurrent(e: string) {
    currentGame.set(e);
  }

  function refreashDashboard() {
    getDirInfo().then(response => {
      const gameList = (response as Array<IFileInfo>)
        .filter(e => e.isDir)
        .map(e => e.name);
      logger.info("返回的游戏列表", gameList);
      dirInfo.set(gameList);
    });
  }

  // 获取 Fluent UI的icon
  const lightModeIcon: IIconProps = { iconName: 'Sunny' };
  const darkModeIcon: IIconProps = { iconName: 'ClearNight' };

  // 在主题样式中循环切换
  const switchTheme = () => {
    const selectedTheme = ( currentTheme + 1 ) % ( Object.keys(stateTheme).length / 2);
    setColorMode(selectedTheme === stateTheme.light ? 'light' : 'dark');
    dispatch(setTheme(selectedTheme));
    loadThemeForFluentUI(selectedTheme);
  }

  useEffect(() => {
    refreashDashboard();
  }, []);

  const _items: ICommandBarItemProps[] = [
    {
      key: "language",
      text: t('commandBar.items.language.text'),
      cacheKey: 'language',
      iconProps: { iconName: 'LocaleLanguage'},
      subMenuProps: {
        items: [
          {
            key: 'zhCn',
            text: '简体中文',
            onClick() {setLanguage(language.zhCn);}
          },
          {
            key: 'en',
            text: 'English',
            onClick() {setLanguage(language.en);}
          },
          {
            key: 'jp',
            text: '日本語',
            onClick() {setLanguage(language.jp);}
          }
        ]
      }
    },
  ];

  return <>
    { isDashboardShow && (<div className={styles.dashboard_container}>
      <div className={styles.topBar}>
        <Label className={styles.topBarText} styles={{root:[{color: theme.palette.themePrimary}]}}>WebGAL Terre</Label>
        <div>
          <CommandBar
            items={_items}
            ariaLabel="Inbox actions"
            primaryGroupAriaLabel="Email actions"
            farItemsGroupAriaLabel="More actions"
          />
        </div>
        <div onClick={switchTheme}>
          <>
            {currentTheme === stateTheme.dark && <IconButton iconProps={darkModeIcon} title="dark" ariaLabel="dark"/>}
            {currentTheme === stateTheme.light && <IconButton iconProps={lightModeIcon} title="light" ariaLabel="light"/>}
          </>
        </div>
      </div>
      <div className={styles.dashboard_main}>
        <Message ref={messageRef} />
        <Sidebar onDeleteGame={()=>{refreashDashboard();setCurrent('');}} createGame={createGame} setCurrentGame={setCurrent} currentSetGame={currentGame.value}
          gameList={dirInfo.value} />
        <GamePreview gameName={currentGame.value} />
        {/* <PrimaryButton onClick={createGame}>测试新建游戏</PrimaryButton> */}
      </div>
    </div>)}
  </>;
}
