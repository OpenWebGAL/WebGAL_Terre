import {useValue} from "../../../hooks/useValue";
import {useEffect, useMemo} from "react";
import styles from "./chooseFile.module.scss";
import {FolderOpen, FolderWithdrawal, Notes} from "@icon-park/react";
import {Button, Input, Popover, PopoverSurface, PopoverTrigger} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import {api} from "@/api";
import {t} from "@lingui/macro";
import Assets, {IFile, IFileConfig, IFileFunction} from "@/components/Assets/Assets";
import {join} from 'path';

export interface IChooseFile {
  sourceBase: string;
  onChange: (choosedFile: IFile | null) => void;
  // 拓展名，要加.
  extName: string[];
  hiddenFiles?: string[];
}

export default function ChooseFile(props: IChooseFile) {
  const currentDirName = props.sourceBase;
  const subPage = useEditorStore.use.subPage();
  const gameName = subPage;

  const isShowChooseFileCallout = useValue(false);

  function toggleIsCalloutVisible() {
    isShowChooseFileCallout.set(!isShowChooseFileCallout.value);
  }

  async function onChooseFile(file: IFile, type: 'scene' | 'asset') {
    toggleIsCalloutVisible();
    props.onChange({...file, name: file?.pathFromBase ?? ''});
  }

  const fileFunction: IFileFunction = {
    open: onChooseFile,
  };

  const fileConfig: IFileConfig = new Map(
    props.hiddenFiles
      ? props.hiddenFiles.map(item => [`games/${gameName}/game/${currentDirName}/${item}`, {isHidden: true}])
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
        <Button style={{minWidth: 0}}>{isShowChooseFileCallout.value ? t`取消` : t`选择`}</Button>
      </PopoverTrigger>
      <PopoverSurface style={{padding: 0}}>
        <div className={styles.chooseFileContentWarpper}>
          <div className={styles.chooseFileTitle}>
            {t`选择`}
          </div>
          <Assets
            basePath={['games', gameName, 'game', ...currentDirName.split('/')]}
            isProtected
            fileFunction={fileFunction}
            fileConfig={fileConfig}
          />
        </div>
      </PopoverSurface>
    </Popover>
  );
}
