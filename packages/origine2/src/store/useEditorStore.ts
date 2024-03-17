import { IEditorState, IEditorAction } from '@/types/editor';
import createSelectors from '@/utils/createSelectors';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useEditorStoreBase = create<IEditorState & IEditorAction>()(
  persist(
    (set) => ({
      editor: null,
      currentEdit: '',
      expand: 0,
      language: 'zhCn',
      isAutoHideToolbar: false,
      isEnableLivePreview: false,
      isAutoWarp: false,
      updateEditor: (editor) => set({editor}),
      updateCurrentEdit: (currentEdit) => set({currentEdit}),
      updateExpand: (index) => set({expand: index}),
      updateLanguage: (language) => set({language}),
      updateIisAutoHideToolbar: (isAutoHideToolbar) => set({isAutoHideToolbar}),
      updateIsEnableLivePreview: (isEnableLivePreview) => set({isEnableLivePreview}),
      updateIsAutoWarp: (isAutoWarp) => set({isAutoWarp}),
    }),
    {
      name: 'editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['editor','currentEdit','expand'].includes(key)),
        ),
    }
  )
);

const useEditorStore = createSelectors(useEditorStoreBase);

export default useEditorStore;