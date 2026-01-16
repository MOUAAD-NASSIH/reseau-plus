/**
 * Institution Endpoints Module
 * RTK Query endpoints for institution profile operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Institution,
    UpdateInstitutionInput,
    InstitutionFilters,
} from "@/types/auth.types";

/**
 * Institution API endpoints injected into the main API slice
 */
export const institutionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get current institution's profile
         * Provides tags for cache identification
         */
        getInstitutionProfile: builder.query<ApiResponse<Institution>, void>({
            query: () => ({ url: "/institutions/me" }),
            providesTags: [{ type: "Institutions", id: "PROFILE" }],
        }),

        /**
         * Get an institution by ID (public)
         */
        getInstitution: builder.query<ApiResponse<Institution>, number>({
            query: (id) => ({ url: `/institutions/${id}` }),
            providesTags: (_, __, id) => [{ type: "Institutions", id }],
        }),

        /**
         * Get all institutions (admin only)
         */
        getAllInstitutions: builder.query<ApiResponse<Institution[]>, InstitutionFilters | void>({
            query: (filters) => ({
                url: "/institutions",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Institutions" as const,
                            id,
                        })),
                        { type: "Institutions", id: "LIST" },
                    ]
                    : [{ type: "Institutions", id: "LIST" }],
        }),

        /**
         * Update current institution's profile
         * Invalidates institution profile cache
         */
        updateInstitutionProfile: builder.mutation<ApiResponse<Institution>, UpdateInstitutionInput>({
            query: (data) => ({
                url: "/institutions/me",
                method: "PUT",
                data,
            }),
            invalidatesTags: [
                { type: "Institutions", id: "PROFILE" },
                { type: "Institutions", id: "LIST" },
            ],
        }),

        /**
         * Upload institution logo
         * Uses the profile routes: POST /api/profile/institution/picture
         */
        uploadInstitutionLogo: builder.mutation<ApiResponse<{ url: string; publicId: string }>, FormData>({
            query: (formData) => ({
                url: "/profile/institution/picture",
                method: "POST",
                data: formData,
            }),
            invalidatesTags: [
                { type: "Institutions", id: "PROFILE" },
                { type: "Institutions", id: "LIST" },
                { type: "Auth", id: "ME" },
            ],
        }),

        /**
         * Delete institution logo
         * Uses the profile routes: DELETE /api/profile/institution/picture
         */
        deleteInstitutionLogo: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: "/profile/institution/picture",
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Institutions", id: "PROFILE" },
                { type: "Institutions", id: "LIST" },
                { type: "Auth", id: "ME" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for institution endpoints
 * Export for use in components
 */
export const {
    useGetInstitutionProfileQuery,
    useGetInstitutionQuery,
    useGetAllInstitutionsQuery,
    useUpdateInstitutionProfileMutation,
    useUploadInstitutionLogoMutation,
    useDeleteInstitutionLogoMutation,
} = institutionApi;

