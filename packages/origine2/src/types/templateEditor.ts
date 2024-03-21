export type ITemplateEditorTopbarTabs = 'config' | 'view' | 'settings' | 'help'
export interface ITemplateEditorState {
  currentTopbarTab: ITemplateEditorTopbarTabs | null,
  isCodeMode: boolean,
  isShowDebugger: boolean,
  sidebarWidth: number,
  uiTreeHeight: number,
  editorHeight: number,
}

export interface ITemplateEditorAction {
  updateCurrentTopbarTab: (currentTopbarTab: ITemplateEditorState['currentTopbarTab']) => void,
  updateIsCodeMode: (isCodeMode: ITemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: ITemplateEditorState['isShowDebugger']) => void,
  updateSidebarWidth: (sidebarWidth: ITemplateEditorState['sidebarWidth']) => void,
  updateUiTreeHeight: (uiTreeheight: ITemplateEditorState['uiTreeHeight']) => void,
  updateEditorHeight: (editorHeight: ITemplateEditorState['editorHeight']) => void,
}