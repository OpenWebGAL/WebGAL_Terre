import { IClassNode } from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree";

export interface ITemplateEditorState {
  currentClassNode: IClassNode & { path: string } | null,
  isCodeMode: boolean,
  isShowDebugger: boolean,
  sidebarWidth: number,
  componentTreeHeight: number,
  previewHeight: number,
}

export interface ITemplateEditorAction {
  updateCurrentClassNode: (currentClassNode: ITemplateEditorState['currentClassNode']) => void,
  updateIsCodeMode: (isCodeMode: ITemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: ITemplateEditorState['isShowDebugger']) => void,
  updateSidebarWidth: (sidebarWidth: ITemplateEditorState['sidebarWidth']) => void,
  updateComponentTreeHeight: (componentTreeheight: ITemplateEditorState['componentTreeHeight']) => void,
  updatePreviewHeight: (previewHeight: ITemplateEditorState['previewHeight']) => void,
}