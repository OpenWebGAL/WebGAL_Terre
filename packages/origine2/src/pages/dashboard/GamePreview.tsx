import styles from "./gamepreview.module.scss";
import { useDispatch } from "react-redux";
import { setDashboardShow, setEditingGame } from "../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import { GameInfo } from "./DashBoard";
import { IconButton } from "@fluentui/react";

interface IGamePreviewProps {
  currentGame: GameInfo;
  setCurrentGame: (currentGame: GameInfo | null) => void;
}

export function GamePreview(props: IGamePreviewProps) {
  const t = useTrans('dashBoard.preview.');
  const dispatch = useDispatch();
  if (props.currentGame === null) {
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
      <IconButton iconProps={{iconName: 'ChromeClose'}} onClick={() => props.setCurrentGame(null)} />
      {/* <span onClick={() => enterEditor(props.currentGame.dir)} className={styles.editGameButton}>{t('editGame')}</span> */}
      <span className={styles.preview_title_text}>{props.currentGame.title}</span>

    </div>
    {/* eslint-disable-next-line react/iframe-missing-sandbox */}
    <iframe id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow} src={`/games/${props.currentGame.dir}`} />
  </div>;
}
