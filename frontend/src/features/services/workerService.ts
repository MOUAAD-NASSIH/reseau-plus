/**
 * Worker Service
 * API service for worker profile and document operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.get<ApiResponse<Worker>>("/workers/me");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch profile";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching profile");
            throw new Error("Unknown error fetching profile");
        }
    },

    /**
     * Update current worker's profile
     */
    updateProfile: async (data: UpdateWorkerInput): Promise<ApiResponse<Worker>> => {
        try {
            const response = await api.put<ApiResponse<Worker>>("/workers/me", data);
            toast.success("Profile updated successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to update profile";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error updating profile");
            throw new Error("Unknown error updating profile");
        }
    },

    /**
     * Get worker by ID (public)
     */
    getById: async (id: number): Promise<ApiResponse<Worker>> => {
        try {
            const response = await api.get<ApiResponse<Worker>>(`/workers/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch worker";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching worker");
            throw new Error("Unknown error fetching worker");
        }
    },

    /**
     * Get all workers (admin only)
     */
    getAll: async (filters?: WorkerFilters): Promise<ApiResponse<Worker[]>> => {
        try {
            const response = await api.get<ApiResponse<Worker[]>>(
                `/workers${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch workers";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching workers");
            throw new Error("Unknown error fetching workers");
        }
    },

    // ============================================
    // DOCUMENT OPERATIONS
    // ============================================

    /**
     * Get worker's documents
     */
    getDocuments: async (): Promise<ApiResponse<WorkerDocument[]>> => {
        try {
            const response = await api.get<ApiResponse<WorkerDocument[]>>("/workers/documents");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch documents";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching documents");
            throw new Error("Unknown error fetching documents");
        }
    },

    /**
     * Upload a document
     */
    uploadDocument: async (
        type: DocumentType,
        file: File
    ): Promise<ApiResponse<WorkerDocument>> => {
        try {
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
            toast.success("Document uploaded successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to upload document";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error uploading document");
            throw new Error("Unknown error uploading document");
        }
    },

    // ============================================
    // EXPERIENCE OPERATIONS
    // ============================================

    /**
     * Get worker's experiences
     */
    getExperiences: async (): Promise<ApiResponse<WorkerExperience[]>> => {
        try {
            const response = await api.get<ApiResponse<WorkerExperience[]>>("/workers/experiences");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch experiences";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching experiences");
            throw new Error("Unknown error fetching experiences");
        }
    },

    /**
     * Add a new experience
     */
    addExperience: async (data: WorkerExperienceInput): Promise<ApiResponse<WorkerExperience>> => {
        try {
            const response = await api.post<ApiResponse<WorkerExperience>>(
                "/workers/experiences",
                data
            );
            toast.success("Experience added successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to add experience";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error adding experience");
            throw new Error("Unknown error adding experience");
        }
    },

    /**
     * Update an experience
     */
    updateExperience: async (
        id: number,
        data: Partial<WorkerExperienceInput>
    ): Promise<ApiResponse<WorkerExperience>> => {
        try {
            const response = await api.put<ApiResponse<WorkerExperience>>(
                `/workers/experiences/${id}`,
                data
            );
            toast.success("Experience updated successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to update experience";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error updating experience");
            throw new Error("Unknown error updating experience");
        }
    },

    /**
     * Delete an experience
     */
    deleteExperience: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/workers/experiences/${id}`);
            toast.success("Experience deleted");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to delete experience";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error deleting experience");
            throw new Error("Unknown error deleting experience");
        }
    },

    // ============================================
    // AVAILABILITY OPERATIONS
    // ============================================

    /**
     * Get worker's availabilities
     */
    getAvailabilities: async (): Promise<ApiResponse<WorkerAvailability[]>> => {
        try {
            const response = await api.get<ApiResponse<WorkerAvailability[]>>(
                "/workers/availabilities"
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch availabilities";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching availabilities");
            throw new Error("Unknown error fetching availabilities");
        }
    },

    /**
     * Add availability
     */
    addAvailability: async (
        data: WorkerAvailabilityInput
    ): Promise<ApiResponse<WorkerAvailability>> => {
        try {
            const response = await api.post<ApiResponse<WorkerAvailability>>(
                "/workers/availabilities",
                data
            );
            toast.success("Availability added");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to add availability";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error adding availability");
            throw new Error("Unknown error adding availability");
        }
    },

    /**
     * Update availability
     */
    updateAvailability: async (
        id: number,
        data: Partial<WorkerAvailabilityInput>
    ): Promise<ApiResponse<WorkerAvailability>> => {
        try {
            const response = await api.put<ApiResponse<WorkerAvailability>>(
                `/workers/availabilities/${id}`,
                data
            );
            toast.success("Availability updated");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to update availability";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error updating availability");
            throw new Error("Unknown error updating availability");
        }
    },

    /**
     * Delete availability
     */
    deleteAvailability: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/workers/availabilities/${id}`);
            toast.success("Availability deleted");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to delete availability";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error deleting availability");
            throw new Error("Unknown error deleting availability");
        }
    },

    // ============================================
    // DOMAIN OPERATIONS
    // ============================================

    /**
     * Add a domain to worker
     */
    addDomain: async (domainId: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.post<ApiResponse<void>>("/workers/domains", { domainId });
            toast.success("Domain added");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to add domain";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error adding domain");
            throw new Error("Unknown error adding domain");
        }
    },

    /**
     * Remove a domain from worker
     */
    removeDomain: async (domainId: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/workers/domains/${domainId}`);
            toast.success("Domain removed");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to remove domain";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error removing domain");
            throw new Error("Unknown error removing domain");
        }
    },
};
