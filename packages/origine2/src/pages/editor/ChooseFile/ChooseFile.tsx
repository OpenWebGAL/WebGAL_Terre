import { useValue } from "../../../hooks/useValue";
import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useId } from "@fluentui/react-hooks";
import { Callout, DefaultButton, Text } from "@fluentui/react";
import styles from "./chooseFile.module.scss";

export interface IChooseFile {
  sourceBase: string;
  onChange: (choosedFileDescription:IFileDescription | null) => void;
  // 拓展名，要加.
  extName: string[];
}

export interface IFileDescription {
  extName: string;
  isDir: boolean;
  name: string;
  path: string;
}

export default function ChooseFile(props: IChooseFile) {
  const currentChildDir = useValue([]);
  const currentDirName = props.sourceBase + currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue<IFileDescription[]>([]);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  useEffect(() => {
    /**
     * 更新当前目录内的文件
     */
    getFileList(gameName, currentDirName, props.extName).then(result => {
      currentDirFiles.set(result);
    });

  }, [currentDirName]);

  const isShowChooseFileCallout = useValue(false);
  const buttonId = useId("choosefile-callout");

  function toggleIsCalloutVisible() {
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  function onChooseFile(fileDescription:IFileDescription){
    toggleIsCalloutVisible();
    props.onChange(fileDescription);
  }

  const fileSelectButtonList = currentDirFiles.value.map(file=>{
    return <div key={file.path} className={styles.choseFileButton} onClick={()=>onChooseFile(file)}>
      {file.name}
    </div>;
  });

  return <>
    <DefaultButton
      id={buttonId}
      onClick={isShowChooseFileCallout.value ? ()=>{toggleIsCalloutVisible();
        props.onChange(null);
      } : toggleIsCalloutVisible}
      text={isShowChooseFileCallout.value ? "取消选择" : "选择文件"}
    />
    {isShowChooseFileCallout.value && (
      <Callout
        role="dialog"
        gapSpace={0}
        target={`#${buttonId}`}
        onDismiss={toggleIsCalloutVisible}
        setInitialFocus
        className={styles.callout}
      >
        <div className={styles.chooseFileCalloutTitle}>
          选择文件
        </div>
        {fileSelectButtonList}
      </Callout>
    )}
  </>;
}

/**
 * 请求目录内文件的函数
 * @param currentGameName 游戏名
 * @param childDir 目录
 * @param extName 拓展名，要加.
 */
async function getFileList(currentGameName: string, childDir: string, extName: string[]) {
  const url = `/api/manageGame/readGameAssets/${currentGameName}/game/${childDir}`;
  const rawFileList: IFileDescription[] = await axios.get(url).then((r) => r.data.dirInfo);
  if (extName.length === 0) {
    return rawFileList;
  }
  return rawFileList.filter((e: any) => extName.includes(e.extName) || e.isDir);
}
