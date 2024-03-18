import styles from "./templateElement.module.scss";
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { Delete24Filled, Delete24Regular, FolderOpen24Filled, FolderOpen24Regular, MoreVertical24Filled, MoreVertical24Regular, Open24Filled, Open24Regular, Rename24Filled, Rename24Regular, bundleIcon } from "@fluentui/react-icons";
import { TemplateInfo } from "./DashBoard";
import useVarTrans from "@/hooks/useVarTrans";
import { useMemo } from "react";
import { useValue } from "../../hooks/useValue";
import { api } from "@/api";
import { routers } from "@/App";

interface ITemplateElementProps {
  templateInfo: TemplateInfo;
  onClick: () => void;
  refreash?: () => void;
  checked: boolean;
}

const MoreVerticalIcon = bundleIcon(MoreVertical24Filled, MoreVertical24Regular);
const FolderOpenIcon = bundleIcon(FolderOpen24Filled, FolderOpen24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);
const RenameIcon = bundleIcon(Rename24Filled, Rename24Regular);
const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);

export default function TemplateElement(props: ITemplateElementProps){
  const soureBase = "background";
  const t = useVarTrans('dashBoard.');

  let className = styles.templateElement_main;
  if (props.checked) {
    className = className + " " + styles.templateElement_checked;
  }

  // 滚动到当前选择的游戏
  useMemo(
    () => {
      props.checked &&
        setTimeout(() => {
          document.getElementById(props.templateInfo.dir)?.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 50);
    },
    [props.templateInfo.dir, props.checked]
  );

  const isShowDeleteDialog = useValue(false);
  const isShowRenameDialog = useValue(false);
  const newTemplateName = useValue(props.templateInfo.dir);

  const openInFileExplorer = () => {
    // api.manageGameControllerOpenTemplateDict(props.templateInfo.dir); 需要api
  };

  const previewInNewTab = () => {
    window.open(`/games/${props.templateInfo.dir}`, "_blank");
  };

  const renameThisTemplate = (templateName:string, newTemplateName:string) => {
    console.log("renameThisTemplate");
    // 需要修改模板名的api
    // axios.post("/api/manageGame/rename",
    //   { source: `public/games/${templateName}/`, newTemplate: newTemplateName }
    // ).then(() => {
    //   props.refreash?.();
    //   isShowRenameDialog.set(false);
    // });
  };

  const deleteThisTemplate = () => {
    // 需要删除模板名的api
    // axios.post("/api/manageGame/delete", { source: `public/games/${props.templateInfo.dir}` }).then(() =>
    // {
    //   props.refreash?.();
    //   isShowDeleteDialog.set(false);
    // }
    // );
  };
  return (
    <>
      <div onClick={props.onClick} className={className} id={props.templateInfo.dir}>
        <div className={styles.templateElement_title}>
          <span>{props.templateInfo.title}</span>
        </div>
        <div className={styles.templateElement_sub}>
          <span className={styles.templateElement_dir}>{props.templateInfo.dir}</span>
          <div className={styles.templateElement_action} onClick={(event) => event.stopPropagation()}>
            <Button appearance='primary' as='a' href={`${routers.template.url}/${props.templateInfo.dir}`}>{t('$编辑模板')}</Button>
            <Menu>
              <MenuTrigger>
                <MenuButton appearance='subtle' icon={<MoreVerticalIcon />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<FolderOpenIcon />} onClick={() => openInFileExplorer()}>{t('menu.openInFileExplorer')}</MenuItem>
                  <MenuItem icon={<OpenIcon />} onClick={() => previewInNewTab()}>{t('menu.previewInNewTab')}</MenuItem>
                  <MenuItem icon={<RenameIcon />} onClick={() => isShowRenameDialog.set(true)}>{t('menu.renameDir')}</MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => isShowDeleteDialog.set(true)}>{t('$删除模板')}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
      {/* 重命名对话框 */}
      <Dialog
        open={isShowRenameDialog.value}
        onOpenChange={() => isShowRenameDialog.set(!isShowRenameDialog.value)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('$重命名模板')}</DialogTitle>
            <DialogContent>
              <Input
                style={{width:'100%'}}
                defaultValue={props.templateInfo.dir}
                onChange={(event) => newTemplateName.set(event.target.value ? event.target.value.trim() : props.templateInfo.dir)}
                onKeyDown={(event) => (event.key === 'Enter') && renameThisTemplate(props.templateInfo.dir, newTemplateName.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowRenameDialog.set(false)}>{t('$common.exit')}</Button>
              <Button appearance='primary' onClick={() => renameThisTemplate(props.templateInfo.dir, newTemplateName.value)}>{t('$common.rename')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {/* 删除对话框 */}
      <Dialog
        open={isShowDeleteDialog.value}
        onOpenChange={() => isShowDeleteDialog.set(!isShowDeleteDialog.value)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('删除模板')}</DialogTitle>
            <DialogContent>{t('确定要删除', { templateName: props.templateInfo.dir })}</DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowDeleteDialog.set(false)}>{t('$common.exit')}</Button>
              <Button appearance='primary' onClick={deleteThisTemplate}>{t('$common.delete')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
