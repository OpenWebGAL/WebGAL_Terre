import styles from "./gameElement.module.scss";
import { useValue } from "../../hooks/useValue";
import { useMemo } from "react";
import { api } from "@/api";
import { Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { Delete24Filled, Delete24Regular, FolderOpen24Filled, FolderOpen24Regular, MoreVertical24Filled, MoreVertical24Regular, Open24Filled, Open24Regular, Rename24Filled, Rename24Regular, bundleIcon } from "@fluentui/react-icons";
import { localStorageRename } from "@/utils/localStorageRename";
import { goTo } from '@/router';
import { t } from "@lingui/macro";
import { GameInfoDto } from "@/api/Api";

interface IGameElementProps {
  gameInfo: GameInfoDto;
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

  const renameThisGame = async (gameName:string, newGameName:string) => {
    await api.manageGameControllerRename({gameName: gameName, newName: newGameName});
    props.refreash?.();
    isShowRenameDialog.set(false);
    localStorageRename(`game-editor-storage-${gameName}`, `game-editor-storage-${newGameName}`);
  };

  const deleteThisGame = async () => {
    await api.manageGameControllerDelete({gameName: props.gameInfo.dir});
    props.refreash?.();
    isShowDeleteDialog.set(false);
    localStorage.removeItem(`game-editor-storage-${props.gameInfo.dir}`);
  };

  const gameName = props.gameInfo.dir;
  return (
    <>
      <div onClick={props.onClick} className={className} id={props.gameInfo.dir}>
        <img
          src={`/games/${props.gameInfo.dir}/game/${soureBase}/${props.gameInfo.cover}`}
          alt={props.gameInfo.name}
          className={styles.gameElement_cover}
        />
        <div className={styles.gameElement_title}>
          <span>{props.gameInfo.name}</span>
        </div>
        <div className={styles.gameElement_sub}>
          <span className={styles.gameElement_dir}>{props.gameInfo.dir}</span>
          <div className={styles.gameElement_action} onClick={(event) => event.stopPropagation()}>
            <Button appearance='primary' onClick={() => goTo('game', props.gameInfo.dir)}>
              <span style={{textWrap: 'nowrap'}}>{t`编辑游戏`}</span>
            </Button>
            <Menu>
              <MenuTrigger>
                <MenuButton appearance='subtle' icon={<MoreVerticalIcon />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<FolderOpenIcon />} onClick={() => openInFileExplorer()}>{t`在文件管理器中打开`}</MenuItem>
                  <MenuItem icon={<OpenIcon />} onClick={() => previewInNewTab()}>{t`在新标签页中预览`}</MenuItem>
                  <MenuItem icon={<RenameIcon />} onClick={() => isShowRenameDialog.set(true)}>{t`重命名游戏目录`}</MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => isShowDeleteDialog.set(true)}>{t`删除游戏`}</MenuItem>
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
            <DialogTitle>{t`重命名游戏目录`}</DialogTitle>
            <DialogContent>
              <Input
                style={{width:'100%'}}
                defaultValue={props.gameInfo.dir}
                onChange={(event) => newGameName.set(event.target.value ? event.target.value.trim() : props.gameInfo.dir)}
                onKeyDown={(event) => (event.key === 'Enter') && renameThisGame(props.gameInfo.dir, newGameName.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowRenameDialog.set(false)}>{t`返回`}</Button>
              <Button appearance='primary' onClick={() => renameThisGame(props.gameInfo.dir, newGameName.value)}>{t`重命名`}</Button>
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
            <DialogTitle>{t`删除游戏`}</DialogTitle>
            <DialogContent>
              <div style={{display: "flex", flexDirection: 'column', gap: '1rem'}}>
                <div>
                  {t`是否要删除 "${gameName}" ？`}
                </div>
                <Checkbox
                  checked={deleteChecked.value}
                  onChange={(ev, data) => deleteChecked.set(!deleteChecked.value)}
                  label={t`我确定要删除游戏`}
                  style={{ margin: 0 }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={deleteThisGame} disabled={!deleteChecked.value}>{t`删除`}</Button>
              <Button appearance='primary' onClick={() => {isShowDeleteDialog.set(false); deleteChecked.set(false);}}>{t`返回`}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
