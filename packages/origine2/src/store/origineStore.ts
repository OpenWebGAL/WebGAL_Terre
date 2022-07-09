import { configureStore } from "@reduxjs/toolkit";
import statusReducer from "./statusReducer";

export const origineStore = configureStore({
  reducer: {
    status: statusReducer,
  }
});

// 在 TS 中的类型声明
export type RootState = ReturnType<typeof origineStore.getState>;
