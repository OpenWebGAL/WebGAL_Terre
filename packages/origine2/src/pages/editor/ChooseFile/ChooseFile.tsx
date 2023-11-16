import { useValue } from "../../../hooks/useValue";
import { useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { useId } from "@fluentui/react-hooks";
import { Callout, DefaultButton, TextField } from "@fluentui/react";
import styles from "./chooseFile.module.scss";
import { FolderOpen, FolderWithdrawal, Notes } from "@icon-park/react";
import useTrans from "@/hooks/useTrans";

export interface IChooseFile {
  sourceBase: string;
  onChange: (choosedFileDescription: IFileDescription | null) => void;
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
  const t = useTrans('editor.fileChoose.');
  const currentChildDir = useValue<string[]>([]);
  const currentDirName = props.sourceBase + currentChildDir.value.reduce((prev, curr) => prev + "/" + curr, "");
  const currentDirFiles = useValue<IFileDescription[]>([]);
  const fileSearch = useValue<string>('');
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const updateFileList = ()=>{
    /**
     * 更新当前目录内的文件
     */
    getFileList(gameName, currentDirName, props.extName).then(result => {
      currentDirFiles.set(result);
    });
  };

  useEffect(() => {
    updateFileList();
  }, [currentDirName]);

  const isShowChooseFileCallout = useValue(false);
  const buttonId = useId("choosefile-callout");

  function toggleIsCalloutVisible() {
    updateFileList();
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  function onChooseFile(fileDescription: IFileDescription) {
    toggleIsCalloutVisible();
    fileDescription.name = currentChildDir.value.reduce((prev, curr) => prev + curr + "/", "") + fileDescription.name;
    props.onChange(fileDescription);
  }

  function onEnterChildDir(dirName: string) {
    currentChildDir.set([...currentChildDir.value, dirName]);
  }

  function onBack() {
    currentChildDir.set(currentChildDir.value.slice(0, currentChildDir.value.length - 1));
  }

  const fileSelectButtonList = useMemo(() => currentDirFiles.value
    .filter(f => f.name.includes(fileSearch.value))
    .sort((a, b) => a.name.indexOf(fileSearch.value) - b.name.indexOf(fileSearch.value))
    .map(file => {
      if (file.isDir) {
        return <div key={file.path} className={styles.choseFileButton} onClick={() => onEnterChildDir(file.name)}>
          <FolderOpen theme="multi-color" size="24"/>
          {'\u00a0\u00a0'}
          {file.name}
        </div>;
      }
      return <div key={file.path} className={styles.choseFileButton} onClick={() => onChooseFile(file)}>
        <Notes theme="multi-color" size="24"/>
        {'\u00a0\u00a0'}
        {file.name}
      </div>;
    }), [currentDirFiles, fileSearch.value]);

  function onCancel(){
    toggleIsCalloutVisible();
    props.onChange(null);
  }

  return <>
    <DefaultButton
      id={buttonId}
      onClick={isShowChooseFileCallout.value ? onCancel : toggleIsCalloutVisible}
      text={isShowChooseFileCallout.value ? t('cancel') : t('choose')}
    />
    {isShowChooseFileCallout.value && (
      <Callout
        role="dialog"
        gapSpace={0}
        target={`#${buttonId}`}
        onDismiss={onCancel}
        setInitialFocus
        className={styles.callout}
      >
        <div className={styles.chooseFileCalloutContentWarpper}>
          <div className={styles.chooseFileCalloutTitle}>
            {t('choose')}
          </div>
          <div className="file-search">
            <TextField label={t('fileSearch')} onChange={(ev, newValue) => fileSearch.set(newValue || '')}/>
          </div>
          <div className={styles.chooseFileFileListWarpper}>
            {currentChildDir.value.length > 0 && (
              <div className={styles.choseFileButton} onClick={onBack}>
                <FolderWithdrawal theme="multi-color" size="24"/>
                {'\u00a0\u00a0'}
                ...
              </div>)}
            {fileSelectButtonList}
          </div>
        </div>
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
export async function getFileList(currentGameName: string, childDir: string, extName: string[]) {
  const url = `/api/manageGame/readGameAssets/${currentGameName}/game/${childDir}`;
  const rawFileList: IFileDescription[] = await axios.get(url).then((r) => r.data.dirInfo);
  if (extName.length === 0) {
    return rawFileList;
  }
  for(const e of rawFileList){
    e.extName = e.extName.toLowerCase();
  }
  return rawFileList.filter((e: any) => extName.includes(e.extName) || e.isDir);
}
