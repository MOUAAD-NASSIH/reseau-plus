/**
 * Admin Endpoints Module
 * RTK Query endpoints for admin operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type { Worker, WorkerDocument, DocumentStatus, UserStatus } from "@/types/auth.types";

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
    activeAssignments: number;
    activeMissions: number;
    cancelledMissions: number;
    completedAssignments: number;
    completedMissions: number;
    ongoingMissions: number;
    pendingDocuments: number;
    pendingVerifications: number;
    totalAssignments: number;
    totalInstitutions: number;
    totalMissions: number;
    totalPaymentAmount: number;
    totalPayments: number;
    totalRevenue: number;
    totalReviews: number;
    totalUsers: number;
    totalWorkerPayouts: number;
    totalWorkers: number;
    userStatusBreakdown: { status: string; count: number }[];
    workerStatusBreakdown: { status: string; count: number }[];
}

/**
 * Admin log entry
 */
export interface AdminLog {
    id: number;
    adminId: number;
    actionType: string;
    targetUserId?: number | null;
    reason?: string | null;
    createdAt: string;
    // Joined relations
    admin?: {
        id: number;
        email: string;
    };
    targetUser?: {
        id: number;
        email: string;
        role?: { name: string };
        worker?: { firstName: string; lastName: string };
        institution?: { institutionName: string };
    } | null;
    targetDocument?: {
        id: number;
        type: string;
        fileUrl?: string;
    } | null;
    targetMission?: {
        id: number;
        title: string;
    } | null;
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
    status?: string;
    page?: number;
    limit?: number;
}

/**
 * Profile picture upload response
 */
export interface ProfilePictureUploadResponse {
    url: string;
    publicId: string;
}

/**
 * Admin API endpoints injected into the main API slice
 */
export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get admin dashboard statistics
         * Provides tags for cache identification
         */
        getAdminDashboard: builder.query<ApiResponse<AdminDashboardStats>, void>({
            query: () => ({ url: "/admin/dashboard" }),
            providesTags: [{ type: "Admin", id: "DASHBOARD" }],
        }),

        /**
         * Get pending workers for verification
         * Provides tags for cache identification
         */
        getPendingWorkers: builder.query<ApiResponse<Worker[]>, PendingWorkersFilters | void>({
            query: (filters) => ({
                url: "/admin/workers/pending",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Admin" as const,
                            id: `PENDING_WORKER_${id}`,
                        })),
                        { type: "Admin", id: "PENDING_WORKERS" },
                    ]
                    : [{ type: "Admin", id: "PENDING_WORKERS" }],
        }),

        /**
         * Get pending documents for review
         * Provides tags for cache identification
         */
        getPendingDocuments: builder.query<ApiResponse<WorkerDocument[]>, PendingDocumentsFilters | void>({
            query: (filters) => ({
                url: "/admin/documents/pending",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Admin" as const,
                            id: `PENDING_DOCUMENT_${id}`,
                        })),
                        { type: "Admin", id: "PENDING_DOCUMENTS" },
                    ]
                    : [{ type: "Admin", id: "PENDING_DOCUMENTS" }],
        }),

        /**
         * Get admin action logs
         * Provides tags for cache identification
         */
        getAdminLogs: builder.query<ApiResponse<AdminLog[]>, AdminLogFilters | void>({
            query: (filters) => ({
                url: "/admin/logs",
                params: filters || undefined,
            }),
            providesTags: [{ type: "Admin", id: "LOGS" }],
        }),

        /**
         * Validate (approve) a worker
         * Invalidates pending workers, dashboard, and worker list caches
         */
        validateWorker: builder.mutation<ApiResponse<Worker>, number>({
            query: (workerId) => ({
                url: `/admin/workers/${workerId}/verify`,
                method: "PUT",
                data: { status: "VERIFIED" },
            }),
            invalidatesTags: (_, __, workerId) => [
                { type: "Admin", id: "PENDING_WORKERS" },
                { type: "Admin", id: `PENDING_WORKER_${workerId}` },
                { type: "Admin", id: "DASHBOARD" },
                { type: "Admin", id: "LOGS" },
                { type: "Workers", id: "LIST" },
                { type: "Workers", id: workerId },
            ],
        }),

        /**
         * Reject a worker
         * Invalidates pending workers, dashboard, and worker list caches
         */
        rejectWorker: builder.mutation<ApiResponse<Worker>, { workerId: number; reason: string }>({
            query: ({ workerId, reason }) => ({
                url: `/admin/workers/${workerId}/verify`,
                method: "PUT",
                data: { status: "REJECTED", reason },
            }),
            invalidatesTags: (_, __, { workerId }) => [
                { type: "Admin", id: "PENDING_WORKERS" },
                { type: "Admin", id: `PENDING_WORKER_${workerId}` },
                { type: "Admin", id: "DASHBOARD" },
                { type: "Admin", id: "LOGS" },
                { type: "Workers", id: "LIST" },
                { type: "Workers", id: workerId },
            ],
        }),

        /**
         * Review a document (approve or reject)
         * Invalidates pending documents and worker documents caches
         */
        reviewDocument: builder.mutation<
            ApiResponse<WorkerDocument>,
            { documentId: number; status: DocumentStatus; comment?: string }
        >({
            query: ({ documentId, status, comment }) => ({
                url: `/admin/documents/${documentId}/review`,
                method: "PUT",
                data: { status, comment },
            }),
            invalidatesTags: (_, __, { documentId }) => [
                { type: "Admin", id: "PENDING_DOCUMENTS" },
                { type: "Admin", id: `PENDING_DOCUMENT_${documentId}` },
                { type: "Admin", id: "LOGS" },
                { type: "Workers", id: "DOCUMENTS" },
            ],
        }),

        /**
         * Update user status
         * Invalidates worker lists and dashboard caches
         */
        updateUserStatus: builder.mutation<
            ApiResponse<unknown>,
            { userId: number; status: UserStatus; reason: string }
        >({
            query: ({ userId, status, reason }) => ({
                url: `/admin/users/${userId}/status`,
                method: "PUT",
                data: { status, reason },
            }),
            invalidatesTags: [
                { type: "Admin", id: "DASHBOARD" },
                { type: "Admin", id: "LOGS" },
                { type: "Workers", id: "LIST" },
            ],
        }),

        /**
         * Upload admin profile picture
         * POST /api/profile/admin/picture
         */
        uploadAdminProfilePicture: builder.mutation<ApiResponse<ProfilePictureUploadResponse>, FormData>({
            query: (formData) => ({
                url: "/profile/admin/picture",
                method: "POST",
                data: formData,
            }),
            invalidatesTags: [
                { type: "Admin", id: "PROFILE" },
                { type: "Auth", id: "ME" },
            ],
        }),

        /**
         * Delete admin profile picture
         * DELETE /api/profile/admin/picture
         */
        deleteAdminProfilePicture: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: "/profile/admin/picture",
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Admin", id: "PROFILE" },
                { type: "Auth", id: "ME" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for admin endpoints
 * Export for use in components
 */
export const {
    useGetAdminDashboardQuery,
    useGetPendingWorkersQuery,
    useGetPendingDocumentsQuery,
    useGetAdminLogsQuery,
    useValidateWorkerMutation,
    useRejectWorkerMutation,
    useReviewDocumentMutation,
    useUpdateUserStatusMutation,
    useUploadAdminProfilePictureMutation,
    useDeleteAdminProfilePictureMutation,
} = adminApi;

