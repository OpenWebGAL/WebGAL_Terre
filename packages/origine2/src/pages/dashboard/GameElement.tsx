import styles from "./gameElement.module.scss";
import { CommandBarButton, DefaultButton, Dialog, DialogFooter, DialogType, IContextualMenuProps, PrimaryButton, Stack } from "@fluentui/react";
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
  onDeleteGame?: () => void;
}

export default function GameElement(props: IGameElementProps) {

  const t = useVarTrans('dashBoard.');
  const dispatch = useDispatch();

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

  const isShowDialog = useValue(false);
  const dialogContentProps = {
    type: DialogType.normal,
    title: t('dialogs.deleteGame.title'),
    subText: t('dialogs.deleteGame.subtext', {gameName: props.gameInfo.dir}),
  };

  const soureBase = "background";

  function enterEditor(gameName: string) {
    dispatch(setEditingGame(gameName));
    dispatch(setDashboardShow(false));
  }
  
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'deleteGame',
        text: t('$common.delete'),
        iconProps: { iconName: 'Delete' },
        onClick: () => isShowDialog.set(true),
      },
    ],
  };

  const deleteThisGame = () => {
    axios.post("/api/manageGame/delete", { source: `public/games/${props.gameInfo.dir}` }).then(() =>
    {
      props.onDeleteGame?.();
      isShowDialog.set(false);
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
    {/* @ts-ignore */}
    <Dialog
      hidden={!isShowDialog.value}
      onDismiss={() => isShowDialog.set(false)}
      dialogContentProps={dialogContentProps}
      // modalProps={modalProps}
    >
      <DialogFooter>
        <PrimaryButton onClick={deleteThisGame} text={t('$common.delete')} />
        <DefaultButton onClick={() => isShowDialog.set(false)} text={t('$common.exit')} />
      </DialogFooter>
    </Dialog>
  </div>;
};
