import { redirect } from "@/hooks/useHashRoute";
import { gameListFetcher } from "@/pages/dashboard/DashBoard";
import useEditorStore from "@/store/useEditorStore";
import { GameEditorContext, createGameEditorStore } from "@/store/useGameEditorStore";
import { Spinner } from "@fluentui/react-components";
import { ReactNode, useRef } from "react";
import useSWR from "swr";

const GameEditorProvider = ({ children }: { children: ReactNode }) => {
  const page = useEditorStore.use.page();
  const gameDir = useEditorStore.use.subPage();

  if (page !== 'game' || !gameDir) {
    redirect('dashboard', 'game');
  };

  const { data: gameList, isLoading: gameListLoading } = useSWR("game-list", gameListFetcher);
  const fristLoading = gameListLoading && !gameList;
  const inGameList = gameList && gameList.length > 0 && gameList.some((game) => game.dir === gameDir);

  if (!fristLoading && !inGameList) {
    redirect('dashboard', 'game');
  }

  return (
    <>
      {
        fristLoading &&
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spinner labelPosition="below" label={gameDir} />
        </div>
      }
      {inGameList && !fristLoading && <GameEditorContextProvider>{children}</GameEditorContextProvider>}
    </>
  );
};

const GameEditorContextProvider = ({ children }: { children: ReactNode }) => {
  const gameDir = useEditorStore.use.subPage();
  const gameEditorStore = useRef(createGameEditorStore(gameDir)).current;
  return (
    <GameEditorContext.Provider value={gameEditorStore}>
      {children}
    </GameEditorContext.Provider>
  );
};

export default GameEditorProvider;