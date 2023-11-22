import styles from "./gameElement.module.scss";
import { CommandBarButton, DefaultButton, Dialog, DialogFooter, DialogType, IContextualMenuProps, PrimaryButton, Stack, TextField } from "@fluentui/react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setDashboardShow, setEditingGame } from "../../store/statusReducer";
import { useValue } from "../../hooks/useValue";
import useVarTrans from "@/hooks/useVarTrans";
import { GameInfo } from "./DashBoard";
import { useMemo } from "react";

interface IGameElementProps {
  gameInfo: GameInfo;
  checked: boolean;
  onClick: Function;
  refreash?: () => void;
}

export default function GameElement(props: IGameElementProps) {

  const soureBase = "background";
  const t = useVarTrans('dashBoard.');
  const dispatch = useDispatch();

  function enterEditor(gameName: string) {
    dispatch(setEditingGame(gameName));
    dispatch(setDashboardShow(false));
  }

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

  const deleteDialogContentProps = {
    type: DialogType.normal,
    title: t('dialogs.deleteGame.title'),
    subText: t('dialogs.deleteGame.subtext', {gameName: props.gameInfo.dir}),
  };

  const renameDialogContentProps = {
    type: DialogType.normal,
    title: t('dialogs.renameDir.title'),
  };
  
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'openInFileExplorer',
        text: t('menu.openInFileExplorer'),
        iconProps: { iconName: 'OpenFolderHorizontal' },
        onClick: () => openInFileExplorer(),
      },
      {
        key: 'previewInNewTab',
        text: t('menu.previewInNewTab'),
        iconProps: { iconName: 'OpenInNewTab' },
        onClick: () => previewInNewTab(),
      },
      {
        key: 'renameDir',
        text: t('menu.renameDir'),
        iconProps: { iconName: 'Rename' },
        onClick: () => isShowRenameDialog.set(true),
      },
      {
        key: 'deleteGame',
        text: t('menu.deleteGame'),
        iconProps: { iconName: 'Delete' },
        onClick: () => isShowDeleteDialog.set(true),
      },
    ],
  };

  const openInFileExplorer = () => {
    axios.get(`/api/manageGame/openGameDict/${props.gameInfo.dir}`);
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
    });
  };

  const deleteThisGame = () => {
    axios.post("/api/manageGame/delete", { source: `public/games/${props.gameInfo.dir}` }).then(() =>
    {
      props.refreash?.();
      isShowDeleteDialog.set(false);
    }
    );
  };

  // @ts-ignore
  return <div onClick={props.onClick} className={className} id={props.gameInfo.dir}>
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
      <div className={styles.gameElement_action}>
        <span onClick={() => enterEditor(props.gameInfo.dir)} className={styles.editGameButton}>{t('preview.editGame')}</span>
        <Stack horizontal styles={{ root: { height: 32} }}>
          <CommandBarButton
            menuProps={menuProps}
            style={{ borderRadius: "2px"}}
          />
        </Stack>
      </div>
    </div>
    {/* 删除对话框 */}
    <Dialog
      hidden={!isShowDeleteDialog.value}
      onDismiss={() => isShowDeleteDialog.set(false)}
      dialogContentProps={deleteDialogContentProps}
      // modalProps={modalProps}
    >
      <DialogFooter>
        <PrimaryButton onClick={deleteThisGame} text={t('$common.delete')} />
        <DefaultButton onClick={() => isShowDeleteDialog.set(false)} text={t('$common.exit')} />
      </DialogFooter>
    </Dialog>
    {/* 重命名对话框 */}
    <Dialog
      hidden={!isShowRenameDialog.value}
      onDismiss={() => isShowRenameDialog.set(false)}
      dialogContentProps={renameDialogContentProps}
      // modalProps={modalProps}
    >
      <TextField 
        defaultValue={props.gameInfo.dir}
        onChange={(event, value) => newGameName.set(value ? value.trim() : props.gameInfo.dir)}
        onKeyDown={(event) => (event.key === 'Enter') && renameThisGame(props.gameInfo.dir, newGameName.value)}
      />
      <DialogFooter>
        <PrimaryButton onClick={() => renameThisGame(props.gameInfo.dir, newGameName.value)} text={t('$common.rename')} />
        <DefaultButton onClick={() => isShowRenameDialog.set(false)} text={t('$common.exit')} />
      </DialogFooter>
    </Dialog>
  </div>;
};
