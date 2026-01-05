/**
 * Application Service
 * API service for mission application operations
 * 
 * NOTE: Success toasts are handled by components, not services.
 * Error toasts are shown here for consistent error handling.
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    MissionApplication,
    CreateApplicationInput,
    ApplicationFilters,
    ApplicationStatus,
} from "@/types/application.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: ApplicationFilters): string => {
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

export const applicationService = {
    /**
     * Apply to a mission (worker only)
     */
    apply: async (data: CreateApplicationInput): Promise<ApiResponse<MissionApplication>> => {
        const response = await api.post<ApiResponse<MissionApplication>>("/applications", data);
        return response.data;
    },

    /**
     * Get worker's own applications
     */
    getMyApplications: async (filters?: ApplicationFilters): Promise<ApiResponse<MissionApplication[]>> => {
        const response = await api.get<ApiResponse<MissionApplication[]>>(
            `/applications/my${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get applications for a specific mission (institution only)
     */
    getMissionApplications: async (
        missionId: number,
        filters?: ApplicationFilters
    ): Promise<ApiResponse<MissionApplication[]>> => {
        const response = await api.get<ApiResponse<MissionApplication[]>>(
            `/applications/mission/${missionId}${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get application by ID
     */
    getById: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        const response = await api.get<ApiResponse<MissionApplication>>(`/applications/${id}`);
        return response.data;
    },

    /**
     * Accept an application (institution only)
     */
    accept: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        const response = await api.put<ApiResponse<MissionApplication>>(`/applications/${id}/accept`);
        return response.data;
    },

    /**
     * Reject an application (institution only)
     */
    reject: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        const response = await api.put<ApiResponse<MissionApplication>>(`/applications/${id}/reject`);
        return response.data;
    },

    /**
     * Withdraw an application (worker only)
     */
    withdraw: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/applications/${id}`);
        return response.data;
    },

    /**
     * Update application status (generic method)
     */
    updateStatus: async (
        id: number,
        status: ApplicationStatus
    ): Promise<ApiResponse<MissionApplication>> => {
        if (status === "ACCEPTED") {
            return applicationService.accept(id);
        } else if (status === "REJECTED") {
            return applicationService.reject(id);
        }
        throw new Error("Invalid status update");
    },
};
