import { api } from "@/api";
import { useValue } from "@/hooks/useValue";
import { ChangeEvent, CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Assets.module.scss";
import { Badge, Button, Field, Input, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Popover, PopoverSurface, PopoverTrigger, Radio, RadioGroup, Subtitle1, Tooltip } from "@fluentui/react-components";
import { ArrowExportUpFilled, ArrowExportUpRegular, ArrowLeftFilled, ArrowLeftRegular, ArrowSortDownLinesFilled, ArrowSortDownLinesRegular, ArrowSortFilled, ArrowSortRegular, ArrowSortUpLinesFilled, ArrowSortUpLinesRegular, ArrowSyncFilled, ArrowSyncRegular, DocumentAddFilled, DocumentAddRegular, FolderAddFilled, FolderAddRegular, FolderOpenFilled, FolderOpenRegular, GridFilled, GridRegular, ListFilled, ListRegular, MoreVerticalFilled, MoreVerticalRegular, bundleIcon } from "@fluentui/react-icons";
import { FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import FileElement from "./FileElement";
import axios from "axios";
import { extNameMap, IExtNameType } from "@/pages/editor/ChooseFile/chooseFileConfig";
import useSWR, { useSWRConfig } from "swr";
import { t } from '@lingui/macro';
import Upload from "./Upload";
import naturalCompare from 'natural-compare-lite';
import useEditorStore from "@/store/useEditorStore";

export interface IFile {
  extName: string;
  isDir: boolean;
  name: string;
  path: string;
  size?: number;
  lastModified?: number;
}

export type IFileConfig = Map<
  string,
  {
    desc?: string,
    extNameTypes?: IExtNameType[],
    isProtected?: boolean,
    isHidden?: boolean,
  }
>

export interface IFileFunction {
  open?: (file: IFile, type: 'scene' | 'asset') => Promise<void>,
  create?: (source: string, name: string, type: 'file' | 'dir') => Promise<void>,
  backup?: (source: string) => Promise<void>,
  rename?: (source: string, newName: string) => Promise<void>,
  delete?: (source: string) => Promise<void>,
};

export type IViewType = 'list' | 'grid';
export type ISortBy = 'name' | 'size' | 'lastModified';
export type ISortOrder = 'asc' | 'desc';

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const DocumentAddIcon = bundleIcon(DocumentAddFilled, DocumentAddRegular);
const FolderAddIcon = bundleIcon(FolderAddFilled, FolderAddRegular);
const FolderOpenIcon = bundleIcon(FolderOpenFilled, FolderOpenRegular);
const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);
const ArrowExportUpIcon = bundleIcon(ArrowExportUpFilled, ArrowExportUpRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);
const ListIcon = bundleIcon(ListFilled, ListRegular);
const GridIcon = bundleIcon(GridFilled, GridRegular);
const ArrowSortIcon = bundleIcon(ArrowSortFilled, ArrowSortRegular);
const ArrowSortDownLinesIcon = bundleIcon(ArrowSortDownLinesFilled, ArrowSortDownLinesRegular);
const ArrowSortUpLinesIcon = bundleIcon(ArrowSortUpLinesFilled, ArrowSortUpLinesRegular);

export default function Assets(
  {
    rootPath,
    basePath = [],
    selectedFilePath = [],
    leading,
    isProtected = false,
    fileConfig,
    fileFunction,
    allowedExtNames,
  }: {
      rootPath: string[],
      basePath?: string[], // 相对于rootPath的路径
      selectedFilePath?: string[],
      leading?: ReactNode,
      isProtected?: boolean,
      fileConfig?: IFileConfig,
      fileFunction?: IFileFunction,
      allowedExtNames?: string[],
    }
) {
  const { mutate } = useSWRConfig();

  const viewType = useEditorStore.use.viewType();
  const updateViewType = useEditorStore.use.updateViewType();
  const sortBy = useEditorStore.use.sortBy();
  const updateSortBy = useEditorStore.use.updateSortBy();
  const sortOrder = useEditorStore.use.sortOrder();
  const updateSortOrder = useEditorStore.use.updateSortOrder();

  const currentPath = useValue([...basePath, ...selectedFilePath.slice(0, -1)]);
  const currentFullPath = useMemo(() => [...rootPath, ...currentPath.value], [currentPath.value]);
  const lastPath = useValue<string[]>([...basePath, ...selectedFilePath]);
  const isBasePath = (currentPath.value.join('/') === basePath.join('/'));
  const extNameTypes = fileConfig ? Array.from(fileConfig.entries()).find(([key]) => currentPath.value.join('/').startsWith(key))?.[1].extNameTypes : undefined;
  const extNames = extNameTypes?.length ? extNameTypes.map((item) => extNameMap.get(item)).flat() : allowedExtNames ?? [];
  const filterText = useValue('');

  const cols = useValue(1);

  const scrollRef = useRef<FixedSizeList | null>(null);

  const normalizePath = (path: string) => path.replace(/\\/g, '/');
  const animationRootPath = useMemo(() => normalizePath([...rootPath, 'animation'].join('/')), [rootPath]);
  const animationGameDir = useMemo(() => (rootPath[0] === 'games' ? rootPath[1] : ''), [rootPath]);

  const isAnimationDescriptionFile = (path: string) => {
    if (!animationGameDir) return false;
    const normalized = normalizePath(path);
    if (!normalized.startsWith(`${animationRootPath}/`)) return false;
    if (normalized.toLowerCase().endsWith('/animationtable.json')) return false;
    return normalized.toLowerCase().endsWith('.json');
  };

  const updateAnimationTable = async () => {
    if (!animationGameDir) return;
    try {
      await api.manageGameControllerUpdateAnimationTable({ gameName: animationGameDir });
    } catch (_) {
      return;
    }
  };

  const refreshAnimationTableIfNeeded = async (paths: string[]) => {
    if (paths.some((path) => isAnimationDescriptionFile(path))) {
      await updateAnimationTable();
    }
  };

  const scrollToIndex = (goToIndex: number) => {
    if (scrollRef?.current) {
      scrollRef.current.scrollToItem(goToIndex, 'smart');
    }
  };

  const assetsFetcher = async () => {
    const res = await api.assetsControllerReadAssets(currentFullPath.join('/'));
    const data = res.data as unknown as object;
    const path = currentPath.value;
    if ('dirInfo' in data && data.dirInfo) {
      const dirInfo = (data.dirInfo as IFile[]).map((item) => ({ ...item, path: [...path, item.name].join('/') }));
      return dirInfo.filter(e => e.name !== '.gitkeep');
    } else return [];
  };

  const { data: files, error: filesError } = useSWR(currentFullPath.join('/'), assetsFetcher);

  useEffect(() => {
    if (filesError) {
      currentPath.set(basePath);
    }
  }, [filesError]);

  const filteredFiles = useMemo(
    () => files?.filter(file =>
      file.name.toLocaleLowerCase().includes(filterText.value.toLocaleLowerCase())
        && !fileConfig?.get(file.path)?.isHidden
        && (!allowedExtNames || allowedExtNames.length === 0 || allowedExtNames.includes(file.extName.toLocaleLowerCase()) || file.isDir)
    ) ?? [],
    [files, filterText, fileConfig, allowedExtNames]
  );

  const sortedFiles = useMemo(
    () => {
      const dirs = filteredFiles.filter((item) => item.isDir);
      const files = filteredFiles.filter((item) => !item.isDir);
      if (sortBy === 'name') {
        if (sortOrder === 'asc') {
          dirs.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
          files.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
        } else {
          dirs.sort((a, b) => naturalCompare(b.name.toLocaleLowerCase(), a.name.toLocaleLowerCase()));
          files.sort((a, b) => naturalCompare(b.name.toLocaleLowerCase(), a.name.toLocaleLowerCase()));
        }
        return [...dirs, ...files];
      }
      if (sortBy === 'size') {
        if (sortOrder === 'asc') {
          dirs.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
          files.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
        } else {
          dirs.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
          files.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
        }
        return [...dirs, ...files];
      }
      if (sortBy === 'lastModified') {
        if (sortOrder === 'asc') {
          dirs.sort((a, b) => (a.lastModified ?? 0) - (b.lastModified ?? 0));
          files.sort((a, b) => (a.lastModified ?? 0) - (b.lastModified ?? 0));
        } else {
          dirs.sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
          files.sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
        }
        return [...dirs, ...files];
      } else {
        dirs.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
        files.sort((a, b) => naturalCompare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase()));
        return [...dirs, ...files];
      };
    },
    [filteredFiles, sortBy, sortOrder]
  );

  // 自动滚动
  useMemo(
    () => {
      const index = sortedFiles.findIndex(item => item.path === lastPath.value.join('/'));
      setTimeout(() => {
        scrollToIndex(Math.ceil(index / cols.value));
      }, 100);
    },
    [lastPath.value]
  );

  const handleRefresh = () => mutate(currentFullPath.join('/'));
  const handleOpenFolder = () => api.assetsControllerOpenDict(currentFullPath.join('/'));
  const handleBack = () => {
    if(!isBasePath) {
      lastPath.value = currentPath.value;
      currentPath.set(currentPath.value.slice(0, currentPath.value.length - 1));
      filterText.set('');
    }
  };

  const handleOpenFile = async (file: IFile) => {
    if (file.isDir) {
      // lastPath.value = [...currentPath.value, file.name];
      currentPath.set([...currentPath.value, file.name]);
      filterText.set('');
    } else {
      const isScene = (extNameTypes?.includes('scene')) && file.name.endsWith('.txt');
      fileFunction?.open && fileFunction.open({ ...file }, isScene ? 'scene' : 'asset');
    }
  };

  const handleCreateNewFile = async (source: string, name: string) => {
    await api.assetsControllerCreateNewFile({ source, name });
    fileFunction?.create && await fileFunction.create(source, name, 'file');
    await refreshAnimationTableIfNeeded([`${source}/${name}`]);
    handleRefresh();
  };

  const handleCreateNewFolder = async (source: string, name: string) => {
    await api.assetsControllerCreateNewFolder({ source, name });
    fileFunction?.create && await fileFunction.create(source, name, 'dir');
    handleRefresh();
  };

  const handleBackupFile = async (source: string) => {
    await api.assetsControllerCopyFileWithIncrement({ source });
    fileFunction?.backup && await fileFunction.backup(source);
    await refreshAnimationTableIfNeeded([source]);
    handleRefresh();
  };

  const handleRenameFile = async (source: string, newName: string) => {
    await api.assetsControllerRename({ source, newName });
    fileFunction?.rename && await fileFunction.rename(source, newName);
    const normalizedSource = normalizePath(source);
    const pathParts = normalizedSource.split('/');
    const newPath = [...pathParts.slice(0, -1), newName].join('/');
    await refreshAnimationTableIfNeeded([normalizedSource, newPath]);
    handleRefresh();
  };

  const handleDeleteFile = async (source: string) => {
    await api.assetsControllerDeleteFileOrDir({ source });
    fileFunction?.delete && await fileFunction.delete(source);
    await refreshAnimationTableIfNeeded([source]);
    handleRefresh();
  };

  const handlePreventDefault = async (e: any) => {
    e.preventDefault();
  };

  const createNewFilePopoverOpen = useValue(false);
  const createNewFolderPopoverOpen = useValue(false);
  const newFileName = useValue('');
  const newFileExtensionName = useValue(extNameTypes?.includes('scene') ? '.txt' : '');
  const uploadAssetPopoverOpen = useValue(false);

  const checkHasFile = (fileNmae: string) => files?.find((item) => item.name === fileNmae) ? true : false;
  const disableCreateFile = useMemo(
    () => newFileName.value.trim() === ''
      || checkHasFile(newFileName.value.trim() + (createNewFilePopoverOpen.value ? newFileExtensionName.value : '')),
    [newFileName.value, newFileExtensionName.value, createNewFilePopoverOpen.value]
  );

  const handleSort = (field: ISortBy) => {
    if(!updateSortBy || !updateSortOrder) return;
    if(sortBy === field) {
      updateSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      updateSortBy(field);
      switch(field) {
      case 'name':
        updateSortOrder('asc');
        break;
      case 'size':
        updateSortOrder('desc');
        break;
      case 'lastModified':
        updateSortOrder('desc');
        break;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
      onDragEnter={(e) => handlePreventDefault(e)}
      onDragLeave={(e) => handlePreventDefault(e)}
      onDragOver={(e) => handlePreventDefault(e)}
      onDrop={(e) => {
        handlePreventDefault(e);
        const files = e.dataTransfer.files;
        if(files.length === 0) return;
        const formData = new FormData();
        formData.append("targetDirectory", currentFullPath.join('/'));
        [...files].forEach((file) => {
          formData.append("files", file);
        });
        axios.post("/api/assets/upload", formData).then((response) => {
          if (response.data) {
            const targetDir = currentFullPath.join('/');
            const uploadedPaths = [...files].map((file) => `${targetDir}/${file.name}`);
            refreshAnimationTableIfNeeded(uploadedPaths);
            handleRefresh();
          }
        });
      }}
    >
      <div className={styles.controll}>
        <div
          style={{
            display:'flex',
            flexDirection: 'row',
            flexGrow: 1,
            alignItems: 'center',
            padding: '4px',
            paddingLeft: leading ? '0px' : '4px',
          }}>
          {leading}
          <Input
            value={filterText.value}
            onChange={(_, data) => filterText.set(data.value)}
            placeholder={t`过滤文件`}
            size='small'
            style={{ width: '100%', minWidth: 0 }}
            type='search'
          />
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            gap: '0.25rem',
            padding: '0 4px 4px 4px',
          }}
        >
          {!isBasePath && <Button icon={<ArrowLeftIcon />} size='small' onClick={handleBack} />}
          <Input
            value={currentPath.value.join('/')}
            size='small'
            style={{ flexGrow: 1, minWidth: 0 }}
          />

          {!isProtected && <>
            <Popover
              withArrow
              open={createNewFilePopoverOpen.value}
              onOpenChange={() => {
                createNewFilePopoverOpen.set(!createNewFilePopoverOpen.value);
                newFileName.set('');
              }}
            >
              <PopoverTrigger>
                <Tooltip content={t`新建文件`} relationship="label" positioning="below"> 
                  <Button icon={<DocumentAddIcon />} size='small' />
                </Tooltip>
              </PopoverTrigger>
              <PopoverSurface
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if((event.key === 'Enter') && !checkHasFile(newFileName.value.trim() + newFileExtensionName.value)){
                    handleCreateNewFile(currentFullPath.join('/'), `${newFileName.value.trim()}${newFileExtensionName.value}`);
                    createNewFilePopoverOpen.set(false);
                    newFileName.set('');
                  }
                }}
              >
                <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                  <Subtitle1>{t`新建文件`}</Subtitle1>
                  <Tooltip
                    content={{ children: t`已存在文件或文件夹 ${newFileName.value.trim() + newFileExtensionName.value}，请输入其他名称`, style: { color: 'var(--danger)' } }}
                    relationship="description"
                    visible={checkHasFile(newFileName.value.trim() + newFileExtensionName.value)}
                    positioning="below"
                  >
                    <Input
                      value={newFileName.value}
                      placeholder={t`新文件名`}
                      className={checkHasFile(newFileName.value.trim() + newFileExtensionName.value) ? styles.inputDanger : ''}
                      onChange={(_, data) => {
                        newFileName.set(data.value ?? "");
                      }}
                    />
                  </Tooltip>
                  <Field label={t`扩展名`} size='small'>
                    <RadioGroup value={newFileExtensionName.value} onChange={(_, data) => newFileExtensionName.set(data.value)}>
                      <Radio value="" label={t`无`} />
                      <Radio value=".txt" label="txt" />
                      <Radio value=".json" label="json" />
                    </RadioGroup>
                  </Field>
                  <Button
                    appearance="primary"
                    disabled={disableCreateFile}
                    onClick={() => {
                      handleCreateNewFile(currentFullPath.join('/'), `${newFileName.value.trim()}${newFileExtensionName.value}`);
                      createNewFilePopoverOpen.set(false);
                      newFileName.set('');
                    }}
                  >{t`创建`}</Button>
                </div>
              </PopoverSurface>
            </Popover>
            <Popover
              withArrow
              open={createNewFolderPopoverOpen.value}
              onOpenChange={() => {
                createNewFolderPopoverOpen.set(!createNewFolderPopoverOpen.value);
                newFileName.set('');
              }}
            >
              <PopoverTrigger>
                <Tooltip content={t`新建文件夹`} relationship="label" positioning="below"> 
                  <Button icon={<FolderAddIcon />} size='small' />
                </Tooltip>
              </PopoverTrigger>
              <PopoverSurface
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if((event.key === 'Enter') && !checkHasFile(newFileName.value)){
                    handleCreateNewFolder(currentFullPath.join('/'), newFileName.value.trim());
                    createNewFolderPopoverOpen.set(false);
                    newFileName.set('');
                  }
                }}
              >
                <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                  <Subtitle1>{t`新建文件夹`}</Subtitle1>
                  <Tooltip
                    content={{ children: t`已存在文件或文件夹 ${newFileName.value}，请输入其他名称`, style: { color: 'var(--danger)' } }}
                    relationship="description"
                    visible={checkHasFile(newFileName.value.trim())}
                    positioning="below"
                  >
                    <Input
                      value={newFileName.value}
                      placeholder={t`新文件夹名`}
                      className={checkHasFile(newFileName.value.trim()) ? styles.inputDanger : ''}
                      onChange={(_, data) => {
                        newFileName.set(data.value ?? "");
                      }}
                    />
                  </Tooltip>
                  <Button
                    appearance="primary"
                    disabled={disableCreateFile}
                    onClick={() => {
                      handleCreateNewFolder(currentFullPath.join('/'), newFileName.value.trim());
                      createNewFolderPopoverOpen.set(false);
                      newFileName.set('');
                    }}
                  >{t`创建`}</Button>
                </div>
              </PopoverSurface>
            </Popover>
            <Popover
              withArrow
              open={uploadAssetPopoverOpen.value}
              onOpenChange={() => uploadAssetPopoverOpen.set(!uploadAssetPopoverOpen.value)}
            >
              <PopoverTrigger>
                <Tooltip content={t`上传资源`} relationship="label" positioning="below"> 
                  <Button icon={<ArrowExportUpIcon />} size='small' />
                </Tooltip>
              </PopoverTrigger>
              <PopoverSurface>
                <div style={{ display: "flex", flexFlow: "column", gap: "16px" }}>
                  <Subtitle1>{t`上传资源`}</Subtitle1>
                  <FileUploader
                    onUpload={handleRefresh}
                    onUploadedFiles={(files) => {
                      const targetDir = currentFullPath.join('/');
                      const uploadedPaths = files.map((file) => `${targetDir}/${file.name}`);
                      refreshAnimationTableIfNeeded(uploadedPaths);
                    }}
                    targetDirectory={currentFullPath.join('/')}
                    uploadUrl="/api/assets/upload"
                  />
                </div>
              </PopoverSurface>
            </Popover>
          </>
          }

          {
            viewType && updateViewType &&
            <Tooltip content={viewType === 'list' ? t`列表视图` : t`网格视图`} relationship="label" positioning="below">
              <Button
                icon={ viewType === 'list' ? <ListIcon /> : <GridIcon />}
                size='small'
                onClick={() => updateViewType(viewType === 'list' ? 'grid' : 'list')}
              />
            </Tooltip>
          }

          <Menu>
            <MenuTrigger>
              <Button icon={<MoreVerticalIcon />} size='small' />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<ArrowSyncIcon />} onClick={handleRefresh} >{t`刷新`}</MenuItem>
                <MenuItem icon={<FolderOpenIcon />} onClick={handleOpenFolder} >{t`在文件管理器中打开`}</MenuItem>
                <Menu>
                  <MenuTrigger>
                    <MenuItem icon={<ArrowSortIcon />} >{t`排序方式`}</MenuItem>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem onClick={() => handleSort('name')}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', alignItems: 'center' }}>
                          {t`文件名`}
                          {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowSortUpLinesIcon /> : <ArrowSortDownLinesIcon />)}
                        </div>
                      </MenuItem>
                      <MenuItem onClick={() => handleSort('size')}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', alignItems: 'center' }}>
                          {t`文件大小`}
                          {sortBy === 'size' && (sortOrder === 'asc' ? <ArrowSortUpLinesIcon /> : <ArrowSortDownLinesIcon />)}
                        </div>
                      </MenuItem>
                      <MenuItem onClick={() => handleSort('lastModified')}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', alignItems: 'center' }}>
                          {t`修改时间`}
                          {sortBy === 'lastModified' && (sortOrder === 'asc' ? <ArrowSortUpLinesIcon /> : <ArrowSortDownLinesIcon />)}
                        </div>
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>
      {
        extNames && extNames.length > 0 &&
        <div style={{ display: 'flex', flexWrap: 'wrap', padding: '4px 8px 0px 8px', gap: '4px' }}>
          {extNames.map(item => <Badge appearance='outline' key={item}>{item}</Badge>)}
        </div>
      }
      <div style={{ overflow: 'auto', padding: '4px', width: '100%', height: '100%' }}
        onDragEnter={(e) => handlePreventDefault(e)}
        onDragLeave={(e) => handlePreventDefault(e)}
        onDragOver={(e) => handlePreventDefault(e)}
        onDrop={(e) => {
          handlePreventDefault(e);
          const files = e.dataTransfer.files;
          if(files.length === 0) return;
          const formData = new FormData();
          formData.append("targetDirectory", currentFullPath.join('/'));
          [...files].forEach((file) => {
            formData.append("files", file);
          });

          axios.post("/api/assets/upload", formData).then((response) => {
            if (response.data) {
              const targetDir = currentFullPath.join('/');
              const uploadedPaths = [...files].map((file) => `${targetDir}/${file.name}`);
              refreshAnimationTableIfNeeded(uploadedPaths);
              handleRefresh();
            }
          });
        }}>

        {
          sortedFiles.length > 0 &&
          <AutoSizer>
            {
              ({ height, width } : { height: number, width: number }) => {
                const gridCols = Math.max(1, Math.floor(width / 96));
                const listCols = Math.max(1, Math.floor(width / 192));

                viewType === 'grid' ? cols.set(gridCols) : cols.set(listCols);

                const rowRenderer = ({index, style}: { index: number, style: CSSProperties }) => {
                  return (
                    <div style={{...style, display: 'grid', gridTemplateColumns: `repeat(${cols.value}, 1fr)`}}>
                      {
                        Array.from({ length: cols.value }).map((_, i) => {
                          const fileIndex = index * cols.value + i;
                          if (fileIndex >= sortedFiles.length) return null;
                          return (
                            <FileElement
                              key={sortedFiles[fileIndex].name}
                              rootPath={rootPath}
                              file={sortedFiles[fileIndex]}
                              type={viewType}
                              selected={sortedFiles[fileIndex].path === [...basePath, ...selectedFilePath].join('/')}
                              desc={fileConfig?.get(sortedFiles[fileIndex].path)?.desc ?? undefined}
                              isProtected={fileConfig?.get(sortedFiles[fileIndex].path)?.isProtected ?? isProtected}
                              handleOpenFile={handleOpenFile}
                              handleBackupFile={handleBackupFile}
                              handleRenameFile={handleRenameFile}
                              handleDeleteFile={handleDeleteFile}
                              checkHasFile={checkHasFile}
                            />
                          );
                        })
                      }     
                    </div>
                  );
                };

                return (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemCount={Math.ceil(sortedFiles.length / (viewType === 'list' ? listCols : gridCols))}
                    itemSize={viewType === 'list' ? 28 : width / cols.value}
                    ref={scrollRef}
                  >
                    {rowRenderer}
                  </FixedSizeList>
                );
              }
            }
          </AutoSizer>
        }
      </div>
    </div>
  );
}

interface IFileUploaderProps {
  targetDirectory: string;
  uploadUrl: string;
  onUpload: () => void;
  onUploadedFiles?: (files: File[]) => void;
}

function FileUploader({ targetDirectory, uploadUrl, onUpload, onUploadedFiles }: IFileUploaderProps) {

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
        onUploadedFiles?.(files);
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
