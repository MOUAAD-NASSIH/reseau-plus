/**
 * Notification Hooks
 * React Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import type { Notification, NotificationFilters } from "@/types/notification.types";
import type { ApiResponse } from "@/types/api.types";

// Unread count response type
interface UnreadCountResponse {
    count: number;
}

// Query keys
export const notificationKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationKeys.all, "list"] as const,
    list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
    unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

/**
 * Hook to get all notifications for current user
 */
export function useNotifications(filters?: NotificationFilters) {
    return useQuery({
        queryKey: notificationKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Notification[]>> => {
            return notificationService.getAll(filters);
        },
    });
}

/**
 * Hook to get unread notification count
 * Polls every 30 seconds for real-time updates
 */
export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: async (): Promise<ApiResponse<UnreadCountResponse>> => {
            return notificationService.getUnreadCount();
        },
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000, // Consider stale after 10 seconds
    });
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<Notification>> => {
            return notificationService.markAsRead(id);
        },
        onSuccess: () => {
            // Invalidate notification lists and unread count
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<ApiResponse<void>> => {
            return notificationService.markAllAsRead();
        },
        onSuccess: () => {
            // Invalidate notification lists and unread count
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return notificationService.delete(id);
        },
        onSuccess: () => {
            // Invalidate notification lists and unread count
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}
