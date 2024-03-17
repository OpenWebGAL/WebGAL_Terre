import { TemplateEditorAction, TemplateEditorState } from "@/types/templateEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const createTemplateEditorStore = (currentEdit: string) =>
  create<TemplateEditorState & TemplateEditorAction>()(
    persist(
      (set) => ({
        currentTopbarTab: 'config',
        isCodeMode: false,
        isShowDebugger: false,
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

export const TemplateEditorContext = createContext<StoreApi<TemplateEditorState & TemplateEditorAction> | null>(null);

export const useTemplateEditorContext = <T>(selector: (state: TemplateEditorState & TemplateEditorAction) => T): T => {
  const store = useContext(TemplateEditorContext);
  if (!store) throw new Error('Missing TemplateEditorContext.Provider in the tree');
  return useStore(store, selector);
};
