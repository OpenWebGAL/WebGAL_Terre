import styles from './templateElement.module.scss';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import {
  ArrowExportUp24Filled,
  ArrowExportUp24Regular,
  ArrowImport24Filled,
  ArrowImport24Regular,
  Delete24Filled,
  Delete24Regular,
  FolderOpen24Filled,
  FolderOpen24Regular,
  MoreVertical24Filled,
  MoreVertical24Regular,
  Open24Filled,
  Open24Regular,
  Rename24Filled,
  Rename24Regular,
  bundleIcon,
} from '@fluentui/react-icons';
import { useMemo } from 'react';
import { useValue } from '../../hooks/useValue';
import { api } from '@/api';
import { routes } from '@/router';
import { t } from '@lingui/macro';
import { localStorageRename } from '@/utils/localStorageRename';
import { TemplateInfoDto } from '@/api/Api';

interface ITemplateElementProps {
  templateInfo: TemplateInfoDto;
  onClick: () => void;
  refreash?: () => void;
  checked: boolean;
}

const MoreVerticalIcon = bundleIcon(MoreVertical24Filled, MoreVertical24Regular);
const FolderOpenIcon = bundleIcon(FolderOpen24Filled, FolderOpen24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);
const RenameIcon = bundleIcon(Rename24Filled, Rename24Regular);
const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);
const ArrowExportUpIcon = bundleIcon(ArrowExportUp24Filled, ArrowExportUp24Regular);

export default function TemplateElement(props: ITemplateElementProps) {
  let className = styles.templateElement_main;
  if (props.checked) {
    className = className + ' ' + styles.templateElement_checked;
  }

  // 滚动到当前选择的游戏
  useMemo(() => {
    props.checked &&
      setTimeout(() => {
        document.getElementById(props.templateInfo.dir)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
  }, [props.templateInfo.dir, props.checked]);

  const isShowDeleteDialog = useValue(false);
  const isShowRenameDialog = useValue(false);
  const newTemplateName = useValue(props.templateInfo.dir);

  const openInFileExplorer = () => {
    api.assetsControllerOpenDict(`templates/${props.templateInfo.dir}`);
  };

  const previewInNewTab = () => {
    window.open(`/template-preview/${props.templateInfo.dir}`, '_blank');
  };

  const renameThisTemplate = async (templateName: string, newTemplateName: string) => {
    const source = `templates/${templateName}`;
    await api.assetsControllerRename({ source, newName: newTemplateName });
    localStorageRename(`template-editor-storage-${templateName}`, `template-editor-storage-${newTemplateName}`);
    isShowRenameDialog.set(false);
    props?.refreash?.();
  };

  const deleteThisTemplate = async (templateName: string) => {
    await api.manageTemplateControllerDeleteTemplate(templateName);
    localStorage.removeItem(`template-editor-storage-${templateName}`);
    isShowDeleteDialog.set(false);
    props?.refreash?.();
  };

  const templateName = props.templateInfo.dir;

  return (
    <>
      <div onClick={props.onClick} className={className} id={props.templateInfo.dir}>
        <div className={styles.templateElement_title}>
          <span>{props.templateInfo.name}</span>
        </div>
        <div className={styles.templateElement_sub}>
          <span className={styles.templateElement_dir}>{props.templateInfo.dir}</span>
          <div className={styles.templateElement_action} onClick={(event) => event.stopPropagation()}>
            <Button appearance="primary" as="a" href={`${routes.template.url}/${props.templateInfo.dir}`}>
              <span style={{ textWrap: 'nowrap' }}>{t`编辑模板`}</span>
            </Button>
            <Menu>
              <MenuTrigger>
                <MenuButton appearance="subtle" icon={<MoreVerticalIcon />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem
                    icon={<FolderOpenIcon />}
                    onClick={() => openInFileExplorer()}
                  >{t`在文件管理器中打开`}</MenuItem>
                  <MenuItem icon={<OpenIcon />} onClick={() => previewInNewTab()}>{t`在新标签页中预览`}</MenuItem>
                  <MenuItem
                    icon={<RenameIcon />}
                    onClick={() => isShowRenameDialog.set(true)}
                  >{t`重命名模板目录`}</MenuItem>
                  <MenuItem
                    icon={<ArrowExportUpIcon />}
                    onClick={() => {
                      api.manageTemplateControllerOutputTemplate({
                        sourceDir: props.templateInfo.dir,
                        outPath: `${props.templateInfo.dir}.zip`,
                      });
                    }}
                  >{t`导出模板`}</MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => isShowDeleteDialog.set(true)}>{t`删除模板`}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
      {/* 重命名对话框 */}
      <Dialog open={isShowRenameDialog.value} onOpenChange={() => isShowRenameDialog.set(!isShowRenameDialog.value)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t`重命名模板目录`}</DialogTitle>
            <DialogContent>
              <Input
                style={{ width: '100%' }}
                defaultValue={props.templateInfo.dir}
                onChange={(event) =>
                  newTemplateName.set(event.target.value ? event.target.value.trim() : props.templateInfo.dir)
                }
                onKeyDown={(event) =>
                  event.key === 'Enter' && renameThisTemplate(props.templateInfo.dir, newTemplateName.value)
                }
              />
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => isShowRenameDialog.set(false)}>{t`返回`}</Button>
              <Button
                appearance="primary"
                onClick={() => renameThisTemplate(props.templateInfo.dir, newTemplateName.value)}
              >{t`重命名`}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {/* 删除对话框 */}
      <Dialog open={isShowDeleteDialog.value} onOpenChange={() => isShowDeleteDialog.set(!isShowDeleteDialog.value)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t`删除模板`}</DialogTitle>
            <DialogContent>{t`确定要删除 "${templateName}" 模板吗？`}</DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => deleteThisTemplate(props.templateInfo.dir)}
              >{t`删除`}</Button>
              <Button appearance="primary" onClick={() => isShowDeleteDialog.set(false)}>{t`返回`}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
