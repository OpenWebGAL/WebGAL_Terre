export interface ITag {
  name: string,
  type: 'asset' | 'scene',
  path: string,
}
export type IGameEditorSidebarTabs = 'asset' | 'scene';
export type IGameEditorTopbarTabs = 'config' | 'view' | 'settings' | 'help' | 'export' | 'addSentence';

export interface IGameEditorState {
  tags: ITag[],
  currentTag: ITag | null,
  currentSidebarTab: IGameEditorSidebarTabs,
  currentTopbarTab: IGameEditorTopbarTabs | null,
  isShowSidebar: boolean,
  isCodeMode: boolean,
  isShowDebugger: boolean,
}

export interface IGameEditorAction {
  updateTags: (tags: IGameEditorState['tags']) => void,
  addTag: (tag: ITag) => void,
  removeTag: (tag: ITag) => void,
  updateCurrentTag: (currentTag: IGameEditorState['currentTag']) => void,
  updateCurrentSidebarTab: (sidebarTab: IGameEditorState['currentSidebarTab']) => void,
  updateCurrentTopbarTab: (currentTopbarTab: IGameEditorState['currentTopbarTab']) => void,
  updateIsShowSidebar: (isShowSidebar: IGameEditorState['isShowSidebar']) => void,
  updateIsCodeMode: (isCodeMode: IGameEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: IGameEditorState['isShowDebugger']) => void,
}