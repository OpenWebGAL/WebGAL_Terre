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
  templateActionsHeight: 148,
  componentTreeHeight: 400,
  previewHeight: 280,
  previewMode: 'edit',
  useMockData: true,
  styleTab: 'simple',
  fullCssMode: 'graphical',
  isStyleCollapsed: false,
  activeScreenId: 'title',
  isPreviewReady: false,
  screenPayload: null,
  draftScssText: '',
  selectedPartId: null,
  lockedState: 'default',
  applyStyleIgnored: null,
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
        updateTemplateActionsHeight: (templateActionsHeight) => set({ templateActionsHeight }),
        updateComponentTreeHeight: (componentTreeHeight) => set({ componentTreeHeight }),
        updatePreviewHeight: (previewHeight) => set({ previewHeight }),
        updatePreviewMode: (previewMode) => set({ previewMode }),
        updateUseMockData: (useMockData) => set({ useMockData }),
        updateStyleTab: (styleTab) => set({ styleTab }),
        updateFullCssMode: (fullCssMode) => set({ fullCssMode }),
        updateIsStyleCollapsed: (isStyleCollapsed) => set({ isStyleCollapsed }),
        updateActiveScreenId: (activeScreenId) => set({ activeScreenId }),
        updateIsPreviewReady: (isPreviewReady) => set({ isPreviewReady }),
        updateScreenPayload: (screenPayload) => set({ screenPayload }),
        updateDraftScssText: (draftScssText) => set({ draftScssText }),
        updateSelectedPartId: (selectedPartId) => set({ selectedPartId }),
        updateLockedState: (lockedState) => set({ lockedState }),
        updateApplyStyleIgnored: (applyStyleIgnored) => set({ applyStyleIgnored }),
      }),
      {
        name: `template-editor-storage-${templateName}`,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tabs: state.tabs,
          currentTab: state.currentTab,
          expandNode: state.expandNode,
          isCodeMode: state.isCodeMode,
          isShowDebugger: state.isShowDebugger,
          sidebarWidth: state.sidebarWidth,
          templateActionsHeight: state.templateActionsHeight,
          componentTreeHeight: state.componentTreeHeight,
          previewHeight: state.previewHeight,
          previewMode: state.previewMode,
          useMockData: state.useMockData,
          styleTab: state.styleTab,
          fullCssMode: state.fullCssMode,
          isStyleCollapsed: state.isStyleCollapsed,
          activeScreenId: state.activeScreenId,
        }),
      },
    )
  );

export const TemplateEditorContext = createContext<StoreApi<ITemplateEditorState & ITemplateEditorAction> | null>(null);

export const useTemplateEditorContext = <T>(selector: (state: ITemplateEditorState & ITemplateEditorAction) => T): T => {
  const store = useContext(TemplateEditorContext);
  if (!store) throw new Error('Missing TemplateEditorContext.Provider in the tree');
  return useStore(store, selector);
};
