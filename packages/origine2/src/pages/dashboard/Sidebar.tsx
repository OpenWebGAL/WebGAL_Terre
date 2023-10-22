import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import React, {useEffect, useState} from "react";
import { Callout, PrimaryButton, Text, TextField } from "@fluentui/react";
import useTrans from "@/hooks/useTrans";
import { GameInfo } from "./DashBoard";

interface ISidebarProps {
  gameList: GameInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  createGame: (name: string) => void;
  onDeleteGame?: () => void;
}

export default function Sidebar(props: ISidebarProps) {
  const t = useTrans('dashBoard.');

  const [showCreateGameCallout, setShowCreateGameCallout] = useState(false);
  const [newGameName, setNewGameName] = useState(t('createNewGame.dialog.defaultName') || "新的游戏");

  function createNewGame() {
    props.createGame(newGameName);
    setShowCreateGameCallout(false);
  }

  const translatedGameName = t('createNewGame.dialog.defaultName');
  useEffect(()=>{
    setNewGameName(translatedGameName);
  },[translatedGameName]);

  return <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t('titles.gameList')}</span>
      { /* @ts-ignore} */}
      <span id="new-game-button" onClick={() => {
        setShowCreateGameCallout(!showCreateGameCallout);
      }} className={styles.createGameButton}>{t('createNewGame.button')}</span>
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
    <div className={styles.game_list}>
      {
        props.gameList.map(e => {
          const checked = props.currentSetGame === e.dir;
          return <GameElement onDeleteGame={() => props.onDeleteGame?.()} onClick={() => props.setCurrentGame(e.dir)} gameInfo={e}
            key={e.dir} checked={checked} />;
        })
      }
    </div>
  </div>;
}
