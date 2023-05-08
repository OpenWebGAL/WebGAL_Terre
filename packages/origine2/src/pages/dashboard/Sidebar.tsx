import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import React, { useState } from "react";
import { Callout, PrimaryButton, Text, TextField } from "@fluentui/react";

interface ISidebarProps {
  gameList: string[];
  currentSetGame: string;
  setCurrentGame: Function;
  createGame: Function;
  onDeleteGame?: () => void;
}


export default function Sidebar(props: ISidebarProps) {

  const [showCreateGameCallout, setShowCreateGameCallout] = useState(false);
  const [newGameName, setNewGameName] = useState("新的游戏");

  const showGameList = props.gameList.map(e => {
    const checked = props.currentSetGame === e;
    return <GameElement onDeleteGame={() => props.onDeleteGame?.()} onClick={() => props.setCurrentGame(e)} gameName={e}
      key={e} checked={checked} />;
  });

  function createNewGame() {
    props.createGame(newGameName);
    setShowCreateGameCallout(false);
  }


  return <div className={styles.sidebar_main}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>游戏列表</span>
      { /* @ts-ignore} */}
      <span id="new-game-button" onClick={() => {
        setShowCreateGameCallout(!showCreateGameCallout);
      }} className={styles.createGameButton}>新建游戏</span>
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
          创建新游戏
        </Text>
        <div>
          <TextField onChange={(event, newValue) => {
            setNewGameName(newValue ?? "");
          }} defaultValue="新的游戏" label="新游戏名" />
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "5px 0 5px 0" }}>
          <PrimaryButton text="创建" onClick={createNewGame} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
    {showGameList}
  </div>;
}
