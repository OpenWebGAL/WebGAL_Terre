import { IPage } from "@/hooks/useHashRoute";
import {IGameEditorState} from "@/types/gameEditor";

export interface IEditorState {
  page: IPage,
  subPage: string,
  expand: number,
  language: 'zhCn' | 'en' | 'ja',
  isAutoHideToolbar: boolean, // 是否自动隐藏工具栏
  isEnableLivePreview: boolean, // 是否开启实时预览
  isAutoWarp: boolean, // 是否开启自动换行
  isUseExpFastSync: boolean,
  ignoreVersion: string, // 忽略版本
}

export interface IEditorAction {
  updatePage: (editor: IEditorState['page']) => void,
  updateSubPage: (subPage: IEditorState['subPage']) => void,
  updateExpand: (index: IEditorState['expand']) => void,
  updateLanguage: (language: IEditorState['language']) => void,
  updateIisAutoHideToolbar: (isAutoHideToolbar: IEditorState['isAutoHideToolbar']) => void,
  updateIsEnableLivePreview: (isEnableLivePreview: IEditorState['isEnableLivePreview']) => void,
  updateIsAutoWarp: (isAutoWarp: IEditorState['isAutoWarp']) => void,
  updateIsUseExpFastSync: (isUseExpFastSync: IGameEditorState['isShowDebugger']) => void,
  updateIgnoreVersion: (ignoreVersion: IEditorState['ignoreVersion']) => void,
}
