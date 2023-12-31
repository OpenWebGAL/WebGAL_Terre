import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface UserData {
  // 自动隐藏工具栏
  isAutoHideToolbar: boolean,
  // 实时预览
  isEnableLivePreview: boolean,
  // 显示侧边栏
  isShowSidebar: boolean,

  isWarp: boolean,
}

// 定义初始状态，匹配 UserData 接口
const initialState: UserData = {
  isAutoHideToolbar: false,
  isEnableLivePreview: false,
  isShowSidebar: true,
  isWarp: false,
};

// 创建 userSlice
export const userSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setAutoHideToolbar: (state, action: PayloadAction<boolean>) => {
      state.isAutoHideToolbar = action.payload;
    },
    setEnableLivePreview: (state, action: PayloadAction<boolean>) => {
      state.isEnableLivePreview = action.payload;
    },
    setShowSidebar: (state, action: PayloadAction<boolean>) => {
      state.isShowSidebar = action.payload;
    },
    setIsWarp(state, action: PayloadAction<boolean>) {
      state.isWarp = action.payload;
    }
  },
});

export const {setAutoHideToolbar, setEnableLivePreview, setShowSidebar, setIsWarp} = userSlice.actions;

export default userSlice.reducer;
