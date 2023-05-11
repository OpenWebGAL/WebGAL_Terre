import styles from "./gamepreview.module.scss";
import { useDispatch } from "react-redux";
import { setDashboardShow, setEditingGame } from "../../store/statusReducer";
import useTrans from "@/hooks/useTrans";

interface IGamePreviewProps {
  gameName: string;
}

export function GamePreview(props: IGamePreviewProps) {
  const t = useTrans('dashBoard.preview.');
  const dispatch = useDispatch();
  if (props.gameName === "") {
    return <div className={styles.noneChecked}>
      {t('noneChecked')}
    </div>;
  }

  function enterEditor(gameName: string) {
    dispatch(setEditingGame(gameName));
    dispatch(setDashboardShow(false));
  }

  return <div className={styles.preview_main}>
    <div className={styles.preview_title}>
      <span className={styles.preview_title_text}>{props.gameName}</span>
      <span onClick={() => enterEditor(props.gameName)} className={styles.editGameButton}>{t('editGame')}</span>
    </div>
    {/* eslint-disable-next-line react/iframe-missing-sandbox */}
    <iframe id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow} src={`/games/${props.gameName}`} />
  </div>;
}
