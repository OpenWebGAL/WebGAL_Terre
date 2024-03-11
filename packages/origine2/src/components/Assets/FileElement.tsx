import { getFileIcon, getDirIcon } from "@/utils/getFileIcon";
import { Popover, PopoverTrigger, Button, PopoverSurface, Input, Text, Subtitle1 } from "@fluentui/react-components";
import { t } from "i18next";
import IconWrapper from "../iconWrapper/IconWrapper";
import { FolderType, IFile } from "./Assets";
import styles from "./FileElement.module.scss";
import { useValue } from '../../hooks/useValue';
import { bundleIcon, RenameFilled, RenameRegular, DeleteFilled, DeleteRegular } from "@fluentui/react-icons";
import { ITag, statusActions } from "@/store/statusReducer";
import { RootState } from "@/store/origineStore";
import { useDispatch, useSelector } from "react-redux";
import useTrans from "@/hooks/useTrans";

const RenameIcon = bundleIcon(RenameFilled, RenameRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

export default function FileElement(
  { file, desc, currentPath, isProtected, folderType, handleRenameFile, handleDeleteFile }
    : {
      file: IFile,
      desc?: string,
      currentPath: any,
      folderType?: FolderType,
      isProtected?: boolean,
      handleRenameFile: (source: string, newName: string) => Promise<void>,
      handleDeleteFile: (source: string) => Promise<void>,
    }) {
  const t = useTrans();
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.status.editor.tags);
  const newFileName = useValue(file.name);

  const isScene = () => (folderType === 'scene') && file.name.endsWith('.txt');

  return (
    <div
      key={file.name}
      onClick={() => {
        if (file.isDir) {
          currentPath.set([...currentPath.value, file.name]);
        }
        else {
          const target = file.path;
          const tag: ITag = {
            tagName: file.name,
            tagTarget: file.path,
            tagType: isScene() ? 'scene' : 'asset',
          };
          // 先要确定没有这个tag
          const result = tags.findIndex((e) => e.tagTarget === target);
          if (result < 0) dispatch(statusActions.addEditAreaTag(tag));
          dispatch(statusActions.setCurrentTagTarget(target));
        }
      }}
      className={styles.file}
    >
      {!file.isDir && <IconWrapper src={getFileIcon(file.name)} size={22} iconSize={20} />}
      {file.isDir && <IconWrapper src={getDirIcon(file.path)} size={22} iconSize={20} />}
      <div style={{
        flexGrow: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      >
        {file.name} {desc && <span style={{color:'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', }}>{desc}</span>}
      </div>

      {
        !isProtected &&
        <>
          <Popover withArrow onOpenChange={() => (newFileName.value === '') && newFileName.set(file.name)}>
            <PopoverTrigger>
              <Button icon={<RenameIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle1>{t("$common.rename")}</Subtitle1>
                <Input value={newFileName.value} onChange={(_, data) => {
                  newFileName.set(data.value ?? "");
                }} />
                <Button
                  appearance="primary"
                  disabled={newFileName.value === ''}
                  onClick={() => {
                    handleRenameFile(`${currentPath.value.join('/')}/${file.name}`, newFileName.value);
                    newFileName.set(file.name);
                  }}
                >{t("$common.rename")}</Button>
              </div>
            </PopoverSurface>
          </Popover>

          <Popover withArrow>
            <PopoverTrigger>
              <Button icon={<DeleteIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px"}}>
                <Subtitle1>{t("$common.delete")}</Subtitle1>
                <Button
                  appearance="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(`${currentPath.value.join('/')}/${file.name}`);
                  }}
                >{t("$common.delete")}</Button>
              </div>
            </PopoverSurface>
          </Popover>
        </>
      }
    </div>
  );
}