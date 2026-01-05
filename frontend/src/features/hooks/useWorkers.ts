/**
 * Worker Hooks
 * React Query hooks for worker profile and related operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workerService } from "../services/workerService";
import type {
    Worker,
    WorkerDocument,
    WorkerAvailability,
    UpdateWorkerInput,
    WorkerFilters,
    DocumentType,
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

// Availability input type
interface WorkerAvailabilityInput {
    startDate: string;
    endDate: string;
    isRecurring?: boolean;
}

// Query keys
export const workerKeys = {
    all: ["workers"] as const,
    lists: () => [...workerKeys.all, "list"] as const,
    list: (filters?: WorkerFilters) => [...workerKeys.lists(), filters] as const,
    profile: () => [...workerKeys.all, "profile"] as const,
    details: () => [...workerKeys.all, "detail"] as const,
    detail: (id: number) => [...workerKeys.details(), id] as const,
    documents: () => [...workerKeys.all, "documents"] as const,
    availabilities: () => [...workerKeys.all, "availabilities"] as const,
    experiences: () => [...workerKeys.all, "experiences"] as const,
};

/**
 * Hook to get current worker's profile
 */
export function useWorkerProfile() {
    return useQuery({
        queryKey: workerKeys.profile(),
        queryFn: async (): Promise<ApiResponse<Worker>> => {
            return workerService.getProfile();
        },
    });
}

/**
 * Hook to get a worker by ID
 */
export function useWorker(id: number) {
    return useQuery({
        queryKey: workerKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Worker>> => {
            return workerService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to get all workers (admin)
 */
export function useAllWorkers(filters?: WorkerFilters) {
    return useQuery({
        queryKey: workerKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Worker[]>> => {
            return workerService.getAll(filters);
        },
    });
}

/**
 * Hook to get worker's documents
 */
export function useWorkerDocuments() {
    return useQuery({
        queryKey: workerKeys.documents(),
        queryFn: async (): Promise<ApiResponse<WorkerDocument[]>> => {
            return workerService.getDocuments();
        },
    });
}

/**
 * Hook to get worker's availabilities
 */
export function useWorkerAvailabilities() {
    return useQuery({
        queryKey: workerKeys.availabilities(),
        queryFn: async (): Promise<ApiResponse<WorkerAvailability[]>> => {
            return workerService.getAvailabilities();
        },
    });
}

/**
 * Hook to update worker profile
 */
export function useUpdateWorkerProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateWorkerInput): Promise<ApiResponse<Worker>> => {
            return workerService.updateProfile(data);
        },
        onSuccess: () => {
            // Invalidate profile query
            queryClient.invalidateQueries({ queryKey: workerKeys.profile() });
        },
    });
}

/**
 * Hook to upload a document
 */
export function useUploadDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            type,
            file,
        }: {
            type: DocumentType;
            file: File;
        }): Promise<ApiResponse<WorkerDocument>> => {
            return workerService.uploadDocument(type, file);
        },
        onSuccess: () => {
            // Invalidate documents query
            queryClient.invalidateQueries({ queryKey: workerKeys.documents() });
        },
    });
}

/**
 * Hook to add availability
 */
export function useAddAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: WorkerAvailabilityInput
        ): Promise<ApiResponse<WorkerAvailability>> => {
            return workerService.addAvailability(data);
        },
        onSuccess: () => {
            // Invalidate availabilities query
            queryClient.invalidateQueries({ queryKey: workerKeys.availabilities() });
        },
    });
}

/**
 * Hook to update availability
 */
export function useUpdateAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: Partial<WorkerAvailabilityInput>;
        }): Promise<ApiResponse<WorkerAvailability>> => {
            return workerService.updateAvailability(id, data);
        },
        onSuccess: () => {
            // Invalidate availabilities query
            queryClient.invalidateQueries({ queryKey: workerKeys.availabilities() });
        },
    });
}

/**
 * Hook to delete availability
 */
export function useDeleteAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return workerService.deleteAvailability(id);
        },
        onSuccess: () => {
            // Invalidate availabilities query
            queryClient.invalidateQueries({ queryKey: workerKeys.availabilities() });
        },
    });
}

/**
 * Hook to add a domain to worker
 */
export function useAddWorkerDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (domainId: number): Promise<ApiResponse<void>> => {
            return workerService.addDomain(domainId);
        },
        onSuccess: () => {
            // Invalidate profile query
            queryClient.invalidateQueries({ queryKey: workerKeys.profile() });
        },
    });
}

/**
 * Hook to remove a domain from worker
 */
export function useRemoveWorkerDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (domainId: number): Promise<ApiResponse<void>> => {
            return workerService.removeDomain(domainId);
        },
        onSuccess: () => {
            // Invalidate profile query
            queryClient.invalidateQueries({ queryKey: workerKeys.profile() });
        },
    });
}
