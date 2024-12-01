import { IPage } from "@/hooks/useHashRoute";
import {IGameEditorState} from "@/types/gameEditor";
import {commandType} from "webgal-parser/src/interface/sceneInterface";

interface IEditorShortCutsConfig {
  // 快捷键，暂时用string储存
  shortcuts: string
}

export interface IAddSentenceShortCutsConfig extends IEditorShortCutsConfig {
  type: commandType | "custom",
  initialText?: string;
}

export interface IEditorState {
  page: IPage,
  subPage: string,
  expand: number,
  language: 'zhCn' | 'en' | 'ja',
  editorFontFamily: string,
  editorFontSize: number,
  isAutoHideToolbar: boolean, // 是否自动隐藏工具栏
  isEnableLivePreview: boolean, // 是否开启实时预览
  isAutoWarp: boolean, // 是否开启自动换行
  isUseExpFastSync: boolean,
  ignoreVersion: string, // 忽略版本

  // 添加语句快捷键设置
  addSentenceShortCuts: IAddSentenceShortCutsConfig[],
}

export interface IEditorAction {
  updatePage: (editor: IEditorState['page']) => void,
  updateSubPage: (subPage: IEditorState['subPage']) => void,
  updateExpand: (index: IEditorState['expand']) => void,
  updateLanguage: (language: IEditorState['language']) => void,
  updateEditorFontFamily: (editorFontFamily: IEditorState['editorFontFamily']) => void,
  updateEditorFontSize: (editorFontSize: IEditorState['editorFontSize']) => void,
  updateIisAutoHideToolbar: (isAutoHideToolbar: IEditorState['isAutoHideToolbar']) => void,
  updateIsEnableLivePreview: (isEnableLivePreview: IEditorState['isEnableLivePreview']) => void,
  updateIsAutoWarp: (isAutoWarp: IEditorState['isAutoWarp']) => void,
  updateIsUseExpFastSync: (isUseExpFastSync: IGameEditorState['isShowDebugger']) => void,
  updateIgnoreVersion: (ignoreVersion: IEditorState['ignoreVersion']) => void,
  updateAddSentenceConfig: (config: IEditorState['addSentenceShortCuts']) => void,
}
