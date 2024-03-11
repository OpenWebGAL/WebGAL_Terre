import { getFileIcon, getDirIcon } from "@/utils/getFileIcon";
import { Popover, PopoverTrigger, Button, PopoverSurface, Input, Text } from "@fluentui/react-components";
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
  { file, name, currentPath, isProtected, folderType, handleRenameFile, handleDeleteFile }
    : {
      file: IFile,
      name?: string,
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
        {file.name} {name && <span style={{color:'var(--text-weak)', fontSize: '12px'}}>({name})</span>}
      </div>

      {
        !isProtected &&
        <>
          <Popover withArrow>
            <PopoverTrigger>
              <Button icon={<RenameIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <Text as="h3" block size={500}>
                {t("$common.rename")}
              </Text>
              <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
                <Input value={newFileName.value} onChange={(_, data) => {
                  newFileName.set(data.value ?? "");
                }} />
                <br />
                <Button appearance="primary" onClick={() => {
                  handleRenameFile(`${currentPath.value.join('/')}/${file.name}`, newFileName.value);
                  newFileName.set(file.name);
                }}>{t("$common.rename")}</Button>
              </div>
            </PopoverSurface>
          </Popover>

          <Popover withArrow>
            <PopoverTrigger>
              <Button icon={<DeleteIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <Text as="h3" block size={500}>
                {t("$common.delete")}
              </Text>
              <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
                <Button appearance="primary"
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