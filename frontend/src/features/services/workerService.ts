/**
 * Worker Service
 * API service for worker profile and document operations
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Worker,
    WorkerDocument,
    WorkerExperience,
    WorkerAvailability,
    UpdateWorkerInput,
    WorkerFilters,
    DocumentType,
    WorkerExperienceInput,
} from "@/types/auth.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: WorkerFilters): string => {
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
 * Worker availability input
 */
interface WorkerAvailabilityInput {
    startDate: string;
    endDate: string;
    isRecurring?: boolean;
}

export const workerService = {
    /**
     * Get current worker's profile
     */
    getProfile: async (): Promise<ApiResponse<Worker>> => {
        const response = await api.get<ApiResponse<Worker>>("/workers/me");
        return response.data;
    },

    /**
     * Update current worker's profile
     */
    updateProfile: async (data: UpdateWorkerInput): Promise<ApiResponse<Worker>> => {
        const response = await api.put<ApiResponse<Worker>>("/workers/me", data);
        return response.data;
    },

    /**
     * Get worker by ID (public)
     */
    getById: async (id: number): Promise<ApiResponse<Worker>> => {
        const response = await api.get<ApiResponse<Worker>>(`/workers/${id}`);
        return response.data;
    },

    /**
     * Get all workers (admin only)
     */
    getAll: async (filters?: WorkerFilters): Promise<ApiResponse<Worker[]>> => {
        const response = await api.get<ApiResponse<Worker[]>>(
            `/workers${buildQueryString(filters)}`
        );
        return response.data;
    },

    // ============================================
    // DOCUMENT OPERATIONS
    // ============================================

    /**
     * Get worker's documents
     */
    getDocuments: async (): Promise<ApiResponse<WorkerDocument[]>> => {
        const response = await api.get<ApiResponse<WorkerDocument[]>>("/workers/documents");
        return response.data;
    },

    /**
     * Upload a document
     */
    uploadDocument: async (
        type: DocumentType,
        file: File
    ): Promise<ApiResponse<WorkerDocument>> => {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("type", type);

        const response = await api.post<ApiResponse<WorkerDocument>>(
            "/workers/documents",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    // ============================================
    // EXPERIENCE OPERATIONS
    // ============================================

    /**
     * Get worker's experiences
     */
    getExperiences: async (): Promise<ApiResponse<WorkerExperience[]>> => {
        const response = await api.get<ApiResponse<WorkerExperience[]>>("/workers/experiences");
        return response.data;
    },

    /**
     * Add a new experience
     */
    addExperience: async (data: WorkerExperienceInput): Promise<ApiResponse<WorkerExperience>> => {
        const response = await api.post<ApiResponse<WorkerExperience>>(
            "/workers/experiences",
            data
        );
        return response.data;
    },

    /**
     * Update an experience
     */
    updateExperience: async (
        id: number,
        data: Partial<WorkerExperienceInput>
    ): Promise<ApiResponse<WorkerExperience>> => {
        const response = await api.put<ApiResponse<WorkerExperience>>(
            `/workers/experiences/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete an experience
     */
    deleteExperience: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/workers/experiences/${id}`);
        return response.data;
    },

    // ============================================
    // AVAILABILITY OPERATIONS
    // ============================================

    /**
     * Get worker's availabilities
     */
    getAvailabilities: async (): Promise<ApiResponse<WorkerAvailability[]>> => {
        const response = await api.get<ApiResponse<WorkerAvailability[]>>(
            "/workers/availabilities"
        );
        return response.data;
    },

    /**
     * Add availability
     */
    addAvailability: async (
        data: WorkerAvailabilityInput
    ): Promise<ApiResponse<WorkerAvailability>> => {
        const response = await api.post<ApiResponse<WorkerAvailability>>(
            "/workers/availabilities",
            data
        );
        return response.data;
    },

    /**
     * Update availability
     */
    updateAvailability: async (
        id: number,
        data: Partial<WorkerAvailabilityInput>
    ): Promise<ApiResponse<WorkerAvailability>> => {
        const response = await api.put<ApiResponse<WorkerAvailability>>(
            `/workers/availabilities/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete availability
     */
    deleteAvailability: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/workers/availabilities/${id}`);
        return response.data;
    },

    // ============================================
    // DOMAIN OPERATIONS
    // ============================================

    /**
     * Add a domain to worker
     */
    addDomain: async (domainId: number): Promise<ApiResponse<void>> => {
        const response = await api.post<ApiResponse<void>>("/workers/domains", { domainId });
        return response.data;
    },

    /**
     * Remove a domain from worker
     */
    removeDomain: async (domainId: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/workers/domains/${domainId}`);
        return response.data;
    },
};
