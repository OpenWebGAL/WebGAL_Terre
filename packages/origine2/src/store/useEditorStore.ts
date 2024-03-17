import { EditorState, EditorAction } from '@/types/editor';
import createSelectors from '@/utils/createSelectors';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useEditorStoreBase = create<EditorState & EditorAction>()(
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
          Object.entries(state).filter(([key]) => !['editor','currentEdit'].includes(key)),
        ), // editor 和 currentEdit 不持久化
    }
  )
);

const useEditorStore = createSelectors(useEditorStoreBase);

export default useEditorStore;