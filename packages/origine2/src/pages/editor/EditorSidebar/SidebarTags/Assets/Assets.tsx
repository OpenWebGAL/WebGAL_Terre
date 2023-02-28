import styles from "../sidebarTags.module.scss";
import assetsStyles from "./assets.module.scss";
import axios from "axios";
import { origineStore, RootState } from "../../../../../store/origineStore";
import { useValue } from "../../../../../hooks/useValue";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { getFileList, IFileDescription } from "../../../ChooseFile/ChooseFile";
import { dirnameToDisplayNameMap, dirNameToExtNameMap } from "../../../ChooseFile/chooseFileConfig";
import { DeleteOne, Editor, FolderPlus, LeftSmall, Upload } from "@icon-park/react";
import { useId } from "@fluentui/react-hooks";
import { Callout, PrimaryButton, Text, TextField } from "@fluentui/react";
import { statusActions } from "../../../../../store/statusReducer";
import { extractPathAfterPublic } from "../../../ResourceDisplay/ResourceDisplay";

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

  /**
   * 新建文件夹
   */
  const isShowMkdirCallout = useValue(false);
  const mkdirButtonId = useId("mkdir-button");
  const newDirName = useValue("");
  const handleCreatNewDir = () => {
    axios.post("/api/manageGame/mkdir", {
      source: `public/games/${gameName}/game${currentDirName}`,
      name: newDirName.value
    }).then(refreshCurrentDir);
    isShowMkdirCallout.set(false);
  };

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

  async function goBack() {
    if (currentChildDir.value.length > 0)
      currentChildDir.set(currentChildDir.value.slice(0, currentChildDir.value.length - 1));
  }

  async function renameFile(source: string, newName: string) {
    const trueSource = `public/${extractPathAfterPublic(source)}`;
    await axios.post("/api/manageGame/rename", { source: trueSource, newName });
    refreshCurrentDir();
  }

  async function deleteFile(source: string) {
    const trueSource = `public/${extractPathAfterPublic(source)}`;
    await axios.post("/api/manageGame/delete", { source: trueSource });
    refreshCurrentDir();
  }

  let currentFileList;

  if (currentDirName === "") {
    currentFileList = currentDirFiles.value.map((fileDesc) => {

      const currentFileName = dirnameToDisplayNameMap.get(fileDesc.name) ?? fileDesc.name;
      return <CommonFileButton
        showOptions={false}
        key={fileDesc.path}
        extName={fileDesc.extName}
        isDir={fileDesc.isDir}
        name={currentFileName}
        path={fileDesc.path}
        onDelete={() => {
        }}
        onRename={() => {
        }}
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
        showOptions={true}
        key={fileDesc.path}
        extName={fileDesc.extName}
        isDir={fileDesc.isDir}
        name={currentFileName}
        path={fileDesc.path}
        onDelete={() => deleteFile(fileDesc.path)}
        onRename={(newName) => renameFile(fileDesc.path, newName)}
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
          <>
            <div id={buttonId} className={assetsStyles.controlCommonButton}
              onClick={() => isShowUploadCallout.set(!isShowUploadCallout.value)}>
              <Upload theme="outline" size="24" fill="#333" />
            </div>
            <div id={mkdirButtonId} className={assetsStyles.controlCommonButton}
              onClick={() => isShowMkdirCallout.set(!isShowMkdirCallout.value)}>
              <FolderPlus theme="outline" size="24" fill="#333" />
            </div>
          </>
        }
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
        {isShowMkdirCallout.value && (
          <Callout
            className={assetsStyles.uploadCallout}
            role="dialog"
            gapSpace={0}
            target={`#${mkdirButtonId}`}
            onDismiss={() => {
              isShowMkdirCallout.set(false);
              newDirName.set("");
            }}
            setInitialFocus
          >
            <Text as="h1" block variant="xLarge" className={styles.title}>
              新建文件夹
            </Text>
            <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
              <TextField value={newDirName.value} onChange={(ev, val) => {
                newDirName.set(val??'');
              }} />
              <br />
              <PrimaryButton onClick={handleCreatNewDir}>创建</PrimaryButton>
            </div>
          </Callout>
        )}
      </div>
      <div className={assetsStyles.fileList}>
        {currentDirName !== "" && <div style={{display:"flex",alignItems:"center"}}>
          当前目录支持的文件类型：{currentDirExtName.value.map(e => {
            return <span key={e} className={assetsStyles.extNameShow}>{e}</span>;
          })}
        </div>
        }
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
function CommonFileButton(props: IFileDescription & { showOptions: boolean, onClick: Function, onRename: (newName: string) => void, onDelete: () => void }) {

  const showConformDeleteCallout = useValue(false);
  const showRenameCallout = useValue(false);
  const newFileName = useValue("");
  const renameButtonId = useId("renameBtn");
  const deleteButtonId = useId("deleteBtn");

  return <div className={assetsStyles.commonFileButton}>
    <div onClick={() => props.onClick()} className={assetsStyles.fileName}>
      {props.name}
    </div>
    {props.showOptions && <>
      <div onClick={() => {
        showRenameCallout.set(!showRenameCallout.value);
        newFileName.set(props.name);
      }} id={renameButtonId} className={assetsStyles.deleteButton}>
        <Editor theme="outline" size="24" fill="#333" strokeWidth={3} />
      </div>
      <div onClick={() => {
        showConformDeleteCallout.set(!showConformDeleteCallout.value);
      }} id={deleteButtonId} className={assetsStyles.deleteButton}>
        <DeleteOne theme="outline" size="24" fill="#333" strokeWidth={3} />
      </div>
      {showRenameCallout.value && <Callout
        className={assetsStyles.uploadCallout}
        role="dialog"
        gapSpace={0}
        target={`#${renameButtonId}`}
        onDismiss={() => {
          showRenameCallout.set(false);
          newFileName.set("");
        }}
        setInitialFocus
      >
        <Text as="h1" block variant="xLarge" className={styles.title}>
          重命名
        </Text>
        <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
          <TextField value={newFileName.value} onChange={(ev, val) => {
            newFileName.set(val??'');
          }} />
          <br />
          <PrimaryButton onClick={() => {
            props.onRename(newFileName.value);
            showRenameCallout.set(false);
          }}>重命名</PrimaryButton>
        </div>
      </Callout>}
      {showConformDeleteCallout.value && <Callout
        className={assetsStyles.uploadCallout}
        role="dialog"
        gapSpace={0}
        target={`#${deleteButtonId}`}
        onDismiss={() => {
          showConformDeleteCallout.set(false);
        }}
        setInitialFocus
      >
        <Text as="h1" block variant="xLarge" className={styles.title}>
          删除
        </Text>
        <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
          <PrimaryButton onClick={() => {
            props.onDelete();
            showConformDeleteCallout.set(false);
          }}>确认删除</PrimaryButton>
        </div>
      </Callout>}
    </>}
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
