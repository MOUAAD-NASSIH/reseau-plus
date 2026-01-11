/**
 * Redux Store Configuration
 * Integrates RTK Query API slice and auth slice for state management.
 */

import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/api";
import authReducer from "./slices/authSlice";
import { messageApi } from "../services/messageService";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, messageApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

