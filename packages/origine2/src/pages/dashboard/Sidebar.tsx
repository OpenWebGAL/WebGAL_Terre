import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import {useEffect, useState} from "react";
import { Callout, PrimaryButton, Text, TextField } from "@fluentui/react";
import useTrans from "@/hooks/useTrans";

interface ISidebarProps {
  gameList: string[];
  currentSetGame: string;
  setCurrentGame: Function;
  createGame: Function;
  onDeleteGame?: () => void;
}


export default function Sidebar(props: ISidebarProps) {
  const t = useTrans('dashBoard.');

  const [showCreateGameCallout, setShowCreateGameCallout] = useState(false);
  const [newGameName, setNewGameName] = useState(t('createNewGame.dialog.defaultName') || "新的游戏");

  const showGameList = props.gameList.map(e => {
    const checked = props.currentSetGame === e;
    return <GameElement onDeleteGame={() => props.onDeleteGame?.()} onClick={() => props.setCurrentGame(e)} gameName={e}
      key={e} checked={checked} />;
  });

  function createNewGame() {
    props.createGame(newGameName);
    setShowCreateGameCallout(false);
  }


  const translatedGameName = t('createNewGame.dialog.defaultName');
  useEffect(()=>{
    setNewGameName(translatedGameName);
  },[translatedGameName]);

  return <div className={styles.sidebar_main}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t('titles.gameList')}</span>
      <PrimaryButton text={t('createNewGame.button')} onClick={() => {
        setShowCreateGameCallout(!showCreateGameCallout);
      }} className={styles.createGameButton} />
      {showCreateGameCallout && <Callout
        className={styles.callout}
        ariaLabelledBy="createNewSceneCallout"
        ariaDescribedBy="createNewSceneCallout"
        role="dialog"
        gapSpace={0}
        target="#new-game-button"
        onDismiss={() => {
          setShowCreateGameCallout(false);
        }}
        setInitialFocus
        style={{ width: "300px", padding: "5px 10px 5px 10px" }}
      >
        <Text block variant="xLarge" className={styles.title}>
          {t('createNewGame.dialog.title')}
        </Text>
        <div>
          <TextField value={newGameName} onChange={(event, newValue) => {
            setNewGameName(newValue ?? "");
          }} defaultValue={t('createNewGame.dialog.defaultName')} label={t('createNewGame.dialog.text')} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "5px 0 5px 0" }}>
          <PrimaryButton text={t('$common.create')} onClick={createNewGame} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
    {showGameList}
  </div>;
}
