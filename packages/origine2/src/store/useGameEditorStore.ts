import { GameEditorAction, GameEditorState } from "@/types/gameEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const createGameEditorStore = (currentEdit: string) =>
  create<GameEditorState & GameEditorAction>()(
    persist(
      (set) => ({
        fileTabs: [],
        currentFileTab: null,
        currentSidebarTab: 'asset',
        currentTopbarTab: 'config',
        isShowSidebar: true,
        isCodeMode: false,
        isShowDebugger: false,
        updateFileTabs: (fileTabs) => set({ fileTabs }),
        addFileTab: (fileTab) => set((state) => ({ fileTabs: [...state.fileTabs, fileTab] })),
        removeFileTab: (fileTab) => set((state) => ({ fileTabs: state.fileTabs.filter((tab) => tab.tabPath !== fileTab.tabPath) })),
        updateCurrentFileTab: (currentFileTab) => set({ currentFileTab }),
        updateCurrentSidebarTab: (currentSidebarTab) => set({ currentSidebarTab }),
        updateCurrentTopbarTab: (currentTopbarTab) => set({ currentTopbarTab }),
        updateIsShowSidebar: (isShowSidebar) => set({ isShowSidebar }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
      }),
      {
        name: `game-editor-storage-${currentEdit}`,
        storage: createJSONStorage(() => localStorage),
      },
    )
  );

export const GameEditorContext = createContext<StoreApi<GameEditorState & GameEditorAction> | null>(null);

export const useGameEditorContext = <T>(selector: (state: GameEditorState & GameEditorAction) => T): T => {
  const store = useContext(GameEditorContext);
  if (!store) throw new Error('Missing GameEditorContext.Provider in the tree');
  return useStore(store, selector);
};
