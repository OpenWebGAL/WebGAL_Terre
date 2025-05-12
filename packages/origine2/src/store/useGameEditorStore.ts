import { IGameEditorAction, IGameEditorState } from "@/types/gameEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initState: IGameEditorState = {
  tags: [],
  currentTag: null,
  currentSidebarTab: 'asset',
  currentTopbarTab: 'config',
  assetsViewType: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  isShowSidebar: true,
  isCodeMode: false,
  isShowDebugger: false,
};

export const createGameEditorStore = (gameName: string) =>
  create<IGameEditorState & IGameEditorAction>()(
    persist(
      (set) => ({
        ...initState,
        updateTags: (tags) => set({ tags }),
        addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
        removeTag: (tag) => set((state) => ({ tags: state.tags.filter((item) => item.path !== tag.path) })),
        updateCurrentTag: (currentTag) => set({ currentTag }),
        updateCurrentSidebarTab: (currentSidebarTab) => set({ currentSidebarTab }),
        updateCurrentTopbarTab: (currentTopbarTab) => set({ currentTopbarTab }),
        updateAssetsViewType: (assetsViewType) => set({ assetsViewType }),
        updateSortBy: (sortBy) => set({ sortBy }),
        updateSortOrder: (sortOrder) => set({ sortOrder }),
        updateIsShowSidebar: (isShowSidebar) => set({ isShowSidebar }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
      }),
      {
        name: `game-editor-storage-${gameName}`,
        storage: createJSONStorage(() => localStorage),
      },
    )
  );

export const GameEditorContext = createContext<StoreApi<IGameEditorState & IGameEditorAction> | null>(null);

export const useGameEditorContext = <T>(selector: (state: IGameEditorState & IGameEditorAction) => T): T => {
  const store = useContext(GameEditorContext);
  if (!store) throw new Error('Missing GameEditorContext.Provider in the tree');
  return useStore(store, selector);
};
