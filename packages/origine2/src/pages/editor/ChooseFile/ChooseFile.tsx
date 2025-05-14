import {useValue} from "../../../hooks/useValue";
import styles from "./chooseFile.module.scss";
import {FolderOpen, FolderWithdrawal, Notes} from "@icon-park/react";
import {Button, Input, Popover, PopoverSurface, PopoverTrigger} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import {api} from "@/api";
import {t} from "@lingui/macro";
import Assets, {IFile, IFileConfig, IFileFunction} from "@/components/Assets/Assets";
import {join} from 'path';
import { ReactNode } from "react";

export interface IChooseFile {
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

  function toggleIsCalloutVisible() {
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  async function onChooseFile(file: IFile, type: 'scene' | 'asset') {
    toggleIsCalloutVisible();
    props.onChange({...file, name: file?.path.split(`${[...basePath].join('/')}/`).slice(1).join('/') ?? ''});
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
            {t`选择`}
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
        </div>
      </PopoverSurface>
    </Popover>
  );
}
