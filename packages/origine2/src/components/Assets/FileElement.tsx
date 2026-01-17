import { checkFileName } from "@/utils/checkFileName";
import { extractExtension, getDirIcon, getFileIcon } from "@/utils/getFileIcon";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle2, Text, Tooltip } from '@fluentui/react-components';
import { bundleIcon, DeleteFilled, DeleteRegular, RenameFilled, RenameRegular } from "@fluentui/react-icons";
import { t } from "@lingui/macro";
import { useRef } from "react";
import { useValue } from '../../hooks/useValue';
import IconWrapper from "../iconWrapper/IconWrapper";
import { IFile, IViewType } from "./Assets";
import styles from "./FileElement.module.scss";

const RenameIcon = bundleIcon(RenameFilled, RenameRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

export default function FileElement(
  {
    rootPath,
    file,
    type,
    selected,
    desc,
    isProtected,
    handleOpenFile,
    handleRenameFile,
    handleDeleteFile,
    checkHasFile,
  }: {
    rootPath: string[],
    file: IFile,
    type: IViewType,
    selected?: boolean,
    desc?: string,
    isProtected?: boolean,
    handleOpenFile: (file: IFile) => Promise<void>,
    handleRenameFile: (source: string, newName: string) => Promise<void>,
    handleDeleteFile: (source: string) => Promise<void>,
    checkHasFile: (fileNmae: string) => boolean,
  }) {
  const newFileName = useValue(file.name);
  const FileItemSelfRef = useRef(null);
  const showTooltip = useValue(false);

  const filePath = [...rootPath, file.path].join('/');

  const is_picture = (extName: string) => extractExtension(extName) === 'image' ? true : false;

  const isAccessible = checkFileName(newFileName.value);

  return (
    <Tooltip
      content={
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: 0 }}
          onMouseEnter={() => showTooltip.set(false)}
          onMouseMove={() => showTooltip.set(false)}
        >
          {
            is_picture(file.extName)
            &&
            <div style={{ marginTop: '8px', marginBottom: '4px' }}>
              <img
                className={styles.mosaicBg}
                src={filePath}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          }
          {file.path}
          {
            !file.isDir
            &&
            <div style={{ color: 'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
              {((file.size ?? 0) / 1024).toFixed(2)} KB
            </div>
          }
          {file.lastModified && <div style={{ color: 'var(--text-weak)', fontSize: '11px', }}>{new Date(file.lastModified).toLocaleString()}</div>}
        </div>
      }
      relationship='description'
      positioning='after-bottom'
      onVisibleChange={(e, data) => showTooltip.set(data.visible)}
      visible={showTooltip.value}
    >
      <div
        ref={FileItemSelfRef}
        key={file.name}
        onClick={() => handleOpenFile(file)}
        className={`${styles.file} ${selected ? styles.fileSelected : ''} ${type === 'list' ? styles.list : styles.grid}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "copy";
          e.dataTransfer.setData('text/plain', file.path.split('/').slice(1).join('/'));
        }}
        onMouseEnter={() => showTooltip.set(true)}
        onMouseLeave={() => showTooltip.set(false)}
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
                ? <img src={filePath} draggable='false' style={{ width: '100%', height: '100%', objectFit: 'contain', }} />
                : <IconWrapper src={getFileIcon(file.name)} size={type === 'grid' ? 44 : 22} iconSize={type === 'grid' ? 40 : 20} />
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
                    <Tooltip content={t`重命名`} relationship="label" positioning="below">
                      <Button
                        icon={<RenameIcon style={{ width: '16px' }} />}
                        size='small'
                        appearance='subtle'
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverSurface
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if ((e.key === 'Enter') && !(newFileName.value.trim() === '' || !isAccessible || checkHasFile(newFileName.value) && newFileName.value !== file.name)) {
                        handleRenameFile(filePath, newFileName.value.trim());
                      };
                    }}
                  >
                    <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                      <Subtitle2>{t`重命名`}</Subtitle2>
                      <Tooltip
                        content={{ children: t`文件名不可包含特殊符号: '/\\:*?"<>|'`, style: { color: 'var(--danger)' } }}
                        relationship="inaccessible"
                        visible={!isAccessible}
                        positioning="below"
                      >
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
                      </Tooltip>
                      <Button
                        appearance="primary"
                        disabled={newFileName.value.trim() === '' || !isAccessible || checkHasFile(newFileName.value) && newFileName.value !== file.name}
                        onClick={() => handleRenameFile(filePath, newFileName.value.trim())}
                      >{t`重命名`}</Button>
                    </div>
                  </PopoverSurface>
                </Popover>

                <Popover withArrow>
                  <PopoverTrigger>
                    <Tooltip content={t`删除`} relationship="label" positioning="below">
                      <Button
                        icon={<DeleteIcon style={{ width: '16px' }} />}
                        size='small'
                        appearance='subtle'
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverSurface
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      (e.key === 'Enter') && handleDeleteFile(filePath);
                    }}
                  >
                    <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                      <Subtitle2>{t`删除`}</Subtitle2>
                      <Text>{t`是否要删除 "${file.name}" ？`}</Text>
                      <Button
                        appearance="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(filePath);
                        }}
                      >{t`删除`}</Button>
                    </div>
                  </PopoverSurface>
                </Popover>
              </>
            }
          </div>
        </div>
      </div>
    </Tooltip >
  );
}
