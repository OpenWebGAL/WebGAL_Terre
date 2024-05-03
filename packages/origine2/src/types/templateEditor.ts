export interface ITab {
  name: string,
  path: string,
  class?: string,
}

export interface ITemplateEditorState {
  tabs: ITab[],
  currentTab: ITab | null,
  expandNode: string[],
  isCodeMode: boolean,
  isShowDebugger: boolean,
  sidebarWidth: number,
  componentTreeHeight: number,
  previewHeight: number,
}

export interface ITemplateEditorAction {
  updateTabs: (tabs: ITemplateEditorState['tabs']) => void,
  updateCurrentTab: (currentTab: ITemplateEditorState['currentTab']) => void,
  updateExpandNode: (expandNode: ITemplateEditorState['expandNode']) => void,
  updateIsCodeMode: (isCodeMode: ITemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: ITemplateEditorState['isShowDebugger']) => void,
  updateSidebarWidth: (sidebarWidth: ITemplateEditorState['sidebarWidth']) => void,
  updateComponentTreeHeight: (componentTreeheight: ITemplateEditorState['componentTreeHeight']) => void,
  updatePreviewHeight: (previewHeight: ITemplateEditorState['previewHeight']) => void,
}