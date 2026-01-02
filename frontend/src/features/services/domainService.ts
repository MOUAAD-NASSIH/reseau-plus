/**
 * Domain Service
 * API service for domain and speciality operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
import type { ApiResponse } from "@/types/api.types";
import type { Domain, Speciality, DomainFilters, SpecialityFilters } from "@/types/auth.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: DomainFilters | SpecialityFilters): string => {
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

export const domainService = {
    /**
     * Get all domains (public)
     */
    getDomains: async (filters?: DomainFilters): Promise<ApiResponse<Domain[]>> => {
        try {
            const response = await api.get<ApiResponse<Domain[]>>(
                `/domains${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch domains";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching domains");
            throw new Error("Unknown error fetching domains");
        }
    },

    /**
     * Get domain by ID (public)
     */
    getDomainById: async (id: number): Promise<ApiResponse<Domain>> => {
        try {
            const response = await api.get<ApiResponse<Domain>>(`/domains/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch domain";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching domain");
            throw new Error("Unknown error fetching domain");
        }
    },

    /**
     * Get all specialities (public)
     */
    getSpecialities: async (filters?: SpecialityFilters): Promise<ApiResponse<Speciality[]>> => {
        try {
            const response = await api.get<ApiResponse<Speciality[]>>(
                `/specialities${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch specialities";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching specialities");
            throw new Error("Unknown error fetching specialities");
        }
    },

    /**
     * Get speciality by ID (public)
     */
    getSpecialityById: async (id: number): Promise<ApiResponse<Speciality>> => {
        try {
            const response = await api.get<ApiResponse<Speciality>>(`/specialities/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch speciality";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching speciality");
            throw new Error("Unknown error fetching speciality");
        }
    },
};
