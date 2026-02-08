import { useValue } from "../../../hooks/useValue";
import styles from "./chooseFile.module.scss";
import { FolderOpen, FolderWithdrawal, Notes } from "@icon-park/react";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { api } from "@/api";
import { t } from "@lingui/macro";
import Assets, { IFile, IFileConfig, IFileFunction } from "@/components/Assets/Assets";
import { join } from 'path';
import { ReactNode, useCallback, useEffect } from "react";
import { bundleIcon, DismissFilled, DismissRegular, WarningFilled, WarningRegular } from "@fluentui/react-icons";

const DismissIcon = bundleIcon(DismissFilled, DismissRegular);
const WarningIcon = bundleIcon(WarningFilled, WarningRegular);

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
  const invalidRanges = useValue<{ start: number; width: number }[]>([]);

  function checkFilePathValidity(filePath: string): boolean {
    const ranges: { start: number; width: number }[] = [];
    const regex = / -|[*#%&?@"<>|:]/g;
    let match;

    while ((match = regex.exec(filePath)) !== null) {
      const start = match.index;
      const width = match[0].length;

      if (ranges.length > 0) {
        const lastIssue = ranges[ranges.length - 1];
        const lastEnd = lastIssue.start + lastIssue.width;

        if (start <= lastEnd) {
          lastIssue.width = Math.max(lastIssue.width, start + width - lastIssue.start);
          continue;
        }
      }

      ranges.push({ start, width });
    }

    if (ranges.length > 0) {
      invalidPath.value = filePath;
      invalidRanges.value = ranges;
      return false;
    }

    invalidPath.value = '';
    invalidRanges.value = [];
    return true;
  }

  function invalidPathElement() {
    if (!invalidRanges.value || invalidRanges.value.length === 0 || !invalidPath.value) {
      return null;
    }

    const fullPath = invalidPath.value;
    const elements = [];
    let lastIndex = 0;

    const ranges = [...invalidRanges.value].sort((a, b) => a.start - b.start);

    ranges.forEach((range, index) => {
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {fullPath.substring(lastIndex, range.start)}
          </span>
        );
      }

      const invalidText = fullPath.substring(range.start, range.start + range.width);
      elements.push(
        <span key={`invalid-${index}`} className={styles.chooseFileFooterWarningCode}>
          {invalidText}
        </span>
      );

      lastIndex = range.start + range.width;
    });

    if (lastIndex < fullPath.length) {
      elements.push(
        <span key="text-end">
          {fullPath.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className={styles.chooseFileFooterWarningPath}>
        {elements}
      </div>
    );
  }

  function toggleIsCalloutVisible() {
    invalidPath.value = '';
    invalidRanges.value = [];
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

    if (!checkFilePathValidity(file.path)) {
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
      ? props.hiddenFiles.map(item => [[...basePath, item].join('/'), { isHidden: true }])
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
        <div style={{ display: 'inline-block' }}>
          {props.button ?? <Button style={{ minWidth: 0 }}>{isShowChooseFileCallout.value ? t`取消` : t`选择`}</Button>}
        </div>
      </PopoverTrigger>
      <PopoverSurface style={{ padding: 0 }}>
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
          {invalidRanges.value.length > 0 &&
            <div className={styles.chooseFileFooterWarning}>
              <div className={styles.chooseFileFooterWarningIcon}>
                <WarningIcon />
              </div>
              <div className={styles.chooseFileFooterWarningText}>
                {t`文件路径含有非法字符`}
                {invalidPathElement()}
              </div>
              <div>
                <Button
                  appearance="subtle"
                  icon={<DismissIcon />}
                  size="small"
                  title={t`清除提示`}
                  onClick={
                    () => {
                      invalidPath.value = '';
                      invalidRanges.value = [];
                    }
                  }
                />
              </div>

            </div>
          }
        </div>
      </PopoverSurface>
    </Popover>
  );
}
