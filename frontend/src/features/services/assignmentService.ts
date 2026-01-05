/**
 * Assignment Service
 * API service for mission assignment operations
 * 
 * NOTE: Success toasts are handled by components, not services.
 * This prevents duplicate toasts when components also show notifications.
 */

import { api } from "@/api/axios";
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
        const response = await api.get<ApiResponse<MissionAssignment[]>>(
            `/assignments${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get assignment by ID
     */
    getById: async (id: number): Promise<ApiResponse<MissionAssignment>> => {
        const response = await api.get<ApiResponse<MissionAssignment>>(`/assignments/${id}`);
        return response.data;
    },

    /**
     * Get worker's own assignments
     */
    getMyAssignments: async (filters?: AssignmentFilters): Promise<ApiResponse<MissionAssignment[]>> => {
        const response = await api.get<ApiResponse<MissionAssignment[]>>(
            `/assignments/my${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get institution's assignments
     */
    getInstitutionAssignments: async (
        filters?: AssignmentFilters
    ): Promise<ApiResponse<MissionAssignment[]>> => {
        const response = await api.get<ApiResponse<MissionAssignment[]>>(
            `/assignments/institution${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Update assignment status (institution/admin only)
     */
    updateStatus: async (
        id: number,
        status: AssignmentStatus
    ): Promise<ApiResponse<MissionAssignment>> => {
        const response = await api.put<ApiResponse<MissionAssignment>>(
            `/assignments/${id}/status`,
            { status }
        );
        return response.data;
    },
};
