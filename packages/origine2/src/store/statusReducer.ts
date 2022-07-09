import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const dashboardInitState = {
  showDashBoard: true
};

export enum sidebarTag {
  none,
  gameconfig,
  assets,
  scenes
}

const editorInitState = {
  currentEditingGame: "",
  showPreview: true,
  currentSidebarTag: sidebarTag.gameconfig
};

const initialState = {
  dashboard: dashboardInitState,
  editor: editorInitState
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setDashboardShow: function(state, action: PayloadAction<boolean>) {
      state.dashboard.showDashBoard = action.payload;
    },
    setEditingGame: function(state, action: PayloadAction<string>) {
      state.editor.currentEditingGame = action.payload;
    },
    setEditorPreviewShow: function(state, action: PayloadAction<boolean>) {
      state.editor.showPreview = action.payload;
    },
    setEditorSidebarTag: function(state, action: PayloadAction<sidebarTag>) {
      state.editor.currentSidebarTag = action.payload;
    }
  }
});

export const { setDashboardShow, setEditingGame, setEditorPreviewShow, setEditorSidebarTag } = statusSlice.actions;

export default statusSlice.reducer;
