import { IViewType, ISortBy, ISortOrder } from "@/components/Assets/Assets";
import { type IPage } from '@/router';
import {IGameEditorState} from "@/types/gameEditor";

export interface IEditorState {
  page: IPage,
  subPage: string,
  expand: number,
  language: 'zhCn' | 'en' | 'ja',
  editorFontFamily: string,
  editorFontSize: number,
  viewType: IViewType,
  sortBy: ISortBy,
  sortOrder: ISortOrder,
  isAutoHideToolbar: boolean, // 是否自动隐藏工具栏
  isShowPreview: boolean, // 是否显示预览窗口
  isEnableLivePreview: boolean, // 是否开启实时预览
  isAutoWarp: boolean, // 是否开启自动换行
  isUseExpFastSync: boolean,
  isUseFontOptimization: boolean,
  ignoreVersion: string, // 忽略版本
  isCascaderDelimitersCustomizable: boolean,
  cascaderDelimiters: string[],
  isDarkMode: boolean,
  isUseRealtimeEffect: boolean, // 是否使用实时效果
  isWindowAdjustment: boolean, // 预览窗口调整功能是否开启
}

export interface IEditorAction {
  updatePage: (editor: IEditorState['page']) => void,
  updateSubPage: (subPage: IEditorState['subPage']) => void,
  updateExpand: (index: IEditorState['expand']) => void,
  updateLanguage: (language: IEditorState['language']) => void,
  updateEditorFontFamily: (editorFontFamily: IEditorState['editorFontFamily']) => void,
  updateEditorFontSize: (editorFontSize: IEditorState['editorFontSize']) => void,
  updateViewType: (viewType: IEditorState['viewType']) => void,
  updateSortBy: (sortBy: IEditorState['sortBy']) => void,
  updateSortOrder: (sortOrder: IEditorState['sortOrder']) => void,
  updateIisAutoHideToolbar: (isAutoHideToolbar: IEditorState['isAutoHideToolbar']) => void,
  updateIsShowPreview: (isShowPreview: IEditorState['isShowPreview']) => void,
  updateIsEnableLivePreview: (isEnableLivePreview: IEditorState['isEnableLivePreview']) => void,
  updateIsAutoWarp: (isAutoWarp: IEditorState['isAutoWarp']) => void,
  updateIsUseExpFastSync: (isUseExpFastSync: IGameEditorState['isShowDebugger']) => void,
  updateIsUseFontOptimization: (isUseFontOptimization: IEditorState['isUseFontOptimization']) => void,
  updateIgnoreVersion: (ignoreVersion: IEditorState['ignoreVersion']) => void,
  updateIsCascaderDelimitersCustomizable: (isCascaderDelimitersCustomizable: IEditorState['isCascaderDelimitersCustomizable']) => void,
  updateCascaderDelimiters: (cascadeDelimiters: IEditorState['cascaderDelimiters']) => void,
  updateIsDarkMode: (isDarkMode: IEditorState['isDarkMode']) => void,
  updateIsUseRealtimeEffect: (isUseRealtimeEffect: IEditorState['isUseRealtimeEffect']) => void,
  updateIsWindowAdjustment: (isWindowAdjustment: IEditorState['isWindowAdjustment']) => void,
}
