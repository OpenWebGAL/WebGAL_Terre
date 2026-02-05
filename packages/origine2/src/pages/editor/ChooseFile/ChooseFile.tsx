import {useValue} from "../../../hooks/useValue";
import styles from "./chooseFile.module.scss";
import {FolderOpen, FolderWithdrawal, Notes} from "@icon-park/react";
import {Button, Input, Popover, PopoverSurface, PopoverTrigger} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import {api} from "@/api";
import {t} from "@lingui/macro";
import Assets, {IFile, IFileConfig, IFileFunction} from "@/components/Assets/Assets";
import {join} from 'path';
import { ReactNode, useCallback } from "react";

export interface IChooseFile {
  title?: string;
  rootPath?: string[];
  basePath?: string[]; // 相对于rootPath的路径
  button?: ReactNode;
  selectedFilePath?: string | null; // 默认选中文件路径
  onChange: (choosedFile: IFile | null) => void;
  extNames?: string[]; // 允许的拓展名
  hiddenFiles?: string[];
}

export default function ChooseFile(props: IChooseFile) {
  const gameDir = useEditorStore.use.subPage();

  const rootPath = props.rootPath ?? ['games', gameDir, 'game'];
  const basePath = props.basePath ?? [];

  const isShowChooseFileCallout = useValue(false);

  const invalidPath = useValue('');
  const invalidRange = useValue<{start: number; width: number} | null>(null);

  function checkFilePathValidity(filePath: string): boolean {
    // 检查是否包含非法字符
    const argSymbolIndex = filePath.indexOf(' -');

    let isValid = true;
    if (argSymbolIndex !== -1) {
      isValid = false;
      invalidPath.value = filePath;
      invalidRange.value = {start: argSymbolIndex, width: 2};
    } else {
      invalidPath.value = '';
      invalidRange.value = null;
    }
    return isValid;
  }

  function invalidPathElement() {
    if (!invalidRange.value) {
      return null;
    }
    const strBeforeInvalid = invalidPath.value.substring(0, invalidRange.value.start);
    const strInvalid = invalidPath.value.substring(invalidRange.value.start, invalidRange.value.start + invalidRange.value.width);
    const strAfterInvalid = invalidPath.value.substring(invalidRange.value.start + invalidRange.value.width);
    return (
      <div className={styles.chooseFileFooterWarningPath}>
        {strBeforeInvalid}
        <div className={styles.chooseFileFooterWarningCode}>
          {strInvalid}
        </div>
        {strAfterInvalid}
      </div>
    );
  }

  function toggleIsCalloutVisible() {
    invalidPath.value = '';
    invalidRange.value = null;
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  async function onChooseFile(file: IFile, type: 'scene' | 'asset') {
    const prefix = `${basePath.join('/')}/`;
    // 移除开头的 basePath/
    let fileName = file.path.startsWith(prefix)
      ? file.path.substring(prefix.length)
      : file.path;
    // 转义;
    fileName = fileName.replace(';', '\\;');

    if (!checkFilePathValidity(fileName)) {
      return;
    }
  
    toggleIsCalloutVisible();
    props.onChange({
      ...file,
      name: fileName,
    });
  }

  const fileFunction: IFileFunction = {
    open: onChooseFile,
  };

  const fileConfig: IFileConfig = new Map(
    props.hiddenFiles
      ? props.hiddenFiles.map(item => [[...basePath, item].join('/'), {isHidden: true}])
      : []
  );

  return (
    <Popover
      withArrow
      trapFocus
      open={isShowChooseFileCallout.value}
      onOpenChange={toggleIsCalloutVisible}
    >
      <PopoverTrigger>
        <div style={{display: 'inline-block'}}>
          { props.button ?? <Button style={{minWidth: 0}}>{isShowChooseFileCallout.value ? t`取消` : t`选择`}</Button>}      
        </div>
      </PopoverTrigger>
      <PopoverSurface style={{padding: 0}}>
        <div className={styles.chooseFileContentWarpper}>
          <div className={styles.chooseFileTitle}>
            {props.title ?? t`选择文件`}
          </div>
          <Assets
            rootPath={rootPath}
            basePath={basePath}
            selectedFilePath={props.selectedFilePath?.split('/')}
            isProtected
            fileFunction={fileFunction}
            fileConfig={fileConfig}
            allowedExtNames={props.extNames}
          />
          { invalidRange.value &&
            <div className={styles.chooseFileFooterWarning}>
              {t`文件路径含有非法字符`}
              {invalidPathElement()}
            </div>
          }
        </div>
      </PopoverSurface>
    </Popover>
  );
}
