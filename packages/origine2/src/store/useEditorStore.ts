import {
  IEditorState,
  IEditorAction,
  IAddSentenceShortCutsConfig,
  ISentenceShortCutsConfig,
  SentenceActionType, SentenceLayerType
} from '@/types/editor';
import createSelectors from '@/utils/createSelectors';
import { updateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {commandType} from "webgal-parser/src/interface/sceneInterface";

let subPageChangedCallback: (subPage: string) => void = () => {};

export const registerSubPageChangedCallback = (callback: (subPage: string) => void) => {
  subPageChangedCallback = callback;
};

const defaultAddSentenceShortCuts: IAddSentenceShortCutsConfig[] = [
  {
    "shortcuts": "S",
    "type": commandType.say,
  },
  {
    "shortcuts": "F",
    "type": commandType.changeFigure,
  },
  {
    "shortcuts": "C",
    "type": "custom",
    "initialText": "changeFigure:stand.png -left -next;"
  }
];

const defaultSentenceShortCuts: ISentenceShortCutsConfig[] = [
  {
    "shortcuts": "Ctrl+Enter",
    "action": SentenceActionType.run_sentence,
    "layers": [SentenceLayerType.INNER, SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Alt+Enter",
    "action": SentenceActionType.insert_sentence,
    "layers": [SentenceLayerType.INNER, SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Shift+Enter",
    "action": SentenceActionType.move_to_down_or_insert,
    "layers": [SentenceLayerType.INNER, SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Ctrl+C",
    "action": SentenceActionType.copy_sentence,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Ctrl+V",
    "action": SentenceActionType.paste_sentence,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Ctrl+D",
    "action": SentenceActionType.copy_sentence_and_insert,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Delete",
    "action": SentenceActionType.delete_sentence,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Ctrl+Shift+ArrowDown",
    "action": SentenceActionType.warp_with_down,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "Ctrl+Shift+ArrowUp",
    "action": SentenceActionType.warp_with_up,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "ArrowDown",
    "action": SentenceActionType.move_to_down,
    "layers": [SentenceLayerType.OUTER],
  },
  {
    "shortcuts": "ArrowUp",
    "action": SentenceActionType.move_to_up,
    "layers": [SentenceLayerType.OUTER],
  },
];

const useEditorStoreBase = create<IEditorState & IEditorAction>()(
  persist(
    (set, get) => ({
      page: 'dashboard',
      subPage: '',
      expand: 0,
      language: 'zhCn',
      editorFontFamily: "Consolas, 'Courier New', monospace",
      editorFontSize: 14,
      isAutoHideToolbar: false,
      isEnableLivePreview: false,
      isAutoWarp: false,
      isUseExpFastSync:false,
      ignoreVersion: '',
      addSentenceShortCuts: defaultAddSentenceShortCuts,
      sentenceShortCuts: defaultSentenceShortCuts,
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
          "workbench.colorTheme": "WebGAL White",
          "editor.semanticHighlighting.enabled": "configuredByTheme",
          "editor.fontFamily": "${get().editorFontFamily}",
          "editor.fontSize": ${get().editorFontSize},
        }`);
      },
      updateEditorFontSize: (editorFontSize) => {
        set({editorFontSize});
        updateUserConfiguration(`{
          "workbench.colorTheme": "WebGAL White",
          "editor.semanticHighlighting.enabled": "configuredByTheme",
          "editor.fontFamily": "${get().editorFontFamily}",
          "editor.fontSize": ${get().editorFontSize},
        }`);
      },
      updateIisAutoHideToolbar: (isAutoHideToolbar) => set({isAutoHideToolbar}),
      updateIsEnableLivePreview: (isEnableLivePreview) => set({isEnableLivePreview}),
      updateIsAutoWarp: (isAutoWarp) => set({isAutoWarp}),
      updateIsUseExpFastSync:(isUseExpFastSync)=> set({isUseExpFastSync}),
      updateIgnoreVersion: (ignoreVersion) => set({ignoreVersion}),
      updateAddSentenceConfig: (addSentenceShortCuts) => set({addSentenceShortCuts}),
      updateSentenceConfig: (sentenceShortCuts) => set({sentenceShortCuts}),
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
