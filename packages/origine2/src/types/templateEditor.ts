export type TopbarTabs = 'config' | 'view' | 'settings' | 'help'
export interface TemplateEditorState {
  currentTopbarTab: TopbarTabs | null,
  isCodeMode: boolean,
  isShowDebugger: boolean,
}

export interface TemplateEditorAction {
  updateCurrentTopbarTab: (currentTopbarTab: TemplateEditorState['currentTopbarTab']) => void,
  updateIsCodeMode: (isCodeMode: TemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: TemplateEditorState['isShowDebugger']) => void,
}