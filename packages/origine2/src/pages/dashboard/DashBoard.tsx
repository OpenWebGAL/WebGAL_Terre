import { useEffect, useRef } from "react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import { logger } from "../../utils/logger";
import { Message, TestRefRef } from "../../components/message/Message";
import styles from "./dashboard.module.scss";
import Sidebar from "./Sidebar";
import { GamePreview } from "./GamePreview";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";

// 返回的文件信息（单个）
interface IFileInfo {
  name: string;
  isDir: boolean;
}

export default function DashBoard() {

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
    messageRef.current!.showMessage(`${gameName} 已创建`, 2000);
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

  useEffect(() => {
    refreashDashboard();
  }, []);



  return <>
    { isDashboardShow && (<div className={styles.dashboard_container}>
      <div className={styles.topBar}>
        WebGAL Origine
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
