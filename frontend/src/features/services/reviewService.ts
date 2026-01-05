/**
 * Review Service
 * API service for review and rating operations
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Review,
    CreateReviewInput,
    ReviewFilters,
    AverageRating,
} from "@/types/review.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: ReviewFilters): string => {
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

export const reviewService = {
    /**
     * Create a review (worker or institution)
     */
    create: async (data: CreateReviewInput): Promise<ApiResponse<Review>> => {
        const response = await api.post<ApiResponse<Review>>("/reviews", data);
        return response.data;
    },

    /**
     * Get reviews for a worker (public)
     */
    getWorkerReviews: async (
        workerId: number,
        filters?: ReviewFilters
    ): Promise<ApiResponse<Review[]>> => {
        const response = await api.get<ApiResponse<Review[]>>(
            `/reviews/worker/${workerId}${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get reviews for an institution (public)
     */
    getInstitutionReviews: async (
        institutionId: number,
        filters?: ReviewFilters
    ): Promise<ApiResponse<Review[]>> => {
        const response = await api.get<ApiResponse<Review[]>>(
            `/reviews/institution/${institutionId}${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get user's reviews (generic method)
     */
    getUserReviews: async (
        userId: number,
        userType: "worker" | "institution",
        filters?: ReviewFilters
    ): Promise<ApiResponse<Review[]>> => {
        if (userType === "worker") {
            return reviewService.getWorkerReviews(userId, filters);
        }
        return reviewService.getInstitutionReviews(userId, filters);
    },

    /**
     * Get reviews received by current user
     */
    getMyReceivedReviews: async (): Promise<ApiResponse<Review[]>> => {
        const response = await api.get<ApiResponse<Review[]>>("/reviews/received");
        return response.data;
    },

    /**
     * Get reviews written by current user
     */
    getMyWrittenReviews: async (): Promise<ApiResponse<Review[]>> => {
        const response = await api.get<ApiResponse<Review[]>>("/reviews/written");
        return response.data;
    },

    /**
     * Get worker's average rating (public)
     */
    getWorkerAverageRating: async (workerId: number): Promise<ApiResponse<AverageRating>> => {
        const response = await api.get<ApiResponse<AverageRating>>(
            `/reviews/worker/${workerId}/rating`
        );
        return response.data;
    },

    /**
     * Get institution's average rating (public)
     */
    getInstitutionAverageRating: async (institutionId: number): Promise<ApiResponse<AverageRating>> => {
        const response = await api.get<ApiResponse<AverageRating>>(
            `/reviews/institution/${institutionId}/rating`
        );
        return response.data;
    },

    /**
     * Get average rating (generic method)
     */
    getAverageRating: async (
        userId: number,
        userType: "worker" | "institution"
    ): Promise<ApiResponse<AverageRating>> => {
        if (userType === "worker") {
            return reviewService.getWorkerAverageRating(userId);
        }
        return reviewService.getInstitutionAverageRating(userId);
    },

    /**
     * Get all reviews (admin only)
     */
    getAll: async (filters?: ReviewFilters): Promise<ApiResponse<Review[]>> => {
        const response = await api.get<ApiResponse<Review[]>>(
            `/reviews${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Delete a review (admin only)
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/reviews/${id}`);
        return response.data;
    },
};
