import styles from "./gameElement.module.scss";
import { DefaultButton, Dialog, DialogFooter, DialogType, IIconProps, IconButton, PrimaryButton } from "@fluentui/react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import useVarTrans from "@/hooks/useVarTrans";

interface IGameElementProps {
  gameName: string;
  checked: boolean;
  onClick: Function;
  onDeleteGame?: () => void;
}

export default function GameElement(props: IGameElementProps) {

  let className = styles.gameElement_main;
  if (props.checked) {
    className = className + " " + styles.gameElement_checked;
  }

  const t = useVarTrans('dashBoard.');

  // 获取 Fluent UI 的 icon
  const deleteIcon: IIconProps = { iconName: 'Delete' };

  const isShowDialog = useValue(false);
  const dialogContentProps = {
    type: DialogType.normal,
    title: t('dialogs.deleteGame.title'),
    subText: t('dialogs.deleteGame.subtext', {gameName: props.gameName}),
  };

  const deleteThisGame = () => {
    axios.post("/api/manageGame/delete", { source: `public/games/${props.gameName}` }).then(() =>
    {
      props.onDeleteGame?.();
      isShowDialog.set(false);
    }
    );
  };

  return (
    <div className={styles.gameElement_container}>
      {/* @ts-ignore */}
      <DefaultButton text={props.gameName} className={styles.gameElement} onClick={props.onClick}/>
      <IconButton iconProps={deleteIcon} style={{ marginLeft: "auto" }} title="delete" ariaLabel="delete" onClick={() => isShowDialog.set(true)} />
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
    </div>
  )
};
