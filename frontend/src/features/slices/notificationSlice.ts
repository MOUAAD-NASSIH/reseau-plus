/**
 * Notification Slice
 * Redux state management for notifications with unread count tracking
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notificationService } from "../services/notificationService";
import type { PaginationMeta } from "@/types/api.types";
import type { Notification, NotificationFilters } from "@/types/notification.types";

// -------------------- STATE INTERFACE --------------------
export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch all notifications
export const fetchNotifications = createAsyncThunk<
    { notifications: Notification[]; pagination?: PaginationMeta },
    NotificationFilters | undefined,
    { rejectValue: string }
>("notifications/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await notificationService.getAll(filters);
        return {
            notifications: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk<
    number,
    void,
    { rejectValue: string }
>("notifications/fetchUnreadCount", async (_, thunkAPI) => {
    try {
        const response = await notificationService.getUnreadCount();
        return response.data?.count || 0;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Mark single notification as read
export const markNotificationAsRead = createAsyncThunk<
    Notification,
    number,
    { rejectValue: string }
>("notifications/markAsRead", async (id, thunkAPI) => {
    try {
        const response = await notificationService.markAsRead(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("notifications/markAllAsRead", async (_, thunkAPI) => {
    try {
        await notificationService.markAllAsRead();
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Delete notification
export const deleteNotification = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("notifications/delete", async (id, thunkAPI) => {
    try {
        await notificationService.delete(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- HELPER FUNCTION --------------------
const calculateUnreadCount = (notifications: Notification[]): number => {
    return notifications.filter(n => !n.isRead).length;
};

// -------------------- SLICE --------------------
export const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotificationError(state) {
            state.error = null;
        },
        // Optimistic update for real-time notifications
        addNotification(state, action: { payload: Notification }) {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH ALL ----------
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications;
                state.pagination = action.payload.pagination || null;
                // Calculate unread count from notifications
                state.unreadCount = calculateUnreadCount(action.payload.notifications);
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch notifications";
            })

            // ---------- FETCH UNREAD COUNT ----------
            .addCase(fetchUnreadCount.pending, (state) => {
                // Don't set isLoading for background count fetch
                state.error = null;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch unread count";
            })

            // ---------- MARK AS READ ----------
            .addCase(markNotificationAsRead.pending, (state) => {
                state.error = null;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n.id === action.payload.id);
                if (index !== -1) {
                    const wasUnread = !state.notifications[index].isRead;
                    state.notifications[index] = action.payload;
                    // Decrease unread count if notification was previously unread
                    if (wasUnread && action.payload.isRead) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload || "Failed to mark notification as read";
            })

            // ---------- MARK ALL AS READ ----------
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.isLoading = false;
                // Mark all notifications as read
                state.notifications = state.notifications.map(n => ({
                    ...n,
                    isRead: true,
                }));
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to mark all as read";
            })

            // ---------- DELETE ----------
            .addCase(deleteNotification.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n.id !== action.payload);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.error = action.payload || "Failed to delete notification";
            });
    },
});

export const { clearNotificationError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
