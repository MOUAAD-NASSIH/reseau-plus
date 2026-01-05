/**
 * Mission Service
 * API service for mission-related operations
 * 
 * NOTE: Success toasts are handled by components, not services.
 * This prevents duplicate toasts when components also show notifications.
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Mission,
    CreateMissionInput,
    UpdateMissionInput,
    MissionFilters,
} from "@/types/mission.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: MissionFilters): string => {
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

export const missionService = {
    /**
     * Get all missions (admin only)
     */
    getAll: async (filters?: MissionFilters): Promise<ApiResponse<Mission[]>> => {
        const response = await api.get<ApiResponse<Mission[]>>(
            `/missions${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get mission by ID
     */
    getById: async (id: number): Promise<ApiResponse<Mission>> => {
        const response = await api.get<ApiResponse<Mission>>(`/missions/${id}`);
        return response.data;
    },

    /**
     * Create a new mission (institution only)
     */
    create: async (data: CreateMissionInput): Promise<ApiResponse<Mission>> => {
        const response = await api.post<ApiResponse<Mission>>("/missions", data);
        return response.data;
    },

    /**
     * Update a mission (institution only)
     */
    update: async (id: number, data: UpdateMissionInput): Promise<ApiResponse<Mission>> => {
        const response = await api.put<ApiResponse<Mission>>(`/missions/${id}`, data);
        return response.data;
    },

    /**
     * Delete a mission (institution only)
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/missions/${id}`);
        return response.data;
    },

    /**
     * Get institution's own missions
     */
    getMyMissions: async (filters?: MissionFilters): Promise<ApiResponse<Mission[]>> => {
        const response = await api.get<ApiResponse<Mission[]>>(
            `/missions/my${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get available missions for workers
     */
    getAvailable: async (filters?: MissionFilters): Promise<ApiResponse<Mission[]>> => {
        const response = await api.get<ApiResponse<Mission[]>>(
            `/missions/available${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get recommended missions for workers
     */
    getRecommended: async (): Promise<ApiResponse<Mission[]>> => {
        const response = await api.get<ApiResponse<Mission[]>>("/missions/recommended");
        return response.data;
    },

    /**
     * Get mission statistics for institution
     */
    getStats: async (): Promise<ApiResponse<Record<string, number>>> => {
        const response = await api.get<ApiResponse<Record<string, number>>>("/missions/stats");
        return response.data;
    },
};
