import type {
  ApplyStyleIgnoredPayload,
  UiPreviewMode,
  UiPseudoState,
  UiScreenId,
  UiScreenUpdatedPayload,
} from '@webgal/editor-preview-protocol';

export interface ITab {
  name: string,
  path: string,
  class?: string,
}

export type TemplateStyleTab = 'simple' | 'full';
export type TemplateFullCssMode = 'graphical' | 'code';

export interface ITemplateEditorState {
  tabs: ITab[],
  currentTab: ITab | null,
  expandNode: string[],
  isCodeMode: boolean,
  isShowDebugger: boolean,
  sidebarWidth: number,
  templateActionsHeight: number,
  componentTreeHeight: number,
  previewHeight: number,
  previewMode: UiPreviewMode,
  useMockData: boolean,
  styleTab: TemplateStyleTab,
  fullCssMode: TemplateFullCssMode,
  isStyleCollapsed: boolean,
  activeScreenId: UiScreenId | null,
  isPreviewReady: boolean,
  screenPayload: UiScreenUpdatedPayload | null,
  draftScssText: string,
  selectedPartId: string | null,
  lockedState: UiPseudoState,
  applyStyleIgnored: ApplyStyleIgnoredPayload | null,
}

export interface ITemplateEditorAction {
  updateTabs: (tabs: ITemplateEditorState['tabs']) => void,
  updateCurrentTab: (currentTab: ITemplateEditorState['currentTab']) => void,
  updateExpandNode: (expandNode: ITemplateEditorState['expandNode']) => void,
  updateIsCodeMode: (isCodeMode: ITemplateEditorState['isCodeMode']) => void,
  updateIsShowDebugger: (isShowDebugger: ITemplateEditorState['isShowDebugger']) => void,
  updateSidebarWidth: (sidebarWidth: ITemplateEditorState['sidebarWidth']) => void,
  updateTemplateActionsHeight: (templateActionsHeight: ITemplateEditorState['templateActionsHeight']) => void,
  updateComponentTreeHeight: (componentTreeheight: ITemplateEditorState['componentTreeHeight']) => void,
  updatePreviewHeight: (previewHeight: ITemplateEditorState['previewHeight']) => void,
  updatePreviewMode: (previewMode: ITemplateEditorState['previewMode']) => void,
  updateUseMockData: (useMockData: ITemplateEditorState['useMockData']) => void,
  updateStyleTab: (styleTab: ITemplateEditorState['styleTab']) => void,
  updateFullCssMode: (fullCssMode: ITemplateEditorState['fullCssMode']) => void,
  updateIsStyleCollapsed: (isStyleCollapsed: ITemplateEditorState['isStyleCollapsed']) => void,
  updateActiveScreenId: (activeScreenId: ITemplateEditorState['activeScreenId']) => void,
  updateIsPreviewReady: (isPreviewReady: ITemplateEditorState['isPreviewReady']) => void,
  updateScreenPayload: (screenPayload: ITemplateEditorState['screenPayload']) => void,
  updateDraftScssText: (draftScssText: ITemplateEditorState['draftScssText']) => void,
  updateSelectedPartId: (selectedPartId: ITemplateEditorState['selectedPartId']) => void,
  updateLockedState: (lockedState: ITemplateEditorState['lockedState']) => void,
  updateApplyStyleIgnored: (applyStyleIgnored: ITemplateEditorState['applyStyleIgnored']) => void,
}
