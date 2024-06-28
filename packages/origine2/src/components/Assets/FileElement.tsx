import { getFileIcon, getDirIcon, extractExtension } from "@/utils/getFileIcon";
import { Popover, PopoverTrigger, Button, PopoverSurface, Input, Text, Subtitle1 } from "@fluentui/react-components";
import IconWrapper from "../iconWrapper/IconWrapper";
import { IFile } from "./Assets";
import styles from "./FileElement.module.scss";
import { useValue } from '../../hooks/useValue';
import { bundleIcon, RenameFilled, RenameRegular, DeleteFilled, DeleteRegular, DesktopMacFilled, DesktopMacRegular } from "@fluentui/react-icons";
import { t } from "@lingui/macro";
import { useRef } from "react";

const RenameIcon = bundleIcon(RenameFilled, RenameRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);
const ThumbIcon = bundleIcon(DesktopMacFilled, DesktopMacRegular);

export default function FileElement(
  { file, desc, currentPath, isProtected, handleOpenFile, handleRenameFile, handleDeleteFile }
    : {
      file: IFile,
      desc?: string,
      currentPath: any,
      isProtected?: boolean,
      handleOpenFile: (file: IFile) => Promise<void>,
      handleRenameFile: (source: string, newName: string) => Promise<void>,
      handleDeleteFile: (source: string) => Promise<void>,
    }) {
  const newFileName = useValue(file.name);
  const ShowThumbPopoverOpen = useValue(false);
  const FileItemSelfRef = useRef(null);

  const is_picture = (extName: string) => extractExtension(extName) === 'image' ? true : false;

  return (
    <div
      ref={FileItemSelfRef}
      key={file.name}
      onClick={() => handleOpenFile(file)}
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
        <span
          onMouseEnter={(e) => {
            if (is_picture(file.extName)) ShowThumbPopoverOpen.value = true;
          }}
          onMouseOut={(e) => {
            ShowThumbPopoverOpen.value = false;
          }}>{file.name}</span> {desc && <span style={{ color: 'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', }}>{desc}</span>}
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
                <Subtitle1>{t`重命名`}</Subtitle1>
                <Input
                  value={newFileName.value}
                  onFocus={ev => {
                    const el = ev.target;
                    const dotPosition = el.value.indexOf('.');
                    el?.setSelectionRange(0, dotPosition === -1 ? el.value.length : dotPosition);
                  }}
                  onChange={(_, data) => {
                    newFileName.set(data.value ?? "");
                  }}
                />
                <Button
                  appearance="primary"
                  disabled={newFileName.value.trim() === ''}
                  onClick={() => handleRenameFile(`${currentPath.value.join('/')}/${file.name}`, newFileName.value.trim())}
                >{t`重命名`}</Button>
              </div>
            </PopoverSurface>
          </Popover>

          <Popover withArrow>
            <PopoverTrigger>
              <Button icon={<DeleteIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle1>{t`删除`}</Subtitle1>
                <Button
                  appearance="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(`${currentPath.value.join('/')}/${file.name}`);
                  }}
                >{t`删除`}</Button>
              </div>
            </PopoverSurface>
          </Popover>
        </>
      }
      {
        is_picture(file.extName) ? <Popover
          withArrow
          open={ShowThumbPopoverOpen.value}
          onOpenChange={() => ShowThumbPopoverOpen.set(!ShowThumbPopoverOpen.value)}
        >
          <PopoverTrigger>
            <Button
              icon={<ThumbIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
              onClick={(e) => e.stopPropagation()} />
          </PopoverTrigger>
          <PopoverSurface style={{ padding: '8px', }}>
            <div style={{ width: "200px", maxHeight: "300px", overflow: 'hidden', display: "inline-block" }}>
              <img src={file.path} style={{ objectFit: "cover" }} alt={file.path}
                decoding="async" loading="lazy" width='100%' height='100%' />
            </div>
          </PopoverSurface>
        </Popover> : ''
      }
    </div>
  );
}
