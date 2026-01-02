/**
 * Assignment Service
 * API service for mission assignment operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    MissionAssignment,
    AssignmentFilters,
    AssignmentStatus,
} from "@/types/assignment.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: AssignmentFilters): string => {
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

export const assignmentService = {
    /**
     * Get all assignments (filtered by role)
     */
    getAll: async (filters?: AssignmentFilters): Promise<ApiResponse<MissionAssignment[]>> => {
        try {
            const response = await api.get<ApiResponse<MissionAssignment[]>>(
                `/assignments${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch assignments";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching assignments");
            throw new Error("Unknown error fetching assignments");
        }
    },

    /**
     * Get assignment by ID
     */
    getById: async (id: number): Promise<ApiResponse<MissionAssignment>> => {
        try {
            const response = await api.get<ApiResponse<MissionAssignment>>(`/assignments/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch assignment";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching assignment");
            throw new Error("Unknown error fetching assignment");
        }
    },

    /**
     * Get worker's own assignments
     */
    getMyAssignments: async (filters?: AssignmentFilters): Promise<ApiResponse<MissionAssignment[]>> => {
        try {
            const response = await api.get<ApiResponse<MissionAssignment[]>>(
                `/assignments/my${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch your assignments";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching your assignments");
            throw new Error("Unknown error fetching your assignments");
        }
    },

    /**
     * Get institution's assignments
     */
    getInstitutionAssignments: async (
        filters?: AssignmentFilters
    ): Promise<ApiResponse<MissionAssignment[]>> => {
        try {
            const response = await api.get<ApiResponse<MissionAssignment[]>>(
                `/assignments/institution${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch institution assignments";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching institution assignments");
            throw new Error("Unknown error fetching institution assignments");
        }
    },

    /**
     * Update assignment status (institution/admin only)
     */
    updateStatus: async (
        id: number,
        status: AssignmentStatus
    ): Promise<ApiResponse<MissionAssignment>> => {
        try {
            const response = await api.put<ApiResponse<MissionAssignment>>(
                `/assignments/${id}/status`,
                { status }
            );
            toast.success("Assignment status updated");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to update assignment status";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error updating assignment status");
            throw new Error("Unknown error updating assignment status");
        }
    },
};
