import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import missionReducer from "./slices/missionSlice";
import applicationReducer from "./slices/applicationSlice";
import assignmentReducer from "./slices/assignmentSlice";
import paymentReducer from "./slices/paymentSlice";
import reviewReducer from "./slices/reviewSlice";
import notificationReducer from "./slices/notificationSlice";
import workerReducer from "./slices/workerSlice";
import institutionReducer from "./slices/institutionSlice";
import domainReducer from "./slices/domainSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionReducer,
    applications: applicationReducer,
    assignments: assignmentReducer,
    payments: paymentReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
    workers: workerReducer,
    institutions: institutionReducer,
    domains: domainReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
