import styles from "./gameElement.module.scss";
import axios from "axios";
import { useValue } from "../../hooks/useValue";
import useVarTrans from "@/hooks/useVarTrans";
import { GameInfo } from "./DashBoard";
import { useMemo } from "react";
import { api } from "@/api";
import { Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { Delete24Filled, Delete24Regular, FolderOpen24Filled, FolderOpen24Regular, MoreVertical24Filled, MoreVertical24Regular, Open24Filled, Open24Regular, Rename24Filled, Rename24Regular, bundleIcon } from "@fluentui/react-icons";
import { localStorageRename } from "@/utils/localStorageRename";
import { routers } from "@/App";

interface IGameElementProps {
  gameInfo: GameInfo;
  checked: boolean;
  onClick: () => void;
  refreash?: () => void;
}

const MoreVerticalIcon = bundleIcon(MoreVertical24Filled, MoreVertical24Regular);
const FolderOpenIcon = bundleIcon(FolderOpen24Filled, FolderOpen24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);
const RenameIcon = bundleIcon(Rename24Filled, Rename24Regular);
const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);

export default function GameElement(props: IGameElementProps) {

  const soureBase = "background";
  const t = useVarTrans('dashBoard.');

  let className = styles.gameElement_main;
  if (props.checked) {
    className = className + " " + styles.gameElement_checked;
  }

  // 滚动到当前选择的游戏
  useMemo(
    () => {
      props.checked &&
        setTimeout(() => {
          document.getElementById(props.gameInfo.dir)?.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 50);
    },
    [props.gameInfo.dir, props.checked]
  );

  const isShowDeleteDialog = useValue(false);
  const isShowRenameDialog = useValue(false);
  const newGameName = useValue(props.gameInfo.dir);
  const deleteChecked = useValue(false);

  const openInFileExplorer = () => {
    api.manageGameControllerOpenGameDict(props.gameInfo.dir);
  };

  const previewInNewTab = () => {
    window.open(`/games/${props.gameInfo.dir}`, "_blank");
  };

  const renameThisGame = (gameName:string, newGameName:string) => {
    axios.post("/api/manageGame/rename",
      { source: `public/games/${gameName}/`, newName: newGameName }
    ).then(() => {
      props.refreash?.();
      isShowRenameDialog.set(false);
      localStorageRename(`game-editor-storage-${gameName}`, `game-editor-storage-${newGameName}`);
    });
  };

  const deleteThisGame = () => {
    axios.post("/api/manageGame/delete", { source: `public/games/${props.gameInfo.dir}` }).then(() =>
    {
      props.refreash?.();
      isShowDeleteDialog.set(false);
      localStorage.removeItem(`game-editor-storage-${props.gameInfo.dir}`);
    }
    );
  };

  return (
    <>
      <div onClick={props.onClick} className={className} id={props.gameInfo.dir}>
        <img
          src={`/games/${props.gameInfo.dir}/game/${soureBase}/${props.gameInfo.cover}`}
          alt={props.gameInfo.title}
          className={styles.gameElement_cover}
        />
        <div className={styles.gameElement_title}>
          <span>{props.gameInfo.title}</span>
        </div>
        <div className={styles.gameElement_sub}>
          <span className={styles.gameElement_dir}>{props.gameInfo.dir}</span>
          <div className={styles.gameElement_action} onClick={(event) => event.stopPropagation()}>
            <Button appearance='primary' as='a' href={`${routers.game.url}/${props.gameInfo.dir}`}>{t('preview.editGame')}</Button>
            <Menu>
              <MenuTrigger>
                <MenuButton appearance='subtle' icon={<MoreVerticalIcon />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<FolderOpenIcon />} onClick={() => openInFileExplorer()}>{t('menu.openInFileExplorer')}</MenuItem>
                  <MenuItem icon={<OpenIcon />} onClick={() => previewInNewTab()}>{t('menu.previewInNewTab')}</MenuItem>
                  <MenuItem icon={<RenameIcon />} onClick={() => isShowRenameDialog.set(true)}>{t('menu.renameDir')}</MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => isShowDeleteDialog.set(true)}>{t('menu.deleteGame')}</MenuItem>
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
            <DialogTitle>{t('dialogs.renameDir.title')}</DialogTitle>
            <DialogContent>
              <Input
                style={{width:'100%'}}
                defaultValue={props.gameInfo.dir}
                onChange={(event) => newGameName.set(event.target.value ? event.target.value.trim() : props.gameInfo.dir)}
                onKeyDown={(event) => (event.key === 'Enter') && renameThisGame(props.gameInfo.dir, newGameName.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowRenameDialog.set(false)}>{t('$common.exit')}</Button>
              <Button appearance='primary' onClick={() => renameThisGame(props.gameInfo.dir, newGameName.value)}>{t('$common.rename')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {/* 删除对话框 */}
      <Dialog
        open={isShowDeleteDialog.value}
        onOpenChange={() => {
          isShowDeleteDialog.set(!isShowDeleteDialog.value);
          deleteChecked.set(false);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('dialogs.deleteGame.title')}</DialogTitle>
            <DialogContent>
              <div style={{display: "flex", flexDirection: 'column', gap: '1rem'}}>
                <div>
                  {t('dialogs.deleteGame.subtext', { gameName: props.gameInfo.dir })}
                </div>
                <Checkbox
                  checked={deleteChecked.value}
                  onChange={(ev, data) => deleteChecked.set(!deleteChecked.value)}
                  label={t('$sureToDeleteGame')}
                  style={{ margin: 0 }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={deleteThisGame} disabled={!deleteChecked.value}>{t('$common.delete')}</Button>
              <Button appearance='primary' onClick={() => {isShowDeleteDialog.set(false); deleteChecked.set(false);}}>{t('$common.exit')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
