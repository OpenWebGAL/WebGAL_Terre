import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  showDashBoard: true
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setDashboardShow: function(state, action: PayloadAction<boolean>) {
      state.showDashBoard = action.payload;
    }
  }
});

export const { setDashboardShow } = statusSlice.actions;

export default statusSlice.reducer;
