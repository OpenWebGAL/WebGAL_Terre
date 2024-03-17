export interface IEditorState {
  editor: 'game' | 'template' | null,
  currentEdit: string,
  expand: number,
  language: 'zhCn' | 'en' | 'jp',
  isAutoHideToolbar: boolean, // 是否自动隐藏工具栏
  isEnableLivePreview: boolean, // 是否开启实时预览
  isAutoWarp: boolean, // 是否开启自动换行
}

export interface IEditorAction {
  updateEditor: (editor: IEditorState['editor']) => void,
  updateCurrentEdit: (currentEdit: IEditorState['currentEdit']) => void,
  updateExpand: (index: IEditorState['expand']) => void,
  updateLanguage: (language: IEditorState['language']) => void,
  updateIisAutoHideToolbar: (isAutoHideToolbar: IEditorState['isAutoHideToolbar']) => void,
  updateIsEnableLivePreview: (isEnableLivePreview: IEditorState['isEnableLivePreview']) => void,
  updateIsAutoWarp: (isAutoWarp: IEditorState['isAutoWarp']) => void,
}