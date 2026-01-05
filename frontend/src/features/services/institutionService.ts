/**
 * Institution Service
 * API service for institution profile operations
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Institution,
    UpdateInstitutionInput,
    InstitutionFilters,
} from "@/types/auth.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: InstitutionFilters): string => {
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

export const institutionService = {
    /**
     * Get current institution's profile
     */
    getProfile: async (): Promise<ApiResponse<Institution>> => {
        const response = await api.get<ApiResponse<Institution>>("/institutions/me");
        return response.data;
    },

    /**
     * Update current institution's profile
     */
    updateProfile: async (data: UpdateInstitutionInput): Promise<ApiResponse<Institution>> => {
        const response = await api.put<ApiResponse<Institution>>("/institutions/me", data);
        return response.data;
    },

    /**
     * Get institution by ID (public)
     */
    getById: async (id: number): Promise<ApiResponse<Institution>> => {
        const response = await api.get<ApiResponse<Institution>>(`/institutions/${id}`);
        return response.data;
    },

    /**
     * Get all institutions (admin only)
     */
    getAll: async (filters?: InstitutionFilters): Promise<ApiResponse<Institution[]>> => {
        const response = await api.get<ApiResponse<Institution[]>>(
            `/institutions${buildQueryString(filters)}`
        );
        return response.data;
    },
};
