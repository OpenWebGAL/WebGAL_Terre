import {configureStore} from "@reduxjs/toolkit";
import statusReducer from "./statusReducer";
import userDataReducer from "@/store/userDataReducer";
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from 'redux-persist';

const userDataPersistConfig = {
  key: 'userData',
  storage,
};

const persistedUserDataReducer = persistReducer(userDataPersistConfig, userDataReducer);

export const origineStore = configureStore({
  reducer: {
    status: statusReducer,
    userData: persistedUserDataReducer
  }, middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 禁用序列化检查
    }),
});

// 在 TS 中的类型声明
export type RootState = ReturnType<typeof origineStore.getState>;
export const persistor = persistStore(origineStore);
