/**
 * Domain Service
 * API service for domain and speciality operations
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Domain, Speciality, DomainFilters, SpecialityFilters } from "@/types/auth.types";

/**
 * Domain/Speciality input types
 */
export interface CreateDomainInput {
    name: string;
    description?: string;
}

export interface UpdateDomainInput {
    name?: string;
    description?: string;
}

export interface CreateSpecialityInput {
    name: string;
    description?: string;
}

export interface UpdateSpecialityInput {
    name?: string;
    description?: string;
}

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
    // ============================================
    // DOMAIN OPERATIONS
    // ============================================

    /**
     * Get all domains (public)
     */
    getDomains: async (filters?: DomainFilters): Promise<ApiResponse<Domain[]>> => {
        const response = await api.get<ApiResponse<Domain[]>>(
            `/domains${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get domain by ID (public)
     */
    getDomainById: async (id: number): Promise<ApiResponse<Domain>> => {
        const response = await api.get<ApiResponse<Domain>>(`/domains/${id}`);
        return response.data;
    },

    /**
     * Create a new domain (admin only)
     */
    createDomain: async (data: CreateDomainInput): Promise<ApiResponse<Domain>> => {
        const response = await api.post<ApiResponse<Domain>>("/domains", data);
        return response.data;
    },

    /**
     * Update a domain (admin only)
     */
    updateDomain: async (id: number, data: UpdateDomainInput): Promise<ApiResponse<Domain>> => {
        const response = await api.put<ApiResponse<Domain>>(`/domains/${id}`, data);
        return response.data;
    },

    /**
     * Delete a domain (admin only)
     */
    deleteDomain: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/domains/${id}`);
        return response.data;
    },

    // ============================================
    // SPECIALITY OPERATIONS
    // ============================================

    /**
     * Get all specialities (public)
     */
    getSpecialities: async (filters?: SpecialityFilters): Promise<ApiResponse<Speciality[]>> => {
        const response = await api.get<ApiResponse<Speciality[]>>(
            `/specialities${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get speciality by ID (public)
     */
    getSpecialityById: async (id: number): Promise<ApiResponse<Speciality>> => {
        const response = await api.get<ApiResponse<Speciality>>(`/specialities/${id}`);
        return response.data;
    },

    /**
     * Create a new speciality (admin only)
     */
    createSpeciality: async (data: CreateSpecialityInput): Promise<ApiResponse<Speciality>> => {
        const response = await api.post<ApiResponse<Speciality>>("/specialities", data);
        return response.data;
    },

    /**
     * Update a speciality (admin only)
     */
    updateSpeciality: async (
        id: number,
        data: UpdateSpecialityInput
    ): Promise<ApiResponse<Speciality>> => {
        const response = await api.put<ApiResponse<Speciality>>(`/specialities/${id}`, data);
        return response.data;
    },

    /**
     * Delete a speciality (admin only)
     */
    deleteSpeciality: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/specialities/${id}`);
        return response.data;
    },
};
