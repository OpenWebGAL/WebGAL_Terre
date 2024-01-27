import assetsStyles from "./assets.module.scss";
import axios from "axios";
import { origineStore, RootState } from "../../../../../store/origineStore";
import { useValue } from "../../../../../hooks/useValue";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { getFileList, IFileDescription } from "../../../ChooseFile/ChooseFile";
import { dirnameToDisplayNameMap, dirNameToExtNameMap } from "../../../ChooseFile/chooseFileConfig";
import { DeleteOne, Editor, FolderOpen, FolderPlus, LeftSmall, Upload } from "@icon-park/react";
import { ITag, statusActions } from "../../../../../store/statusReducer";
import { extractPathAfterPublic } from "../../../ResourceDisplay/ResourceDisplay";
import useTrans from "@/hooks/useTrans";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import { getDirIcon, getFileIcon } from "@/utils/getFileIcon";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import { api } from "@/api";
import { RequestParams } from "@/api/Api";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Text } from "@fluentui/react-components";

export default function Assets() {
  const t = useTrans("editor.sideBar.assets.");

  /**
   * 上传文件
   */

  const isShowUploadCallout = useValue(false);

  /**
   * 当前目录，以及包含文件
   */
  const currentChildDir = useValue<string[]>([],true,'current-child-dir-hold');
  const currentDirName = currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue<IFileDescription[]>([]);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const currentDirExtName = useValue<string[]>(["unset"],true,'current-dir-ext-name');
  const currentDirExtNameKey = currentDirExtName.value.toString();
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.status.editor.tags);

  function open_assets() {
    api.manageGameControllerOpenGameAssetsDict( gameName, { subFolder: currentDirName }).then();
  }

  /**
   * 新建文件夹
   */
  const isShowMkdirCallout = useValue(false);
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
      const dirName = dirnameToDisplayNameMap.get(fileDesc.name);
      const currentFileName = dirName ? dirName() : fileDesc.name;
      if (currentFileName === t("folders.scene")) return null;
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
          currentDirExtName.set(targetDirExtName);
        }} />;
    });
  } else {
    currentFileList = currentDirFiles.value.map((fileDesc) => {
      const dirName = dirnameToDisplayNameMap.get(fileDesc.name);
      const currentFileName = dirName ? dirName() : fileDesc.name;

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
            const target = fileDesc.path;
            const tag: ITag = {
              tagName: fileDesc.name,
              tagTarget: fileDesc.path,
              tagType: "asset"
            };
            // 先要确定没有这个tag
            const result = tags.findIndex((e) => e.tagTarget === target);
            if (result < 0) dispatch(statusActions.addEditAreaTag(tag));
            dispatch(statusActions.setCurrentTagTarget(target));
          }
        }} />;
    });
  }

  return (
    <div style={{ height: "100%", overflow: "auto", display: "flex", flexFlow: "column" }}>
      {/* <TagTitleWrapper title={t("title")} extra={<div className="tag_title_button" onClick={open_assets}>
        {t("buttons.openFolder")}
      </div>} /> */}
      <div className={assetsStyles.controlHead}>
        {
          currentDirName &&
          <div className={assetsStyles.controlCommonButton} onClick={goBack}>
            <LeftSmall theme="outline" strokeWidth={3} size="18" className={assetsStyles.iconParkIcon} />
          </div>
        }
        <div className={assetsStyles.controlDirnameDisplay}>
          {currentDirName === "" ? "/" : currentDirName}
        </div>
        {currentDirName !== "" &&
          <>
            <Popover
              withArrow
              open={isShowUploadCallout.value}
              onOpenChange={() => isShowUploadCallout.set(!isShowUploadCallout.value)}
            >
              <PopoverTrigger>
                <div className={assetsStyles.controlCommonButton}>
                  <Upload theme="outline" size="18" strokeWidth={3} className={assetsStyles.iconParkIcon} />
                </div>
              </PopoverTrigger>
              <PopoverSurface>
                <Text as="h3" block size={500}>
                  {t("buttons.uploadAsset")}
                </Text>
                <FileUploader onUpload={() => {
                  isShowUploadCallout.set(false);
                  refreshCurrentDir();
                }} targetDirectory={`public/games/${gameName}/game${currentDirName}`}
                uploadUrl="/api/manageGame/uploadFiles" />
              </PopoverSurface>
            </Popover>

            <Popover
              withArrow
              open={isShowMkdirCallout.value}
              onOpenChange={() => {
                isShowMkdirCallout.set(!isShowMkdirCallout.value);
                newDirName.set("");
              }}
            >
              <PopoverTrigger>
                <div className={assetsStyles.controlCommonButton}>
                  <FolderPlus theme="outline" size="18" strokeWidth={3} className={assetsStyles.iconParkIcon} />
                </div>
              </PopoverTrigger>
              <PopoverSurface>
                <Text as="h3" block size={500}>
                  {t("buttons.createNewFolder")}
                </Text>
                <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
                  <Input value={newDirName.value} onChange={(ev, data) => {
                    newDirName.set(data.value ?? "");
                  }} />
                  <br />
                  <Button appearance="primary" onClick={handleCreatNewDir}>{t("$common.create")}</Button>
                </div>
              </PopoverSurface>
            </Popover>
          </>
        }

        <div className={assetsStyles.controlCommonButton}
          onClick={() => open_assets()}>
          <FolderOpen theme="outline" size="18" strokeWidth={3} className={assetsStyles.iconParkIcon} />
        </div>
      </div>
      <div className={assetsStyles.fileList}>
        {currentDirName !== "" && <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
          {t("supportFileTypes")} {currentDirExtName.value.map(e => {
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
function CommonFileButton(props: IFileDescription & {
  showOptions: boolean,
  onClick: Function,
  onRename: (newName: string) => void,
  onDelete: () => void
}) {
  const t = useTrans("editor.sideBar.assets.");

  const showConformDeleteCallout = useValue(false);
  const showRenameCallout = useValue(false);
  const newFileName = useValue("");

  return <div className={assetsStyles.commonFileButton} onClick={() => props.onClick()}>
    {!props.isDir && <IconWrapper src={getFileIcon(props.name)} size={22} iconSize={20} />}
    {props.isDir && <IconWrapper src={getDirIcon(props.path)} size={22} iconSize={20} />}
    <div className={assetsStyles.fileName}>
      {props.name}
    </div>
    {props.showOptions &&
    <>
      <Popover
        withArrow
        onOpenChange={() => {
          newFileName.set("");
        }}
      >
        <PopoverTrigger>
          <div
            onClick={(e) => {
              e.stopPropagation();
              newFileName.set(props.name);
            }}
            className={assetsStyles.deleteButton} 
            style={{ display: showRenameCallout.value ? "block" : undefined }}
          >
            <Editor theme="outline" size="18" className={assetsStyles.iconParkIcon} strokeWidth={3} />
          </div>
        </PopoverTrigger>
        <PopoverSurface onClick={(e) => e.stopPropagation()}>
          <Text as="h3" block size={500}>
            {t("buttons.rename")}
          </Text>
          <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
            <Input value={newFileName.value} onChange={(ev, data) => {
              newFileName.set(data.value ?? "");
            }} />
            <br />
            <Button appearance="primary" onClick={() => {
              props.onRename(newFileName.value);
              showRenameCallout.set(false);
            }}>{t("buttons.rename")}</Button>
          </div>
        </PopoverSurface>
      </Popover>
      <Popover
        withArrow
      >
        <PopoverTrigger>
          <div
            onClick={(e) => e.stopPropagation()} 
            className={assetsStyles.deleteButton} 
            style={{ display: showRenameCallout.value ? "block" : undefined}}
          >
            <DeleteOne theme="outline" size="18" className={assetsStyles.iconParkIcon} strokeWidth={3} />
          </div>
        </PopoverTrigger>
        <PopoverSurface onClick={(e) => e.stopPropagation()}>
          <Text as="h3" block size={500}>
            {t("$common.delete")}
          </Text>
          <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
            <Button appearance="primary" onClick={() => {
              props.onDelete();
              showConformDeleteCallout.set(false);
            }}>{t("buttons.deleteSure")}</Button>
          </div>
        </PopoverSurface>
      </Popover>
    </>
    }
  </div>;
}

interface IFileUploaderProps {
  targetDirectory: string;
  uploadUrl: string;
  onUpload: () => void;
}

function FileUploader({ targetDirectory, uploadUrl, onUpload }: IFileUploaderProps) {
  const t = useTrans("editor.sideBar.assets.");

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
      <button className={assetsStyles.fileSelectButton} onClick={handleUpload}>{t("buttons.upload")}</button>
    </div>
  );
}
