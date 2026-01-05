/**
 * Admin Hooks
 * React Query hooks for admin operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminService,
    type AdminLogFilters,
    type PendingWorkersFilters,
    type PendingDocumentsFilters,
    type AdminDashboardStats,
    type AdminLog,
} from "../services/adminService";
import { workerKeys } from "./useWorkers";
import type { Worker, WorkerDocument, DocumentStatus, UserStatus } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const adminKeys = {
    all: ["admin"] as const,
    dashboard: () => [...adminKeys.all, "dashboard"] as const,
    pendingWorkers: (filters?: PendingWorkersFilters) =>
        [...adminKeys.all, "pending-workers", filters] as const,
    pendingDocuments: (filters?: PendingDocumentsFilters) =>
        [...adminKeys.all, "pending-documents", filters] as const,
    logs: (filters?: AdminLogFilters) => [...adminKeys.all, "logs", filters] as const,
};

/**
 * Hook to get admin dashboard statistics
 */
export function useAdminDashboard() {
    return useQuery({
        queryKey: adminKeys.dashboard(),
        queryFn: async (): Promise<ApiResponse<AdminDashboardStats>> => {
            return adminService.getDashboard();
        },
    });
}

/**
 * Hook to get pending workers for verification
 */
export function usePendingWorkers(filters?: PendingWorkersFilters) {
    return useQuery({
        queryKey: adminKeys.pendingWorkers(filters),
        queryFn: async (): Promise<ApiResponse<Worker[]>> => {
            return adminService.getPendingWorkers(filters);
        },
    });
}

/**
 * Hook to get pending documents for review
 */
export function usePendingDocuments(filters?: PendingDocumentsFilters) {
    return useQuery({
        queryKey: adminKeys.pendingDocuments(filters),
        queryFn: async (): Promise<ApiResponse<WorkerDocument[]>> => {
            return adminService.getPendingDocuments(filters);
        },
    });
}

/**
 * Hook to get admin action logs
 */
export function useAdminLogs(filters?: AdminLogFilters) {
    return useQuery({
        queryKey: adminKeys.logs(filters),
        queryFn: async (): Promise<ApiResponse<AdminLog[]>> => {
            return adminService.getAdminLogs(filters);
        },
    });
}

/**
 * Hook to validate (approve) a worker
 */
export function useValidateWorker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workerId: number): Promise<ApiResponse<Worker>> => {
            return adminService.validateWorker(workerId);
        },
        onSuccess: () => {
            // Invalidate pending workers and dashboard
            queryClient.invalidateQueries({ queryKey: adminKeys.pendingWorkers() });
            queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
        },
    });
}

/**
 * Hook to reject a worker
 */
export function useRejectWorker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workerId,
            reason,
        }: {
            workerId: number;
            reason: string;
        }): Promise<ApiResponse<Worker>> => {
            return adminService.rejectWorker(workerId, reason);
        },
        onSuccess: () => {
            // Invalidate pending workers and dashboard
            queryClient.invalidateQueries({ queryKey: adminKeys.pendingWorkers() });
            queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
        },
    });
}

/**
 * Hook to review a document (approve or reject)
 */
export function useReviewDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            documentId,
            status,
            comment,
        }: {
            documentId: number;
            status: DocumentStatus;
            comment?: string;
        }): Promise<ApiResponse<WorkerDocument>> => {
            return adminService.reviewDocument(documentId, status, comment);
        },
        onSuccess: () => {
            // Invalidate pending documents
            queryClient.invalidateQueries({ queryKey: adminKeys.pendingDocuments() });
            queryClient.invalidateQueries({ queryKey: workerKeys.documents() });
        },
    });
}

/**
 * Hook to update user status
 */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            status,
            reason,
        }: {
            userId: number;
            status: UserStatus;
            reason: string;
        }): Promise<ApiResponse<unknown>> => {
            return adminService.updateUserStatus(userId, status, reason);
        },
        onSuccess: () => {
            // Invalidate worker and institution lists
            queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
    });
}
