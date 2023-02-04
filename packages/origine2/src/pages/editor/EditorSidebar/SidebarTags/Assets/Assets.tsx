import styles from "../sidebarTags.module.scss";
import assetsStyles from "./assets.module.scss";
import axios from "axios";
import { origineStore, RootState } from "../../../../../store/origineStore";
import { useValue } from "../../../../../hooks/useValue";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { getFileList, IFileDescription } from "../../../ChooseFile/ChooseFile";
import { dirnameToDisplayNameMap, dirNameToExtNameMap } from "../../../ChooseFile/chooseFileConfig";
import { UpSmall } from "@icon-park/react";

export default function Assets() {

  function open_assets() {
    axios.get(`/api/manageGame/openGameAssetsDict/${origineStore.getState().status.editor.currentEditingGame}`).then();
  }

  /**
   * 当前目录，以及包含文件
   */
  const currentChildDir = useValue<string[]>([]);
  const currentDirName = currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue<IFileDescription[]>([]);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const currentDirExtName = useValue<string[]>(["unset"]);
  const currentDirExtNameKey = currentDirExtName.value.toString();
  useEffect(() => {
    /**
     * 更新当前目录内的文件
     */
    getFileList(gameName, currentDirName, currentDirExtName.value).then(result => {
      currentDirFiles.set(result);
    });

    if (currentChildDir.value.length === 0) {
      currentDirExtName.set(["unset"]);
    }

  }, [currentDirName, currentDirExtNameKey]);

  function goBack() {
    if (currentChildDir.value.length > 0)
      currentChildDir.set(currentChildDir.value.slice(0, currentChildDir.value.length - 1));
  }

  let currentFileList;

  if (currentDirName === "") {
    currentFileList = currentDirFiles.value.map((fileDesc) => {

      const currentFileName = dirnameToDisplayNameMap.get(fileDesc.name) ?? fileDesc.name;
      return <CommonFileButton
        key={fileDesc.path}
        extName={fileDesc.extName}
        isDir={fileDesc.isDir}
        name={currentFileName}
        path={fileDesc.path}
        onClick={() => {
          currentChildDir.set([...currentChildDir.value, fileDesc.name]);
          const targetDirExtName = dirNameToExtNameMap.get(fileDesc.name) ?? [];
          console.log(123);
          currentDirExtName.set(targetDirExtName);
        }} />;
    });
  } else {
    currentFileList = currentDirFiles.value.map((fileDesc) => {

      const currentFileName = dirnameToDisplayNameMap.get(fileDesc.name) ?? fileDesc.name;
      function openChildDir(){currentChildDir.set([...currentChildDir.value,fileDesc.name]);}
      return <CommonFileButton
        key={fileDesc.path}
        extName={fileDesc.extName}
        isDir={fileDesc.isDir}
        name={currentFileName}
        path={fileDesc.path}
        onClick={() => {
          if(fileDesc.isDir){
            openChildDir();
          }else{
            // 暂时没有逻辑，后面写到标签里面
          }
        }} />;
    });
  }


  return (
    <div style={{ height: "100%", overflow: "auto", display: "flex", flexFlow: "column" }}>
      <div className={assetsStyles.assetsHead}>
        <div className={styles.sidebar_tag_title}>资源管理</div>
        <div className={styles.open_assets} onClick={open_assets}>
          打开此游戏的资源文件夹
        </div>
      </div>
      <div className={assetsStyles.controlHead}>
        <div className={assetsStyles.controlCommonButton} onClick={goBack}>
          <UpSmall theme="outline" size="24" fill="#333" />
        </div>
        <div className={assetsStyles.controlDirnameDisplay}>
          {currentDirName === "" ? "/" : currentDirName}
        </div>
      </div>
      <div className={assetsStyles.fileList}>
        {currentFileList}
      </div>
    </div>
  );
}

/**
 * 单个文件的按钮
 * @param props
 * @constructor
 */
function CommonFileButton(props: IFileDescription & { onClick: Function }) {
  return <div className={assetsStyles.commonFileButton} onClick={() => props.onClick()}>
    {props.name}
  </div>;
}
