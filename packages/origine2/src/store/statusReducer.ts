import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

const dashboardInitState = {
  showDashBoard: true
};

export enum sidebarTag {
  none,
  gameconfig,
  assets,
  scenes
}
export enum language {
  zhCn,
  en,
  jp,
}

export interface ITag {
  // tag显示的名称
  tagName: string,
  tagType: "scene" | "asset",
  // 唯一，Tag 指向的文件
  tagTarget: string
}

interface IEditorState {
  currentEditingGame: string,
  isEnableLivePreview:boolean,
  showPreview: boolean,
  currentSidebarTag: sidebarTag
  tags: Array<ITag>,
  selectedTagTarget: string,
  isCodeMode: boolean,
  language: language
}

// tag的假数据，用于测试
// const mockTags: Array<ITag> = [
//   { tagName: "start.txt", tagType: "scene", tagTarget: "scene/start.txt" },
//   { tagName: "start2.txt", tagType: "scene", tagTarget: "scene/start2.txt" },
//   { tagName: "start3.txt", tagType: "scene", tagTarget: "scene/start3.txt" },
//   { tagName: "start4.txt", tagType: "scene", tagTarget: "scene/start4.txt" }
// ];

export const editorInitState: IEditorState = {
  currentEditingGame: "",
  isEnableLivePreview:false,
  showPreview: true,
  currentSidebarTag: sidebarTag.gameconfig,
  tags: [],
  selectedTagTarget: "",
  isCodeMode: (localStorage.getItem("isCodeMode") ?? "") === "true",
  language: language.zhCn
};

const initialState = {
  dashboard: cloneDeep(dashboardInitState),
  editor: cloneDeep(editorInitState)
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    /**
     * 设置是否显示 DashBoard
     * @param state
     * @param action
     */
    setDashboardShow: function (state, action: PayloadAction<boolean>) {
      state.dashboard.showDashBoard = action.payload;
    },
    /**
     * 设置正在编辑的游戏
     * @param state
     * @param action
     */
    setEditingGame: function (state, action: PayloadAction<string>) {
      state.editor.currentEditingGame = action.payload;
    },
    /**
     * 设置是否显示预览
     * @param state
     * @param action
     */
    setEditorPreviewShow: function (state, action: PayloadAction<boolean>) {
      state.editor.showPreview = action.payload;
    },
    /**
     * 设置现实的 sidebar Tag
     * @param state
     * @param action
     */
    setEditorSidebarTag: function (state, action: PayloadAction<sidebarTag>) {
      state.editor.currentSidebarTag = action.payload;
    },
    /**
     * 重设编辑区域标签的顺序
     * @param state
     * @param action
     */
    resetTagOrder: function (state, action: PayloadAction<Array<ITag>>) {
      state.editor.tags = action.payload;
    },
    /**
     * 设置编辑区域打开的标签页
     * @param state
     * @param action
     */
    setCurrentTagTarget: function (state, action: PayloadAction<string>) {
      state.editor.selectedTagTarget = action.payload;
    },
    /**
     * 添加编辑页 Tag
     * @param state
     * @param action
     */
    addEditAreaTag: function (state, action: PayloadAction<ITag>) {
      state.editor.tags.push(action.payload);
    },
    /**
     * 设置是否是 code 模式
     * @param state
     * @param action
     */
    setEditMode: function (state, action: PayloadAction<boolean>) {
      localStorage.setItem("isCodeMode", action.payload.toString());
      state.editor.isCodeMode = action.payload;
    },
    /**
     * 设置语言
     * @param state
     * @param action
     */
    setLanguage: (state, action: PayloadAction<language>) => {
      state.editor.language = action.payload;
      window?.localStorage?.setItem('editor-lang', action.payload.toString());
    },

    setIsLivePreview:(state,action:PayloadAction<boolean>)=>{
      state.editor.isEnableLivePreview = action.payload;
    }

  }
});

export const {
  setDashboardShow,
  setEditingGame,
  setEditorPreviewShow,
  setEditorSidebarTag,
  resetTagOrder,
  setCurrentTagTarget,
  setEditMode,
  setLanguage,
  setIsLivePreview
} = statusSlice.actions;

export const statusActions = statusSlice.actions;

export default statusSlice.reducer;
