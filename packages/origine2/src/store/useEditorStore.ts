import { IEditorState, IEditorAction } from '@/types/editor';
import createSelectors from '@/utils/createSelectors';
import { updateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

let subPageChangedCallback: (subPage: string) => void = () => {};

export const registerSubPageChangedCallback = (callback: (subPage: string) => void) => {
  subPageChangedCallback = callback;
};

const useEditorStoreBase = create<IEditorState & IEditorAction>()(
  persist(
    (set, get) => ({
      page: 'dashboard',
      subPage: '',
      expand: 0,
      language: 'zhCn',
      editorFontFamily: "Consolas, 'Courier New', monospace",
      editorFontSize: 14,
      viewType: 'list',
      sortBy: 'name',
      sortOrder: 'asc',
      isAutoHideToolbar: false,
      isShowPreview: true,
      isEnableLivePreview: false,
      isAutoWarp: false,
      isUseExpFastSync:false,
      isWindowAdjustment: false, // 自定义的状态变量，表示预览窗口调整功能是否开启
      isUseFontOptimization: false,
      ignoreVersion: '',
      isCascaderDelimitersCustomizable: false,
      cascaderDelimiters: ['/'],
      isDarkMode: false,
      isUseRealtimeEffect: true,
      updateIsWindowAdjustment: (isWindowAdjustment) => set({ isWindowAdjustment }),
      updatePage: (page) => set({page}),
      updateSubPage: (subPage) => {
        set({ subPage });
        subPageChangedCallback(subPage);
      },
      updateExpand: (index) => set({expand: index}),
      updateLanguage: (language) => set({language}),
      updateEditorFontFamily: (editorFontFamily) => {
        set({editorFontFamily});
        updateUserConfiguration(`{
          "workbench.colorTheme": "${get().isDarkMode ? 'WebGAL Dark' : 'WebGAL White'}",
          "editor.semanticHighlighting.enabled": "configuredByTheme",
          "editor.fontFamily": "${get().editorFontFamily}",
          "editor.fontSize": ${get().editorFontSize},
        }`);
      },
      updateEditorFontSize: (editorFontSize) => {
        set({editorFontSize});
        updateUserConfiguration(`{
          "workbench.colorTheme": "${get().isDarkMode ? 'WebGAL Dark' : 'WebGAL White'}",
          "editor.semanticHighlighting.enabled": "configuredByTheme",
          "editor.fontFamily": "${get().editorFontFamily}",
          "editor.fontSize": ${get().editorFontSize},
        }`);
      },
      updateViewType: (viewType) => set({ viewType }),
      updateSortBy: (sortBy) => set({ sortBy }),
      updateSortOrder: (sortOrder) => set({ sortOrder }),
      updateIisAutoHideToolbar: (isAutoHideToolbar) => set({isAutoHideToolbar}),
      updateIsShowPreview: (isShowPreview) => set({isShowPreview}),
      updateIsEnableLivePreview: (isEnableLivePreview) => set({isEnableLivePreview}),
      updateIsAutoWarp: (isAutoWarp) => set({isAutoWarp}),
      updateIsUseExpFastSync:(isUseExpFastSync)=> set({isUseExpFastSync}),
      updateIsUseFontOptimization: (isUseFontOptimization) => set({ isUseFontOptimization }),
      updateIgnoreVersion: (ignoreVersion) => set({ignoreVersion}),
      updateIsCascaderDelimitersCustomizable: (isCascaderDelimitersCustomizable) => set({isCascaderDelimitersCustomizable}) ,
      updateCascaderDelimiters: (cascaderDelimiters) => set({cascaderDelimiters}),
      updateIsDarkMode: (isDarkMode) => set({ isDarkMode }),
      updateIsUseRealtimeEffect: (isUseRealtimeEffect) => set({ isUseRealtimeEffect }),
    }),
    {
      name: 'editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => !['page', 'subPage', 'expand'].includes(key))),
    },
  ),
);

const useEditorStore = createSelectors(useEditorStoreBase);

export default useEditorStore;
