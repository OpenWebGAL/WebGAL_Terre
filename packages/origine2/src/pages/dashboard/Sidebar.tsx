import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import { useState } from "react";
import useTrans from "@/hooks/useTrans";
import { GameInfo } from "./DashBoard";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1 } from "@fluentui/react-components";
import { Add24Filled, Add24Regular, bundleIcon } from "@fluentui/react-icons";

interface ISidebarProps {
  gameList: GameInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  createGame: (name: string) => void;
  refreash?: () => void;
}

export default function Sidebar(props: ISidebarProps) {
  const t = useTrans('dashBoard.');

  const AddIcon = bundleIcon(Add24Filled, Add24Regular);

  const [createGameFormOpen, setCreateGameFormOpen] = useState(false);
  const [newGameName, setNewGameName] = useState(t('createNewGame.dialog.defaultName') || 'NewGame');

  function createNewGame() {
    if (newGameName && newGameName.trim() !== '' && !props.gameList.find((item) => item.dir === newGameName.trim())) {
      props.createGame(newGameName);
      setCreateGameFormOpen(false);
      setNewGameName(t('createNewGame.dialog.defaultName') || 'NewGame');
    }
  }

  return <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t('titles.gameList')}</span>
      <Popover
        withArrow
        trapFocus
        open={createGameFormOpen}
        onOpenChange={() => setCreateGameFormOpen(!createGameFormOpen)}
      >
        <PopoverTrigger>
          <Button appearance='primary' icon={<AddIcon />}>{t('createNewGame.button')}</Button>
        </PopoverTrigger>
        <PopoverSurface>
          <form style={{display:"flex", flexDirection:"column", gap:'8px'}}>
            <Subtitle1>{t('createNewGame.dialog.title')}</Subtitle1>
            <Input
              value={newGameName}
              onChange={(event) => setNewGameName(event.target.value)}
              onKeyDown={(event) => (event.key === 'Enter') && createNewGame()}
              defaultValue={t('createNewGame.dialog.defaultName')}
              placeholder={t('createNewGame.dialog.text')} />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button appearance='primary' onClick={createNewGame} >{t('$common.create')}</Button>
            </div>         
          </form>
        </PopoverSurface>
      </Popover>
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
