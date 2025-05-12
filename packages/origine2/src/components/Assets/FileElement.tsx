import { getFileIcon, getDirIcon, extractExtension } from "@/utils/getFileIcon";
import { Popover, PopoverTrigger, Button, PopoverSurface, Input, Text, Subtitle1, Tooltip, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Subtitle2 } from "@fluentui/react-components";
import IconWrapper from "../iconWrapper/IconWrapper";
import { IFile, IViewType } from "./Assets";
import styles from "./FileElement.module.scss";
import { useValue } from '../../hooks/useValue';
import { bundleIcon, RenameFilled, RenameRegular, DeleteFilled, DeleteRegular, DesktopMacFilled, DesktopMacRegular, MoreVerticalFilled, MoreVerticalRegular } from "@fluentui/react-icons";
import { t } from "@lingui/macro";
import { useRef } from "react";

const RenameIcon = bundleIcon(RenameFilled, RenameRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);
const ThumbIcon = bundleIcon(DesktopMacFilled, DesktopMacRegular);

export default function FileElement(
  { file, type, selected, desc, currentPath, isProtected, disableTooltip, handleOpenFile, handleRenameFile, handleDeleteFile, checkHasFile }
    : {
      file: IFile,
      type: IViewType,
      selected?: boolean,
      desc?: string,
      currentPath: any,
      isProtected?: boolean,
      disableTooltip?: boolean,
      handleOpenFile: (file: IFile) => Promise<void>,
      handleRenameFile: (source: string, newName: string) => Promise<void>,
      handleDeleteFile: (source: string) => Promise<void>,
      checkHasFile: (fileNmae: string) => boolean,
    }) {
  const newFileName = useValue(file.name);
  const ShowThumbPopoverOpen = useValue(false);
  const FileItemSelfRef = useRef(null);

  const is_picture = (extName: string) => extractExtension(extName) === 'image' ? true : false;

  return (
    <Tooltip
      content={
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
          {file.name}
          {!file.isDir && <div style={{ color: 'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', }}>{((file.size ?? 0) / 1024).toFixed(2)} KB</div>}
          {file.lastModified && <div style={{ color: 'var(--text-weak)', fontSize: '11px', }}>{new Date(file.lastModified).toLocaleString()}</div>}
        </div>
      }
      relationship='description'
      positioning='below-end'
      visible={disableTooltip ? false : undefined}
    >
      <div
        ref={FileItemSelfRef}
        key={file.name}
        onClick={() => handleOpenFile(file)}
        className={`${styles.file} ${selected ? styles.fileSelected : ''} ${type === 'list' ? styles.list : styles.grid}`}
      >
        <div
          style={{
            width: type === 'list' ? '22px' : '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            overflow: 'hidden',
            aspectRatio: '4/3'
          }}>
          {
            !file.isDir && (
              is_picture(file.extName) && type === 'grid'
                ? <img src={file.path} style={{ width: '100%', height: '100%', objectFit: 'contain',}}/> 
                : <IconWrapper src={getFileIcon(file.name)} size={ type === 'grid' ? 44 : 22} iconSize={type === 'grid' ? 40 : 20} />
            )
          }
          {file.isDir && <IconWrapper src={getDirIcon(file.path)} size={type === 'grid' ? 44 : 22} iconSize={type === 'grid' ? 40 : 20} />}
        </div>
        <div style={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexGrow: 1,
            }}
            onMouseEnter={(e) => {
              if (is_picture(file.extName) && type === 'list') ShowThumbPopoverOpen.value = true;
            }}
            onMouseOut={(e) => {
              ShowThumbPopoverOpen.value = false;
            }}
          >
            {file.name}
          </span>
          {desc && <span style={{ color: 'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', paddingRight: '2px' }}>{desc}</span>}

          <div className={styles.fileAction}>
            {
              !isProtected &&
        <>
          <Popover withArrow onOpenChange={() => newFileName.set(file.name)}>
            <PopoverTrigger>
              <Button icon={<RenameIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                onClick={(e) => e.stopPropagation()} />
            </PopoverTrigger>
            <PopoverSurface onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle2>{t`重命名`}</Subtitle2>
                <Tooltip
                  content={{ children: t`已存在文件或文件夹 ${newFileName.value}，请输入其他名称`, style: { color: 'var(--danger)' } }}
                  relationship="description"
                  visible={checkHasFile(newFileName.value) && newFileName.value !== file.name}
                  positioning="below"
                >
                  <Input
                    value={newFileName.value}
                    className={checkHasFile(newFileName.value) && newFileName.value !== file.name ? styles.inputDanger : ''}
                    onFocus={ev => {
                      const el = ev.target;
                      const dotPosition = el.value.indexOf('.');
                      el?.setSelectionRange(0, dotPosition === -1 ? el.value.length : dotPosition);
                    }}
                    onChange={(_, data) => {
                      newFileName.set(data.value ?? "");
                    }}
                  />
                </Tooltip>
                <Button
                  appearance="primary"
                  disabled={newFileName.value.trim() === '' || checkHasFile(newFileName.value) && newFileName.value !== file.name}
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
                <Subtitle2>{t`删除`}</Subtitle2>
                <Text>{t`是否要删除 "${file.name}" ？`}</Text>
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
                positioning='after-bottom'
              >
                <PopoverTrigger>
                  <Button
                    icon={<ThumbIcon style={{ width: '16px' }} />} size='small' appearance='subtle'
                    onClick={(e) => e.stopPropagation()} />
                </PopoverTrigger>
                <PopoverSurface style={{ padding: '8px', }}>
                  <div style={{ width: "200px", maxHeight: "300px", display: "inline-block" }}>
                    <img src={file.path} className={styles.mosaicBg} alt={file.path}
                      decoding="async" loading="lazy" width='100%' height='100%' />
                  </div>
                </PopoverSurface>
              </Popover> : ''
            }           
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
