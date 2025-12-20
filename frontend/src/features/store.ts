import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themethemeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themethemeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
