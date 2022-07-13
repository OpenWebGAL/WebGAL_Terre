import styles from "./sidebarTags.module.scss";
import { useValue } from "../../../../hooks/useValue";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/origineStore";
import axios from "axios";
import { IFileInfo } from "webgal-terre-2/dist/Modules/webgal-fs/webgal-fs.service";
import FileElement from "../sidebarComponents/FileElement";
import { Callout, PrimaryButton, Text, TextField } from "@fluentui/react";

export default function Scenes() {
  const state = useSelector((state: RootState) => state.status.editor);
  const currentGameName = state.currentEditingGame;
  // 场景文件的列表
  const sceneList = useValue<IFileInfo[]>([]);

  // 处理新建场景的问题
  const showCreateSceneCallout = useValue(false);
  const newSceneName = useValue("");
  const updateNewSceneName = (event: any) => {
    const newValue = event.target.value;
    newSceneName.set(newValue);
  };
  const createNewScene = () => {
    const gameName = state.currentEditingGame;
    const params = new URLSearchParams();
    params.append("gameName", gameName);
    params.append("sceneName", newSceneName.value);
    axios.post("/api/manageGame/createNewScene/", params).then(() => {
      showCreateSceneCallout.set(false);
      updateSceneListView();
      newSceneName.set("");
    });
  };


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

  // 删除文件的函数
  function constructDeleteFileFunc(path: string) {
    return function() {
      const params = new URLSearchParams();
      params.append("path", path);
      axios.post("/api/manageGame/deleteFile/", params).then(
        updateSceneListView
      );
    };
  }

  const showSceneList = sceneList.value.map(singleFile => {
    return <FileElement name={singleFile.name} key={singleFile.name}
      deleteCallback={constructDeleteFileFunc(singleFile.path)}
      editFileNameCallback={constructUpdateFilenameFunc(singleFile.path)} />;
  });

  return <div>
    <div className={styles.sidebar_tag_head}>
      <div className={styles.sidebar_tag_title}>
        场景管理
      </div>
      <div className={styles.sidebar_tag_head_button}>
        <PrimaryButton id="createSceneButton" text="新建场景"
          onClick={() => showCreateSceneCallout.set(!showCreateSceneCallout.value)} />
        {showCreateSceneCallout.value && <Callout
          className={styles.callout}
          ariaLabelledBy="createNewSceneCallout"
          ariaDescribedBy="createNewSceneCallout"
          role="dialog"
          gapSpace={0}
          target="#createSceneButton"
          onDismiss={() => {
            showCreateSceneCallout.set(false);
          }}
          setInitialFocus
          style={{ width: "300px", padding: "5px 10px 5px 10px" }}
        >
          <Text block variant="xLarge" className={styles.title}>
            创建新场景
          </Text>
          <div>
            <TextField defaultValue={newSceneName.value} onChange={updateNewSceneName} label="新场景名" />
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "5px 0 5px 0" }}>
            <PrimaryButton text="创建" onClick={createNewScene} allowDisabledFocus />
          </div>
        </Callout>}
      </div>
    </div>
    <div>
      {showSceneList}
    </div>
  </div>;
}
