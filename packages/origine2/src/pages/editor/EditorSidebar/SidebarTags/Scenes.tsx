import styles from "./sidebarTags.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/origineStore";
import axios from "axios";
import { IFileInfo } from "webgal-terre-2/dist/Modules/webgal-fs/webgal-fs.service";
import FileElement from "../sidebarComponents/FileElement";

export default function Scenes() {
  const state = useSelector((state: RootState) => state.status.editor);
  const currentGameName = state.currentEditingGame;
  // 场景文件的列表
  const sceneList = useValue<IFileInfo[]>([]);

  // 请求场景文件的函数
  async function getSceneList() {
    const url = `/api/manageGame/readGameAssets/${currentGameName}/game/scene`;
    const rawSceneList: IFileInfo[] = await axios.get(url).then(r => r.data.dirInfo);
    return rawSceneList.filter((e: any) => e.extName === ".txt");
  }

  function updateSceneListView() {
    getSceneList().then(result => {
      sceneList.set(result);
    });
  }

  // 准备请求场景文件
  useEffect(() => {
    updateSceneListView();
  }, []);

  // 更新文件名的函数
  function constructUpdateFilenameFunc(oldPath: string) {
    return function(newFilename: string) {
      const params = new URLSearchParams();
      params.append("path", oldPath);
      params.append("newName", newFilename);
      axios.post("/api/manageGame/editFilename/", params).then(
        updateSceneListView
      );
    };
  }

  const showSceneList = sceneList.value.map(singleFile => {
    return <FileElement name={singleFile.name} key={singleFile.name}
      editFileNameCallback={constructUpdateFilenameFunc(singleFile.path)} />;
  });

  return <div>
    <div className={styles.sidebar_tag_title}>场景管理</div>
    <div>
      {showSceneList}
    </div>
  </div>;
}
