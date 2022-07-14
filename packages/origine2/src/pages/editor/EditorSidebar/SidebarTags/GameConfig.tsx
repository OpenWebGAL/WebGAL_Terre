import styles from "./sidebarTags.module.scss";
import { useValue } from "../../../../hooks/useValue";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/origineStore";
import { useEffect } from "react";

interface IGameConfig {
  gameName: string;
  titleBgm: string;
  titleBackground: string;
}

export default function GameConfig() {

  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<IGameConfig>({ gameName: "", titleBgm: "", titleBackground: "" });
  const getGameConfig = () => {
    axios.get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`).then(r => parseAndSetGameConfigState(r.data));
  };

  function parseAndSetGameConfigState(data: string) {
    // 开始解析
    // 先拆行，拆行之前把\r 换成 \n
    let newData = data.replace(/\r/g, "\n");
    const dataArray: string[] = newData.split("\n");
    // 对于每一行，，截取分号，找出键值
    let dataWithKeyValue = dataArray.map((e: string) => {
      let commandText = e.replaceAll(/[;；]/g,'');
      return commandText.split(":");
    });
    dataWithKeyValue = dataWithKeyValue.filter(e => e.length >= 2);
    // 开始修改
    dataWithKeyValue.forEach(e => {
      switch (e[0]) {
      case "Game_name":
        gameConfig.set({ ...gameConfig.value, gameName: e[1] });
        break;
      case "Title_bgm":
        gameConfig.set({ ...gameConfig.value, titleBgm: e[1] });
        break;
      case "Title_img":
        gameConfig.set({ ...gameConfig.value, titleBackground: e[1] });
        break;
      default:
        console.log('NOT PARSED');
      }
    });
  }

  useEffect(() => {
    getGameConfig();
  }, []);

  return <div>
    <div className={styles.sidebar_tag_title}>游戏配置</div>
    <div>
      <div>
        游戏名称：{gameConfig.value.gameName}
      </div>
      <div>
        标题背景图片：{gameConfig.value.titleBackground}
      </div>
      <div>
        标题背景音乐：{gameConfig.value.titleBgm}
      </div>
    </div>
  </div>;
}
