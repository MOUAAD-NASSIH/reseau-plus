/**
 * Domain and Speciality Endpoints Module
 * RTK Query endpoints for domain and speciality operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Domain,
    Speciality,
    DomainFilters,
    SpecialityFilters,
} from "@/types/auth.types";

/**
 * Domain input types
 */
export interface CreateDomainInput {
    name: string;
    description?: string;
}

export interface UpdateDomainInput {
    name?: string;
    description?: string;
}

/**
 * Speciality input types
 */
export interface CreateSpecialityInput {
    name: string;
    description?: string;
}

export interface UpdateSpecialityInput {
    name?: string;
    description?: string;
}

/**
 * Domain and Speciality API endpoints injected into the main API slice
 */
export const domainApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // DOMAIN ENDPOINTS


        /**
         * Get all domains (public)
         * Provides tags for cache identification
         */
        getDomains: builder.query<ApiResponse<Domain[]>, DomainFilters | void>({
            query: (filters) => ({
                url: "/domains",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Domains" as const,
                            id,
                        })),
                        { type: "Domains", id: "LIST" },
                    ]
                    : [{ type: "Domains", id: "LIST" }],
        }),

        /**
         * Get a single domain by ID (public)
         */
        getDomain: builder.query<ApiResponse<Domain>, number>({
            query: (id) => ({ url: `/domains/${id}` }),
            providesTags: (_, __, id) => [{ type: "Domains", id }],
        }),

        /**
         * Create a new domain (admin only)
         * Invalidates domain caches
         */
        createDomain: builder.mutation<ApiResponse<Domain>, CreateDomainInput>({
            query: (data) => ({
                url: "/domains",
                method: "POST",
                data,
            }),
            invalidatesTags: [{ type: "Domains", id: "LIST" }],
        }),

        /**
         * Update a domain (admin only)
         * Invalidates specific domain and list caches
         */
        updateDomain: builder.mutation<
            ApiResponse<Domain>,
            { id: number; data: UpdateDomainInput }
        >({
            query: ({ id, data }) => ({
                url: `/domains/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Domains", id },
                { type: "Domains", id: "LIST" },
            ],
        }),

        /**
         * Delete a domain (admin only)
         * Invalidates all domain caches
         */
        deleteDomain: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/domains/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Domains", id: "LIST" }],
        }),

        // SPECIALITY ENDPOINTS


        /**
         * Get all specialities (public)
         * Provides tags for cache identification
         */
        getSpecialities: builder.query<ApiResponse<Speciality[]>, SpecialityFilters | void>({
            query: (filters) => ({
                url: "/specialities",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Specialities" as const,
                            id,
                        })),
                        { type: "Specialities", id: "LIST" },
                    ]
                    : [{ type: "Specialities", id: "LIST" }],
        }),

        /**
         * Get a single speciality by ID (public)
         */
        getSpeciality: builder.query<ApiResponse<Speciality>, number>({
            query: (id) => ({ url: `/specialities/${id}` }),
            providesTags: (_, __, id) => [{ type: "Specialities", id }],
        }),

        /**
         * Create a new speciality (admin only)
         * Invalidates speciality caches
         */
        createSpeciality: builder.mutation<ApiResponse<Speciality>, CreateSpecialityInput>({
            query: (data) => ({
                url: "/specialities",
                method: "POST",
                data,
            }),
            invalidatesTags: [{ type: "Specialities", id: "LIST" }],
        }),

        /**
         * Update a speciality (admin only)
         * Invalidates specific speciality and list caches
         */
        updateSpeciality: builder.mutation<
            ApiResponse<Speciality>,
            { id: number; data: UpdateSpecialityInput }
        >({
            query: ({ id, data }) => ({
                url: `/specialities/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Specialities", id },
                { type: "Specialities", id: "LIST" },
            ],
        }),

        /**
         * Delete a speciality (admin only)
         * Invalidates all speciality caches
         */
        deleteSpeciality: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/specialities/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Specialities", id: "LIST" }],
        }),
    }),
});

/**
 * Auto-generated hooks for domain and speciality endpoints
 * Export for use in components
 */
export const {
    // Domain hooks
    useGetDomainsQuery,
    useGetDomainQuery,
    useCreateDomainMutation,
    useUpdateDomainMutation,
    useDeleteDomainMutation,
    // Speciality hooks
    useGetSpecialitiesQuery,
    useGetSpecialityQuery,
    useCreateSpecialityMutation,
    useUpdateSpecialityMutation,
    useDeleteSpecialityMutation,
} = domainApi;

