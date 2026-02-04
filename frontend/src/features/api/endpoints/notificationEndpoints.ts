/**
 * Notification Endpoints Module
 * RTK Query endpoints for notification operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type { Notification, NotificationFilters } from "@/types/notification.types";

/**
 * Unread count response type
 */
export interface UnreadCountResponse {
    count: number;
}

/**
 * Build query params object from filters
 */
const buildParams = (filters?: NotificationFilters): Record<string, string> | undefined => {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    });
    return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Notification API endpoints injected into the main API slice
 */
export const notificationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get all notifications for current user
         * Provides tags for cache identification
         */
        getNotifications: builder.query<ApiResponse<Notification[]>, NotificationFilters | void>({
            query: (filters) => ({
                url: "/notifications",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Notifications" as const,
                            id,
                        })),
                        { type: "Notifications", id: "LIST" },
                    ]
                    : [{ type: "Notifications", id: "LIST" }],
        }),

        /**
         * Get unread notification count
         * Configured with polling for real-time updates
         * Note: Polling is configured at the hook usage level with pollingInterval option
         */
        getUnreadNotificationCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
            query: () => ({ url: "/notifications/unread-count" }),
            providesTags: [{ type: "Notifications", id: "UNREAD_COUNT" }],
        }),

        /**
         * Mark a single notification as read
         * Invalidates notification lists and unread count
         */
        markAsRead: builder.mutation<ApiResponse<Notification>, number>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PUT",
            }),
            invalidatesTags: (_, __, id) => [
                { type: "Notifications", id },
                { type: "Notifications", id: "LIST" },
                { type: "Notifications", id: "UNREAD_COUNT" },
            ],
        }),

        /**
         * Mark all notifications as read
         * Invalidates all notification caches
         */
        markAllAsRead: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: "/notifications/read-all",
                method: "PUT",
            }),
            invalidatesTags: [
                { type: "Notifications", id: "LIST" },
                { type: "Notifications", id: "UNREAD_COUNT" },
            ],
        }),

        /**
         * Delete a notification
         * Invalidates notification caches
         */
        deleteNotification: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [
                { type: "Notifications", id },
                { type: "Notifications", id: "LIST" },
                { type: "Notifications", id: "UNREAD_COUNT" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for notification endpoints
 * Export for use in components
 * 
 * Note: For polling on unread count, use:
 * useGetUnreadNotificationCountQuery(undefined, { pollingInterval: 30000 })
 */
export const {
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} = notificationApi;

