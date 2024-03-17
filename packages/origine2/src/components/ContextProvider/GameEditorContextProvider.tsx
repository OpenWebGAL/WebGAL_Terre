import useEditorStore from "@/store/useEditorStore";
import { GameEditorContext, createGameEditorStore } from "@/store/useGameEditorStore";
import { ReactNode, useRef } from "react";

const GameEditorContextProvider = ({ children }: { children: ReactNode}) => {
  const editor = useEditorStore.use.editor();
  if (editor !== 'game') return null;
  const currentEdit = useEditorStore.use.currentEdit();
  const gameEditorStore = useRef(createGameEditorStore(currentEdit)).current;
  return(
    <GameEditorContext.Provider value={gameEditorStore}>
      {children}
    </GameEditorContext.Provider>
  );
};

export default GameEditorContextProvider;