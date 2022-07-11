import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";

interface ISidebarProps {
  gameList: string[];
  currentSetGame: string;
  setCurrentGame: Function;
  createGame: Function;
}


export default function Sidebar(props: ISidebarProps) {
  const showGameList = props.gameList.map(e => {
    const checked = props.currentSetGame === e;
    return <GameElement onClick={() => props.setCurrentGame(e)} gameName={e} key={e} checked={checked} />;
  });


  return <div className={styles.sidebar_main}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>游戏列表</span>
      { /* @ts-ignore} */}
      <span onClick={props.createGame} className={styles.createGameButton}>新建游戏</span>
    </div>
    {showGameList}
  </div>;
}
