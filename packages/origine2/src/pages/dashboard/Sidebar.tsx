import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import { useState } from "react";
import { GameInfo } from "./DashBoard";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1 } from "@fluentui/react-components";
import { AddFilled, AddRegular, ArrowSyncFilled, ArrowSyncRegular, bundleIcon } from "@fluentui/react-icons";
import {t} from "@lingui/macro";

interface ISidebarProps {
  gameList: GameInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  createGame: (name: string) => void;
  refreash?: () => void;
}

const AddIcon = bundleIcon(AddFilled, AddRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);

export default function Sidebar(props: ISidebarProps) {

  const [createGameFormOpen, setCreateGameFormOpen] = useState(false);
  const [newGameName, setNewGameName] = useState(t`新的游戏`);

  function createNewGame() {
    if (newGameName && newGameName.trim() !== '' && !props.gameList.find((item) => item.dir === newGameName.trim())) {
      props.createGame(newGameName);
      setCreateGameFormOpen(false);
      setNewGameName(t`新的游戏`);
    }
  }

  return <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t`游戏列表`}</span>
      <div className={styles.sidebar_top_buttons}>
        <Popover
          withArrow
          trapFocus
          open={createGameFormOpen}
          onOpenChange={() => setCreateGameFormOpen(!createGameFormOpen)}
        >
          <PopoverTrigger>
            <Button appearance='primary' icon={<AddIcon />}>{t`新建游戏`}</Button>
          </PopoverTrigger>
          <PopoverSurface>
            <form style={{display:"flex", flexDirection:"column", gap:'16px'}}>
              <Subtitle1>{t`创建新游戏`}</Subtitle1>
              <Input
                value={newGameName}
                onChange={(event) => setNewGameName(event.target.value)}
                onKeyDown={(event) => (event.key === 'Enter') && createNewGame()}
                defaultValue={t`新的游戏`}
                placeholder={t`新游戏名`} />
              <Button appearance='primary' disabled={newGameName.trim() === ''} onClick={createNewGame} >{t`创建`}</Button>
            </form>
          </PopoverSurface>
        </Popover>
        <Button appearance='secondary' onClick={props.refreash} icon={<ArrowSyncIcon />} />
      </div>
    </div>
    <div className={styles.game_list}>
      {
        props.gameList.map(e => {
          const checked = props.currentSetGame === e.dir;
          return <GameElement
            onClick={() => props.setCurrentGame(e.dir)}
            refreash={props.refreash}
            gameInfo={e}
            key={e.dir}
            checked={checked}
          />;
        })
      }
    </div>
  </div>;
}
