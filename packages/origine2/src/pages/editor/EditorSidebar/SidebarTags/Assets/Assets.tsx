import styles from "../sidebarTags.module.scss";
import assetsStyles from "./assets.module.scss";
import axios from "axios";
import { origineStore, RootState } from "../../../../../store/origineStore";
import { useValue } from "../../../../../hooks/useValue";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { getFileList, IFileDescription } from "../../../ChooseFile/ChooseFile";
import { dirnameToDisplayNameMap, dirNameToExtNameMap } from "../../../ChooseFile/chooseFileConfig";
import { LeftSmall, Upload } from "@icon-park/react";
import { useId } from "@fluentui/react-hooks";
import { Callout, Text } from "@fluentui/react";
import { statusActions } from "../../../../../store/statusReducer";

export default function Assets() {

  function open_assets() {
    axios.get(`/api/manageGame/openGameAssetsDict/${origineStore.getState().status.editor.currentEditingGame}`).then();
  }

  /**
   * 上传文件
   */

  const isShowUploadCallout = useValue(false);
  const buttonId = useId("upload-button");

  /**
   * 当前目录，以及包含文件
   */
  const currentChildDir = useValue<string[]>([]);
  const currentDirName = currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue<IFileDescription[]>([]);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const currentDirExtName = useValue<string[]>(["unset"]);
  const currentDirExtNameKey = currentDirExtName.value.toString();
  const dispatch = useDispatch();

  function refreshCurrentDir() {
    /**
     * 更新当前目录内的文件
     */
    getFileList(gameName, currentDirName, currentDirExtName.value).then(result => {
      currentDirFiles.set(result);
    });

    if (currentChildDir.value.length === 0) {
      currentDirExtName.set(["unset"]);
    }
  }

  useEffect(() => {
    refreshCurrentDir();
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

      function openChildDir() {
        currentChildDir.set([...currentChildDir.value, fileDesc.name]);
      }

      return <CommonFileButton
        key={fileDesc.path}
        extName={fileDesc.extName}
        isDir={fileDesc.isDir}
        name={currentFileName}
        path={fileDesc.path}
        onClick={() => {
          if (fileDesc.isDir) {
            openChildDir();
          } else {
            dispatch(statusActions.addEditAreaTag({
              tagName: fileDesc.name,
              tagTarget: fileDesc.path,
              tagType: "asset"
            }));
            dispatch(statusActions.setCurrentTagTarget(fileDesc.path));
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
          <LeftSmall theme="outline" size="24" fill="#333" />
        </div>
        <div className={assetsStyles.controlDirnameDisplay}>
          {currentDirName === "" ? "/" : currentDirName}
        </div>
        {currentDirName !== "" &&
          <div id={buttonId} className={assetsStyles.controlCommonButton}
            onClick={() => isShowUploadCallout.set(!isShowUploadCallout.value)}>
            <Upload theme="outline" size="24" fill="#333" />
          </div>}
        {isShowUploadCallout.value && (
          <Callout
            className={assetsStyles.uploadCallout}
            role="dialog"
            gapSpace={0}
            target={`#${buttonId}`}
            onDismiss={() => isShowUploadCallout.set(false)}
            setInitialFocus
          >
            <Text as="h1" block variant="xLarge" className={styles.title}>
              上传资源
            </Text>
            <FileUploader onUpload={() => {
              isShowUploadCallout.set(false);
              refreshCurrentDir();
            }} targetDirectory={`public/games/${gameName}/game${currentDirName}`}
            uploadUrl="/api/manageGame/uploadFiles" />
          </Callout>
        )}
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

interface IFileUploaderProps {
  targetDirectory: string;
  uploadUrl: string;
  onUpload: () => void;
}

function FileUploader({ targetDirectory, uploadUrl, onUpload }: IFileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files!));
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("targetDirectory", targetDirectory);
    files.forEach((file) => {
      formData.append("files", file);
    });

    axios.post(uploadUrl, formData).then((response) => {
      if (response.data) {
        onUpload();
      }
    });
  };

  return (
    <div className={assetsStyles.fileUploadContainer}>
      <div>
        <input className={assetsStyles.fileSelectInput} type="file" multiple onChange={handleFileChange} />
      </div>
      <button className={assetsStyles.fileSelectButton} onClick={handleUpload}>上传</button>
    </div>
  );
}
