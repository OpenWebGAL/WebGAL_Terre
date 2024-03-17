import { ITemplateEditorAction, ITemplateEditorState } from "@/types/templateEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initState: ITemplateEditorState = {
  currentTopbarTab: 'config',
  isCodeMode: false,
  isShowDebugger: false,
};

export const createTemplateEditorStore = (currentEdit: string) =>
  create<ITemplateEditorState & ITemplateEditorAction>()(
    persist(
      (set) => ({
        ...initState,
        updateCurrentTopbarTab: (currentTopbarTab) => set({ currentTopbarTab }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
      }),
      {
        name: `template-editor-storage-${currentEdit}`,
        storage: createJSONStorage(() => localStorage),
      },
    )
  );

export const TemplateEditorContext = createContext<StoreApi<ITemplateEditorState & ITemplateEditorAction> | null>(null);

export const useTemplateEditorContext = <T>(selector: (state: ITemplateEditorState & ITemplateEditorAction) => T): T => {
  const store = useContext(TemplateEditorContext);
  if (!store) throw new Error('Missing TemplateEditorContext.Provider in the tree');
  return useStore(store, selector);
};
