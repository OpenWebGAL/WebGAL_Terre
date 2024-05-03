import { ITemplateEditorAction, ITemplateEditorState } from "@/types/templateEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initState: ITemplateEditorState = {
  tabs: [],
  currentTab: null,
  expandNode: [],
  isCodeMode: false,
  isShowDebugger: false,
  sidebarWidth: 280,
  componentTreeHeight: 400,
  previewHeight: 280,
};

export const createTemplateEditorStore = (templateName: string) =>
  create<ITemplateEditorState & ITemplateEditorAction>()(
    persist(
      (set) => ({
        ...initState,
        updateTabs: (tabs) => set({ tabs }),
        updateCurrentTab: (currentTab) => set({ currentTab }),
        updateExpandNode: (expandNode) => set({ expandNode }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
        updateSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
        updateComponentTreeHeight: (componentTreeHeight) => set({ componentTreeHeight }),
        updatePreviewHeight: (previewHeight) => set({ previewHeight }),
      }),
      {
        name: `template-editor-storage-${templateName}`,
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
