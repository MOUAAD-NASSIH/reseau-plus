/**
 * Admin Service
 * API service for admin operations
 * 
 * NOTE: Success toasts are handled by components, not services.
 * This prevents duplicate toasts when components also show notifications.
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Worker, WorkerDocument, DocumentStatus, UserStatus } from "@/types/auth.types";

/**
 * Admin log entry
 */
export interface AdminLog {
    id: number;
    adminId: number;
    actionType: string;
    targetUserId?: number | null;
    details?: string | null;
    createdAt: string;
}

/**
 * Admin dashboard stats
 */
export interface AdminDashboardStats {
    totalWorkers: number;
    pendingWorkers: number;
    verifiedWorkers: number;
    totalInstitutions: number;
    totalMissions: number;
    activeMissions: number;
    totalPayments: number;
    pendingPayments: number;
}

/**
 * Admin log filters
 */
export interface AdminLogFilters {
    adminId?: number;
    actionType?: string;
    targetUserId?: number;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    limit?: number;
}

/**
 * Pending workers filters
 */
export interface PendingWorkersFilters {
    page?: number;
    limit?: number;
}

/**
 * Pending documents filters
 */
export interface PendingDocumentsFilters {
    type?: string;
    page?: number;
    limit?: number;
}

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: PendingWorkersFilters | PendingDocumentsFilters | AdminLogFilters): string => {
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

export const adminService = {
    /**
     * Get admin dashboard statistics
     */
    getDashboard: async (): Promise<ApiResponse<AdminDashboardStats>> => {
        const response = await api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard");
        return response.data;
    },

    /**
     * Get pending workers for verification
     */
    getPendingWorkers: async (
        filters?: PendingWorkersFilters
    ): Promise<ApiResponse<Worker[]>> => {
        const response = await api.get<ApiResponse<Worker[]>>(
            `/admin/workers/pending${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Verify worker (approve)
     */
    validateWorker: async (workerId: number): Promise<ApiResponse<Worker>> => {
        const response = await api.put<ApiResponse<Worker>>(
            `/admin/workers/${workerId}/verify`,
            { status: "VERIFIED" }
        );
        return response.data;
    },

    /**
     * Reject worker
     */
    rejectWorker: async (workerId: number, reason: string): Promise<ApiResponse<Worker>> => {
        const response = await api.put<ApiResponse<Worker>>(
            `/admin/workers/${workerId}/verify`,
            { status: "REJECTED", reason }
        );
        return response.data;
    },

    /**
     * Get pending documents for review
     */
    getPendingDocuments: async (
        filters?: PendingDocumentsFilters
    ): Promise<ApiResponse<WorkerDocument[]>> => {
        const response = await api.get<ApiResponse<WorkerDocument[]>>(
            `/admin/documents/pending${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Review document (approve or reject)
     */
    reviewDocument: async (
        documentId: number,
        status: DocumentStatus,
        comment?: string
    ): Promise<ApiResponse<WorkerDocument>> => {
        const response = await api.put<ApiResponse<WorkerDocument>>(
            `/admin/documents/${documentId}/review`,
            { status, comment }
        );
        return response.data;
    },

    /**
     * Update user status
     */
    updateUserStatus: async (
        userId: number,
        status: UserStatus,
        reason: string
    ): Promise<ApiResponse<unknown>> => {
        const response = await api.put<ApiResponse<unknown>>(
            `/admin/users/${userId}/status`,
            { status, reason }
        );
        return response.data;
    },

    /**
     * Get admin action logs
     */
    getAdminLogs: async (filters?: AdminLogFilters): Promise<ApiResponse<AdminLog[]>> => {
        const response = await api.get<ApiResponse<AdminLog[]>>(
            `/admin/logs${buildQueryString(filters)}`
        );
        return response.data;
    },
};
