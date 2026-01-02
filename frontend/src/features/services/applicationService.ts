/**
 * Application Service
 * API service for mission application operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.post<ApiResponse<MissionApplication>>("/applications", data);
            toast.success("Application submitted successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to submit application";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error submitting application");
            throw new Error("Unknown error submitting application");
        }
    },

    /**
     * Get worker's own applications
     */
    getMyApplications: async (filters?: ApplicationFilters): Promise<ApiResponse<MissionApplication[]>> => {
        try {
            const response = await api.get<ApiResponse<MissionApplication[]>>(
                `/applications/my${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch your applications";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching your applications");
            throw new Error("Unknown error fetching your applications");
        }
    },

    /**
     * Get applications for a specific mission (institution only)
     */
    getMissionApplications: async (
        missionId: number,
        filters?: ApplicationFilters
    ): Promise<ApiResponse<MissionApplication[]>> => {
        try {
            const response = await api.get<ApiResponse<MissionApplication[]>>(
                `/applications/mission/${missionId}${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch mission applications";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching mission applications");
            throw new Error("Unknown error fetching mission applications");
        }
    },

    /**
     * Get application by ID
     */
    getById: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        try {
            const response = await api.get<ApiResponse<MissionApplication>>(`/applications/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch application";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching application");
            throw new Error("Unknown error fetching application");
        }
    },

    /**
     * Accept an application (institution only)
     */
    accept: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        try {
            const response = await api.put<ApiResponse<MissionApplication>>(`/applications/${id}/accept`);
            toast.success("Application accepted");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to accept application";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error accepting application");
            throw new Error("Unknown error accepting application");
        }
    },

    /**
     * Reject an application (institution only)
     */
    reject: async (id: number): Promise<ApiResponse<MissionApplication>> => {
        try {
            const response = await api.put<ApiResponse<MissionApplication>>(`/applications/${id}/reject`);
            toast.success("Application rejected");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to reject application";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error rejecting application");
            throw new Error("Unknown error rejecting application");
        }
    },

    /**
     * Withdraw an application (worker only)
     */
    withdraw: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/applications/${id}`);
            toast.success("Application withdrawn");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to withdraw application";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error withdrawing application");
            throw new Error("Unknown error withdrawing application");
        }
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
