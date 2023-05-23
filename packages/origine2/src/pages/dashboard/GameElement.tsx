import styles from "./gameElement.module.scss";
import { Delete } from "@icon-park/react";
import { DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton } from "@fluentui/react";
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

  // @ts-ignore
  return <div onClick={props.onClick} className={className}>
    {props.gameName}
    <div style={{ marginLeft: "auto" }}>
      <Delete onClick={() => isShowDialog.set(true)} />
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
