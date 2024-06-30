import { api } from "@/api";
import { useValue } from "@/hooks/useValue";
import { ChangeEvent, useMemo, useState } from "react";
import styles from "./Assets.module.scss";
import { Badge, Button, Field, Input, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Popover, PopoverSurface, PopoverTrigger, Radio, RadioGroup, Subtitle1 } from "@fluentui/react-components";
import { ArrowExportUpFilled, ArrowExportUpRegular, ArrowLeftFilled, ArrowLeftRegular, ArrowSyncFilled, ArrowSyncRegular, DocumentAddFilled, DocumentAddRegular, FolderAddFilled, FolderAddRegular, FolderOpenFilled, FolderOpenRegular, MoreVerticalFilled, MoreVerticalRegular, bundleIcon } from "@fluentui/react-icons";
import FileElement from "./FileElement";
import axios from "axios";
import { dirNameToExtNameMap } from "@/pages/editor/ChooseFile/chooseFileConfig";
import useSWR, { useSWRConfig } from "swr";
import { t } from '@lingui/macro';
import Upload from "./Upload";

export interface IFile {
  extName: string;
  isDir: boolean;
  name: string;
  path: string;
  pathFromBase?: string;
}

export type IFolderType = 'animation' | 'background' | 'bgm' | 'figure' | 'scene' | 'template' | 'tex' | 'video' | 'vocal'

export type IFileConfig = Map<
  string,
  {
    desc?: string,
    folderType?: IFolderType,
    isProtected?: boolean,
    isHidden?: boolean,
  }
>

export interface IFileFunction {
  open?: (file: IFile, type: 'scene' | 'asset') => Promise<void>,
  create?: (source: string, name: string, type: 'file' | 'dir') => Promise<void>,
  rename?: (source: string, newName: string) => Promise<void>,
  delete?: (source: string) => Promise<void>,
};

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const DocumentAddIcon = bundleIcon(DocumentAddFilled, DocumentAddRegular);
const FolderAddIcon = bundleIcon(FolderAddFilled, FolderAddRegular);
const FolderOpenIcon = bundleIcon(FolderOpenFilled, FolderOpenRegular);
const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);
const ArrowExportUpIcon = bundleIcon(ArrowExportUpFilled, ArrowExportUpRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);

export default function Assets({ basePath, isProtected = false, fileConfig, fileFunction }:
  { basePath: string[], isProtected?: boolean, fileConfig?: IFileConfig, fileFunction?: IFileFunction }) {
  const { mutate } = useSWRConfig();

  const currentPath = useValue(basePath);
  const currentPathString = useMemo(() => currentPath.value.join("/"), [currentPath]);
  const isBasePath = (currentPathString === basePath.join('/'));
  const folderType = fileConfig ? Array.from(fileConfig.entries()).find(([key]) => currentPathString.startsWith(key))?.[1].folderType : undefined;
  const extName = folderType ? dirNameToExtNameMap.get(folderType) : [];

  const assetsFetcher = async () => {
    const res = await api.assetsControllerReadAssets(currentPathString);
    const data = res.data as unknown as object;
    if ('dirInfo' in data && data.dirInfo) {
      const dirInfo = (data.dirInfo as IFile[]).map((item) => ({ ...item, path: currentPathString + '/' + item.name }));
      const dirs = dirInfo.filter((item) => item.isDir);
      const files = dirInfo.filter((item) => !item.isDir).filter(e => e.name !== '.gitkeep');
      dirs.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
      return [...dirs, ...files];
    } else return [];
  };

  const { data: fileList } = useSWR(currentPathString, assetsFetcher);

  const handleRefresh = () => mutate(currentPathString);
  const handleOpenFolder = () => api.assetsControllerOpenDict(currentPathString);
  const handleBack = () => !isBasePath && currentPath.set(currentPath.value.slice(0, currentPath.value.length - 1));

  const handleOpenFile = async (file: IFile) => {
    if (file.isDir) {
      currentPath.set([...currentPath.value, file.name]);
    } else {
      const pathFromBase = (currentPath.value.slice(basePath.length)).concat([file.name]).join('/');
      const isScene = (folderType === 'scene') && file.name.endsWith('.txt');
      fileFunction?.open && fileFunction.open({...file, pathFromBase}, isScene ? 'scene' : 'asset');
    }
  };

  const handleCreateNewFile = async (source: string, name: string) => {
    await api.assetsControllerCreateNewFile({ source, name });
    fileFunction?.create && await fileFunction.create(source, name, 'file');
    handleRefresh();
  };

  const handleCreateNewFolder = async (source: string, name: string) => {
    await api.assetsControllerCreateNewFolder({ source, name });
    fileFunction?.create && await fileFunction.create(source, name, 'dir');
    handleRefresh();
  };

  const handleRenameFile = async (source: string, newName: string) => {
    await api.assetsControllerRename({ source, newName });
    fileFunction?.rename && await fileFunction.rename(source, newName);
    handleRefresh();
  };

  const handleDeleteFile = async (source: string) => {
    await api.assetsControllerDeleteFileOrDir({ source });
    fileFunction?.delete && await fileFunction.delete(source);
    handleRefresh();
  };
  const handlePreventDefault = async (e: any) => {
    e.preventDefault();
  };
  const createNewFilePopoverOpen = useValue(false);
  const createNewFolderPopoverOpen = useValue(false);
  const newFileName = useValue('');
  const newFileExtensionName = useValue(folderType === 'scene' ? '.txt' : '');
  const uploadAssetPopoverOpen = useValue(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
      onDragEnter={(e) => handlePreventDefault(e)}
      onDragLeave={(e) => handlePreventDefault(e)}
      onDragOver={(e) => handlePreventDefault(e)}
      onDrop={(e) => {
        handlePreventDefault(e);
        const files = e.dataTransfer.files;
        const formData = new FormData();
        formData.append("targetDirectory", currentPathString);
        [...files].forEach((file) => {
          formData.append("files", file);
        });
        axios.post("/api/assets/upload", formData).then((response) => {
          if (response.data) {
            handleRefresh();
          }
        });
      }}
    >
      <div className={styles.controll}>
        {!isBasePath && <Button icon={<ArrowLeftIcon />} size='small' onClick={handleBack} />}
        <Input
          value={isBasePath ? '/' : currentPathString.replace(basePath.join('/'), '')}
          size='small'
          style={{ flexGrow: 1, minWidth: 0 }}
        />

        {!isProtected && <>
          <Popover
            withArrow
            open={createNewFilePopoverOpen.value}
            onOpenChange={() => createNewFilePopoverOpen.set(!createNewFilePopoverOpen.value)}
          >
            <PopoverTrigger>
              <Button icon={<DocumentAddIcon />} size='small' />
            </PopoverTrigger>
            <PopoverSurface>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle1>{t`新建文件`}</Subtitle1>
                <Input
                  value={newFileName.value}
                  placeholder={t`新文件名`}
                  onChange={(_, data) => {
                    newFileName.set(data.value ?? "");
                  }} />
                <Field label={t`扩展名`} size='small'>
                  <RadioGroup value={newFileExtensionName.value} onChange={(_, data) => newFileExtensionName.set(data.value)}>
                    <Radio value="" label={t`无`} />
                    <Radio value=".txt" label="txt" />
                    <Radio value=".json" label="json" />
                  </RadioGroup>
                </Field>
                <Button
                  appearance="primary"
                  disabled={newFileName.value.trim() === ''}
                  onClick={() => {
                    handleCreateNewFile(currentPathString, `${newFileName.value.trim()}${newFileExtensionName.value}`);
                    createNewFilePopoverOpen.set(false);
                    newFileName.set('');
                  }}
                >{t`创建`}</Button>
              </div>
            </PopoverSurface>
          </Popover><Popover
            withArrow
            open={createNewFolderPopoverOpen.value}
            onOpenChange={() => createNewFolderPopoverOpen.set(!createNewFolderPopoverOpen.value)}
          >
            <PopoverTrigger>
              <Button icon={<FolderAddIcon />} size='small' />
            </PopoverTrigger>
            <PopoverSurface>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle1>{t`新建文件夹`}</Subtitle1>
                <Input
                  value={newFileName.value}
                  placeholder={t`新文件夹名`}
                  onChange={(_, data) => {
                    newFileName.set(data.value ?? "");
                  }} />
                <Button
                  appearance="primary"
                  disabled={newFileName.value.trim() === ''}
                  onClick={() => {
                    handleCreateNewFolder(currentPathString, newFileName.value.trim());
                    createNewFolderPopoverOpen.set(false);
                    newFileName.set('');
                  }}
                >{t`创建`}</Button>
              </div>
            </PopoverSurface>
          </Popover><Popover
            withArrow
            open={uploadAssetPopoverOpen.value}
            onOpenChange={() => uploadAssetPopoverOpen.set(!uploadAssetPopoverOpen.value)}
          >
            <PopoverTrigger>
              <Button icon={<ArrowExportUpIcon />} size='small' />
            </PopoverTrigger>
            <PopoverSurface>
              <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                <Subtitle1>{t`上传资源`}</Subtitle1>
                <FileUploader onUpload={handleRefresh} targetDirectory={currentPathString} uploadUrl="/api/assets/upload" />
              </div>
            </PopoverSurface>
          </Popover>
        </>}

        <Menu>
          <MenuTrigger>
            <Button icon={<MoreVerticalIcon />} size='small' />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<ArrowSyncIcon />} onClick={handleRefresh} >{t`刷新`}</MenuItem>
              <MenuItem icon={<FolderOpenIcon />} onClick={handleOpenFolder} >{t`打开文件夹`}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      {
        extName && extName.length > 0 &&
        <div style={{ display: 'flex', padding: '4px 8px', gap: '4px' }}>
          {extName.map(item => <Badge appearance='outline' key={item}>{item}</Badge>)}
        </div>
      }
      <div style={{ overflow: 'auto', padding: '4px' }}
        onDragEnter={(e) => handlePreventDefault(e)}
        onDragLeave={(e) => handlePreventDefault(e)}
        onDragOver={(e) => handlePreventDefault(e)}
        onDrop={(e) => {
          handlePreventDefault(e);
          const files = e.dataTransfer.files;
          const formData = new FormData();
          formData.append("targetDirectory", currentPathString);
          [...files].forEach((file) => {
            formData.append("files", file);
          });

          axios.post("/api/assets/upload", formData).then((response) => {
            if (response.data) {
              handleRefresh();
            }
          });
        }}>
        {
          fileList?.map(file =>
            (fileConfig?.get(`${currentPathString}/${file.name}`)?.isHidden) // 判断是否隐藏
              ? null
              : <FileElement
                key={file.name}
                file={file}
                desc={fileConfig?.get(`${currentPathString}/${file.name}`)?.desc ?? undefined}
                currentPath={currentPath}
                isProtected={fileConfig?.get(`${currentPathString}/${file.name}`)?.isProtected ?? isProtected}
                handleOpenFile={handleOpenFile}
                handleRenameFile={handleRenameFile}
                handleDeleteFile={handleDeleteFile}
              />
          )
        }
      </div>
    </div>
  );
}

interface IFileUploaderProps {
  targetDirectory: string;
  uploadUrl: string;
  onUpload: () => void;
}

function FileUploader({ targetDirectory, uploadUrl, onUpload }: IFileUploaderProps) {

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files!));
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("targetDirectory", targetDirectory);
    files.forEach((file) => {
      formData.append("files", file);
    });

    axios.post(uploadUrl, formData).then((response) => {
      if (response.data) {
        onUpload();
      }
    });
  };

  return (
    <div className={styles.fileUploadContainer}>
      <Upload className={styles.fileSelectInput} title={t`上传`} multiple onChange={handleFileChange} />
      <Button appearance='primary' onClick={handleUpload}>{t`上传`}</Button>
    </div>
  );
}
