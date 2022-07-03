import { useEffect, useRef } from "react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import { logger } from "../../utils/logger";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Message, TestRefRef } from "../../components/message/Message";

// 返回的文件信息（单个）
interface IFileInfo {
  name: string;
  isDir: boolean;
}

export default function DashBoard() {

  const messageRef = useRef<TestRefRef>(null);

  // 文件目录信息（游戏名为名称的游戏目录）
  const dirInfo = useValue<Array<string>>([]);

  async function getDirInfo() {
    return await axios.get("/api/manageGame/gameList").then(r => r.data);
  }

  async function createGame() {
    const res = await axios.post("/api/manageGame/createGame", { gameName: "测试" }).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`测试游戏 已创建`, 3000);
    refreashDashboard();
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

  const showGameList = dirInfo.value.map(e => {
    return <div key={e}>{e}</div>;
  });

  return <div>
    <Message ref={messageRef} />
    {showGameList}
    <PrimaryButton onClick={createGame}>测试新建游戏</PrimaryButton>
  </div>;
}
