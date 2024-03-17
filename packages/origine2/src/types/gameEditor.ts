export interface FileTab {
  tabName: string,
  tabType: 'asset' | 'scene',
  tabPath: string,
}
export type SidebarTabs = 'asset' | 'scene';
export type TopbarTabs = 'config' | 'view' | 'settings' | 'help' | 'export' | 'addSentence'

export interface GameEditorState {
  fileTabs: FileTab[],
  currentFileTab: FileTab | null,
  currentSidebarTab: SidebarTabs,
  currentTopbarTab: TopbarTabs | null,
  isShowSidebar: boolean,
  isCodeMode: boolean,
  isShowDebugger: boolean,
}

export interface GameEditorAction {
  updateFileTabs: (fileTabs: FileTab[]) => void,
  addFileTab: (fileTab: FileTab) => void,
  removeFileTab: (fileTab: FileTab) => void,
  updateCurrentFileTab: (currentFileTab: FileTab) => void,
  updateCurrentSidebarTab: (sidebarTab: GameEditorState['currentSidebarTab']) => void,
  updateCurrentTopbarTab: (currentTopbarTab: GameEditorState['currentTopbarTab']) => void,
  updateIsShowSidebar: (isShowSidebar: GameEditorState['isShowSidebar']) => void,
  updateIsCodeMode: (isCodeMode: GameEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: GameEditorState['isShowDebugger']) => void,
}