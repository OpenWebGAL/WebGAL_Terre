import { useValue } from "../../../hooks/useValue";
import { useEffect } from "react";
import axios from "axios";
import { IFileInfo } from "webgal-terre-2/dist/Modules/webgal-fs/webgal-fs.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { logger } from "../../../utils/logger";

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

  return <div>123</div>;
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
