import { useValue } from "../../../hooks/useValue";
import { useEffect } from "react";
import axios from "axios";
import { IFileInfo } from "webgal-terre-2/dist/Modules/webgal-fs/webgal-fs.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { logger } from "../../../utils/logger";
import { useId } from "@fluentui/react-hooks";
import { Callout, DefaultButton, Link, Text } from "@fluentui/react";
import styles from './chooseFile.module.scss';

export interface IChooseFile {
  sourceBase: string;
  onChange: (choosedFileName: string) => void;
  // 拓展名，要加.
  extName: string[];
}

export default function ChooseFile(props: IChooseFile) {
  const currentChildDir = useValue([]);
  const currentDirName = props.sourceBase + currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue([]);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  useEffect(() => {
    /**
     * 更新当前目录内的文件
     */
    getFileList(gameName, currentDirName, props.extName).then(result => {
      logger.debug("当前目录文件", result);
      currentDirFiles.set(result);
    });

  }, [currentDirName]);

  const isShowChooseFileCallout = useValue(false);
  const buttonId = useId("choosefile-callout");
  const labelId = useId("callout-label");
  const descriptionId = useId("callout-description");

  function toggleIsCalloutVisible() {
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  return <>
    <DefaultButton
      id={buttonId}
      onClick={toggleIsCalloutVisible}
      text={isShowChooseFileCallout.value ? "Hide callout" : "Show callout"}
    />
    {isShowChooseFileCallout.value && (
      <Callout
        ariaLabelledBy={labelId}
        ariaDescribedBy={descriptionId}
        role="dialog"
        gapSpace={0}
        target={`#${buttonId}`}
        onDismiss={toggleIsCalloutVisible}
        setInitialFocus
        className={styles.callout}
      >
        <Text as="h1" block variant="xLarge" id={labelId}>
          选择文件
        </Text>
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
  const rawFileList: IFileInfo[] = await axios.get(url).then((r) => r.data.dirInfo);
  if (extName.length === 0) {
    return rawFileList;
  }
  return rawFileList.filter((e: any) => extName.includes(e.extName) || e.isDir);
}
