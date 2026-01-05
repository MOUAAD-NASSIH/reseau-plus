/**
 * Notification Service
 * API service for notification operations
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Notification, NotificationFilters } from "@/types/notification.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: NotificationFilters): string => {
    if (!filters) return "";
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
};

/**
 * Unread count response
 */
interface UnreadCountResponse {
    count: number;
}

export const notificationService = {
    /**
     * Get all notifications for current user
     */
    getAll: async (filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> => {
        const response = await api.get<ApiResponse<Notification[]>>(
            `/notifications${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
        const response = await api.get<ApiResponse<UnreadCountResponse>>(
            "/notifications/unread-count"
        );
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
        const response = await api.put<ApiResponse<Notification>>(
            `/notifications/${id}/read`
        );
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        const response = await api.put<ApiResponse<void>>("/notifications/read-all");
        return response.data;
    },

    /**
     * Delete a notification
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
        return response.data;
    },
};
