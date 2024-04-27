import { IEditorState, IEditorAction } from '@/types/editor';
import createSelectors from '@/utils/createSelectors';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

let subPageChangedCallback: (subPage: string) => void = () => {};

export const registerSubPageChangedCallback = (callback: (subPage: string) => void) => {
  subPageChangedCallback = callback;
};

const useEditorStoreBase = create<IEditorState & IEditorAction>()(
  persist(
    (set) => ({
      page: 'dashboard',
      subPage: '',
      expand: 0,
      language: 'zhCn',
      isAutoHideToolbar: false,
      isEnableLivePreview: false,
      isAutoWarp: false,
      updatePage: (page) => set({ page }),
      updateSubPage: (subPage) => {
        subPageChangedCallback(subPage);
        set({ subPage });
      },
      updateExpand: (index) => set({ expand: index }),
      updateLanguage: (language) => set({ language }),
      updateIisAutoHideToolbar: (isAutoHideToolbar) => set({ isAutoHideToolbar }),
      updateIsEnableLivePreview: (isEnableLivePreview) => set({ isEnableLivePreview }),
      updateIsAutoWarp: (isAutoWarp) => set({ isAutoWarp }),
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
