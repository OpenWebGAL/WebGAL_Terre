export interface IFileTab {
  name: string,
  type: 'asset' | 'scene',
  path: string,
}
export type IGameEditorSidebarTabs = 'asset' | 'scene';
export type IGameEditorTopbarTabs = 'config' | 'view' | 'settings' | 'help' | 'export' | 'addSentence';

export interface IGameEditorState {
  fileTabs: IFileTab[],
  currentFileTab: IFileTab | null,
  currentSidebarTab: IGameEditorSidebarTabs,
  currentTopbarTab: IGameEditorTopbarTabs | null,
  isShowSidebar: boolean,
  isCodeMode: boolean,
  isShowDebugger: boolean,
}

export interface IGameEditorAction {
  updateFileTabs: (fileTabs: IGameEditorState['fileTabs']) => void,
  addFileTab: (fileTab: IFileTab) => void,
  removeFileTab: (fileTab: IFileTab) => void,
  updateCurrentFileTab: (currentFileTab: IGameEditorState['currentFileTab']) => void,
  updateCurrentSidebarTab: (sidebarTab: IGameEditorState['currentSidebarTab']) => void,
  updateCurrentTopbarTab: (currentTopbarTab: IGameEditorState['currentTopbarTab']) => void,
  updateIsShowSidebar: (isShowSidebar: IGameEditorState['isShowSidebar']) => void,
  updateIsCodeMode: (isCodeMode: IGameEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: IGameEditorState['isShowDebugger']) => void,
}