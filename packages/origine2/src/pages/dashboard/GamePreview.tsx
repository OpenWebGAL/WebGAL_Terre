import styles from "./gamepreview.module.scss";
import { useDispatch } from "react-redux";
import { setDashboardShow, setEditingGame } from "../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import { GameInfo } from './DashBoard';
import { Button } from "@fluentui/react-components";
import { Dismiss48Filled, Dismiss48Regular, bundleIcon } from "@fluentui/react-icons";

interface IGamePreviewProps {
  currentGame: string;
  setCurrentGame: (currentGame: string | null) => void;
  gameInfo: GameInfo;
}

export default function GamePreview(props: IGamePreviewProps) {
  const t = useTrans('dashBoard.preview.');
  const dispatch = useDispatch();

  const DismissIcon = bundleIcon(Dismiss48Filled, Dismiss48Regular);

  if (props.currentGame === null) {
    return <div className={styles.noneChecked}>
      {t('noneChecked')}
    </div>;
  }

  return <div className={styles.preview_main}>
    <div className={styles.preview_title}>
      <span className={styles.preview_title_text}>{props.gameInfo.title}</span>
      <Button appearance='subtle' icon={<DismissIcon />} onClick={() => props.setCurrentGame(null)} />
    </div>
    {/* eslint-disable-next-line react/iframe-missing-sandbox */}
    <iframe id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow} src={`/games/${props.currentGame}`} />
  </div>;
}
