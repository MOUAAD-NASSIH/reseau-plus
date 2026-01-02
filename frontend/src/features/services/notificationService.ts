/**
 * Notification Service
 * API service for notification operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.get<ApiResponse<Notification[]>>(
                `/notifications${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch notifications";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching notifications");
            throw new Error("Unknown error fetching notifications");
        }
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
        try {
            const response = await api.get<ApiResponse<UnreadCountResponse>>(
                "/notifications/unread-count"
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch unread count";
                // Don't show toast for unread count errors (background operation)
                throw new Error(message);
            }
            throw new Error("Unknown error fetching unread count");
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
        try {
            const response = await api.put<ApiResponse<Notification>>(
                `/notifications/${id}/read`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to mark notification as read";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error marking notification as read");
            throw new Error("Unknown error marking notification as read");
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        try {
            const response = await api.put<ApiResponse<void>>("/notifications/read-all");
            toast.success("All notifications marked as read");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to mark all as read";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error marking all as read");
            throw new Error("Unknown error marking all as read");
        }
    },

    /**
     * Delete a notification
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to delete notification";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error deleting notification");
            throw new Error("Unknown error deleting notification");
        }
    },
};
