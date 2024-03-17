export interface EditorState {
  editor: 'game' | 'template' | null,
  currentEdit: string,
  expand: number,
  language: 'zhCn' | 'en' | 'jp',
  isAutoHideToolbar: boolean, // 是否自动隐藏工具栏
  isEnableLivePreview: boolean, // 是否开启实时预览
  isAutoWarp: boolean, // 是否开启自动换行
}

export interface EditorAction {
  updateEditor: (editor: EditorState['editor']) => void,
  updateCurrentEdit: (currentEdit: EditorState['currentEdit']) => void,
  updateExpand: (index: EditorState['expand']) => void,
  updateLanguage: (language: EditorState['language']) => void,
  updateIisAutoHideToolbar: (isAutoHideToolbar: EditorState['isAutoHideToolbar']) => void,
  updateIsEnableLivePreview: (isEnableLivePreview: EditorState['isEnableLivePreview']) => void,
  updateIsAutoWarp: (isAutoWarp: EditorState['isAutoWarp']) => void,
}