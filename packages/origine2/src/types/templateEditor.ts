export type ITemplateEditorTopbarTabs = 'config' | 'view' | 'settings' | 'help'
export interface ITemplateEditorState {
  currentTopbarTab: ITemplateEditorTopbarTabs | null,
  isCodeMode: boolean,
  isShowDebugger: boolean,
}

export interface ITemplateEditorAction {
  updateCurrentTopbarTab: (currentTopbarTab: ITemplateEditorState['currentTopbarTab']) => void,
  updateIsCodeMode: (isCodeMode: ITemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: ITemplateEditorState['isShowDebugger']) => void,
}