/**
 * Mission Service
 * API service for mission-related operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.get<ApiResponse<Mission[]>>(
                `/missions${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch missions";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching missions");
            throw new Error("Unknown error fetching missions");
        }
    },

    /**
     * Get mission by ID
     */
    getById: async (id: number): Promise<ApiResponse<Mission>> => {
        try {
            const response = await api.get<ApiResponse<Mission>>(`/missions/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch mission";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching mission");
            throw new Error("Unknown error fetching mission");
        }
    },

    /**
     * Create a new mission (institution only)
     */
    create: async (data: CreateMissionInput): Promise<ApiResponse<Mission>> => {
        try {
            const response = await api.post<ApiResponse<Mission>>("/missions", data);
            toast.success("Mission created successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to create mission";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error creating mission");
            throw new Error("Unknown error creating mission");
        }
    },

    /**
     * Update a mission (institution only)
     */
    update: async (id: number, data: UpdateMissionInput): Promise<ApiResponse<Mission>> => {
        try {
            const response = await api.put<ApiResponse<Mission>>(`/missions/${id}`, data);
            toast.success("Mission updated successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to update mission";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error updating mission");
            throw new Error("Unknown error updating mission");
        }
    },

    /**
     * Delete a mission (institution only)
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/missions/${id}`);
            toast.success("Mission deleted successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to delete mission";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error deleting mission");
            throw new Error("Unknown error deleting mission");
        }
    },

    /**
     * Get institution's own missions
     */
    getMyMissions: async (filters?: MissionFilters): Promise<ApiResponse<Mission[]>> => {
        try {
            const response = await api.get<ApiResponse<Mission[]>>(
                `/missions/my${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch your missions";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching your missions");
            throw new Error("Unknown error fetching your missions");
        }
    },

    /**
     * Get available missions for workers
     */
    getAvailable: async (filters?: MissionFilters): Promise<ApiResponse<Mission[]>> => {
        try {
            const response = await api.get<ApiResponse<Mission[]>>(
                `/missions/available${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch available missions";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching available missions");
            throw new Error("Unknown error fetching available missions");
        }
    },

    /**
     * Get recommended missions for workers
     */
    getRecommended: async (): Promise<ApiResponse<Mission[]>> => {
        try {
            const response = await api.get<ApiResponse<Mission[]>>("/missions/recommended");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch recommended missions";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching recommended missions");
            throw new Error("Unknown error fetching recommended missions");
        }
    },

    /**
     * Get mission statistics for institution
     */
    getStats: async (): Promise<ApiResponse<Record<string, number>>> => {
        try {
            const response = await api.get<ApiResponse<Record<string, number>>>("/missions/stats");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch mission stats";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching mission stats");
            throw new Error("Unknown error fetching mission stats");
        }
    },
};
