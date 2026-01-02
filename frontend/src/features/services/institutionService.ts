/**
 * Institution Service
 * API service for institution profile operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.get<ApiResponse<Institution>>("/institutions/me");
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
     * Update current institution's profile
     */
    updateProfile: async (data: UpdateInstitutionInput): Promise<ApiResponse<Institution>> => {
        try {
            const response = await api.put<ApiResponse<Institution>>("/institutions/me", data);
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
     * Get institution by ID (public)
     */
    getById: async (id: number): Promise<ApiResponse<Institution>> => {
        try {
            const response = await api.get<ApiResponse<Institution>>(`/institutions/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch institution";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching institution");
            throw new Error("Unknown error fetching institution");
        }
    },

    /**
     * Get all institutions (admin only)
     */
    getAll: async (filters?: InstitutionFilters): Promise<ApiResponse<Institution[]>> => {
        try {
            const response = await api.get<ApiResponse<Institution[]>>(
                `/institutions${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch institutions";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching institutions");
            throw new Error("Unknown error fetching institutions");
        }
    },
};
