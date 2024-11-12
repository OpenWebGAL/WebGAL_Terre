import { GameInfoDto } from "@/api/Api";
import styles from "./gamepreview.module.scss";
import { Button } from "@fluentui/react-components";
import { Dismiss48Filled, Dismiss48Regular, bundleIcon } from "@fluentui/react-icons";

interface IGamePreviewProps {
  currentGame: string;
  setCurrentGame: (currentGame: string | null) => void;
  gameInfo: GameInfoDto;
}

export default function GamePreview(props: IGamePreviewProps) {
  const DismissIcon = bundleIcon(Dismiss48Filled, Dismiss48Regular);

  return <div className={styles.preview_main}>
    <div className={styles.preview_title}>
      <Button appearance='subtle' icon={<DismissIcon />} onClick={() => props.setCurrentGame(null)} />
      <span className={styles.preview_title_text}>{props.gameInfo.name}</span>
    </div>
    {/* eslint-disable-next-line react/iframe-missing-sandbox */}
    <iframe id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow} src={`/games/${props.currentGame}`} />
  </div>;
}
