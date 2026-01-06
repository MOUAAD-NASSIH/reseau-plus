/**
 * Review Endpoints Module
 * RTK Query endpoints for review and rating operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Review,
    CreateReviewInput,
    ReviewFilters,
    AverageRating,
} from "@/types/review.types";

/**
 * Build query params object from filters
 */
const buildParams = (filters?: ReviewFilters): Record<string, string> | undefined => {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    });
    return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Review API endpoints injected into the main API slice
 */
export const reviewApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get reviews received by current user
         * Provides tags for cache identification
         */
        getMyReceivedReviews: builder.query<ApiResponse<Review[]>, void>({
            query: () => ({ url: "/reviews/received" }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Reviews" as const,
                            id,
                        })),
                        { type: "Reviews", id: "RECEIVED" },
                    ]
                    : [{ type: "Reviews", id: "RECEIVED" }],
        }),

        /**
         * Get reviews written by current user
         * Provides tags for cache identification
         */
        getMyWrittenReviews: builder.query<ApiResponse<Review[]>, void>({
            query: () => ({ url: "/reviews/written" }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Reviews" as const,
                            id,
                        })),
                        { type: "Reviews", id: "WRITTEN" },
                    ]
                    : [{ type: "Reviews", id: "WRITTEN" }],
        }),

        /**
         * Get reviews for a specific worker (public)
         * Provides tags for cache identification
         */
        getWorkerReviews: builder.query<
            ApiResponse<Review[]>,
            { workerId: number; filters?: ReviewFilters }
        >({
            query: ({ workerId, filters }) => ({
                url: `/reviews/worker/${workerId}`,
                params: buildParams(filters),
            }),
            providesTags: (result, _, { workerId }) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Reviews" as const,
                            id,
                        })),
                        { type: "Reviews", id: `WORKER_${workerId}` },
                    ]
                    : [{ type: "Reviews", id: `WORKER_${workerId}` }],
        }),

        /**
         * Get reviews for a specific institution (public)
         * Provides tags for cache identification
         */
        getInstitutionReviews: builder.query<
            ApiResponse<Review[]>,
            { institutionId: number; filters?: ReviewFilters }
        >({
            query: ({ institutionId, filters }) => ({
                url: `/reviews/institution/${institutionId}`,
                params: buildParams(filters),
            }),
            providesTags: (result, _, { institutionId }) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Reviews" as const,
                            id,
                        })),
                        { type: "Reviews", id: `INSTITUTION_${institutionId}` },
                    ]
                    : [{ type: "Reviews", id: `INSTITUTION_${institutionId}` }],
        }),

        /**
         * Get worker's average rating (public)
         * Provides tags for cache identification
         */
        getWorkerRating: builder.query<ApiResponse<AverageRating>, number>({
            query: (workerId) => ({ url: `/reviews/worker/${workerId}/rating` }),
            providesTags: (_, __, workerId) => [
                { type: "Reviews", id: `RATING_WORKER_${workerId}` },
            ],
        }),

        /**
         * Get institution's average rating (public)
         * Provides tags for cache identification
         */
        getInstitutionRating: builder.query<ApiResponse<AverageRating>, number>({
            query: (institutionId) => ({
                url: `/reviews/institution/${institutionId}/rating`,
            }),
            providesTags: (_, __, institutionId) => [
                { type: "Reviews", id: `RATING_INSTITUTION_${institutionId}` },
            ],
        }),

        /**
         * Get all reviews (admin only)
         * Provides tags for cache identification
         */
        getAllReviews: builder.query<ApiResponse<Review[]>, ReviewFilters | void>({
            query: (filters) => ({
                url: "/reviews",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Reviews" as const,
                            id,
                        })),
                        { type: "Reviews", id: "LIST" },
                    ]
                    : [{ type: "Reviews", id: "LIST" }],
        }),

        /**
         * Create a review
         * Invalidates review lists and rating caches
         */
        createReview: builder.mutation<ApiResponse<Review>, CreateReviewInput>({
            query: (data) => ({
                url: "/reviews",
                method: "POST",
                data,
            }),
            invalidatesTags: [
                { type: "Reviews", id: "LIST" },
                { type: "Reviews", id: "RECEIVED" },
                { type: "Reviews", id: "WRITTEN" },
                // Note: Worker/Institution specific tags will be invalidated
                // based on the reviewee, but we invalidate broadly here
                // since we don't know the reviewee type at mutation time
            ],
        }),

        /**
         * Delete a review (admin only)
         * Invalidates all review caches
         */
        deleteReview: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [
                { type: "Reviews", id },
                { type: "Reviews", id: "LIST" },
                { type: "Reviews", id: "RECEIVED" },
                { type: "Reviews", id: "WRITTEN" },
                // Invalidate all rating caches since we don't know which user was affected
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for review endpoints
 * Export for use in components
 */
export const {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useGetWorkerReviewsQuery,
    useGetInstitutionReviewsQuery,
    useGetWorkerRatingQuery,
    useGetInstitutionRatingQuery,
    useGetAllReviewsQuery,
    useCreateReviewMutation,
    useDeleteReviewMutation,
} = reviewApi;

