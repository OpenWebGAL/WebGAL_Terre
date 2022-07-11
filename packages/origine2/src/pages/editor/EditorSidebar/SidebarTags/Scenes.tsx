import styles from "./sidebarTags.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/origineStore";
import axios from "axios";

export default function Scenes() {
  const state = useSelector((state: RootState) => state.status.editor);
  const currentGameName = state.currentEditingGame;
  // 场景文件的列表
  const sceneList = useValue([]);

  // 请求场景文件的函数
  async function getSceneList() {
    const url = `/api/manageGame/readGameAssets/${currentGameName}/game/scene`;
    const rawSceneList = await axios.get(url).then(r => r.data.dirInfo);
    return rawSceneList.filter((e: any) => e.extName === ".txt");
  }

  // 准备请求场景文件
  useEffect(() => {
    getSceneList().then(result => {
      sceneList.set(result);
      console.log(result);
    });
  }, []);

  return <div>
    <div className={styles.sidebar_tag_title}>场景管理</div>
  </div>;
}
