/**
 * Review Service
 * API service for review and rating operations
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
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
        try {
            const response = await api.post<ApiResponse<Review>>("/reviews", data);
            toast.success("Review submitted successfully");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to submit review";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error submitting review");
            throw new Error("Unknown error submitting review");
        }
    },

    /**
     * Get reviews for a worker (public)
     */
    getWorkerReviews: async (
        workerId: number,
        filters?: ReviewFilters
    ): Promise<ApiResponse<Review[]>> => {
        try {
            const response = await api.get<ApiResponse<Review[]>>(
                `/reviews/worker/${workerId}${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch worker reviews";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching worker reviews");
            throw new Error("Unknown error fetching worker reviews");
        }
    },

    /**
     * Get reviews for an institution (public)
     */
    getInstitutionReviews: async (
        institutionId: number,
        filters?: ReviewFilters
    ): Promise<ApiResponse<Review[]>> => {
        try {
            const response = await api.get<ApiResponse<Review[]>>(
                `/reviews/institution/${institutionId}${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch institution reviews";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching institution reviews");
            throw new Error("Unknown error fetching institution reviews");
        }
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
        try {
            const response = await api.get<ApiResponse<Review[]>>("/reviews/received");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch received reviews";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching received reviews");
            throw new Error("Unknown error fetching received reviews");
        }
    },

    /**
     * Get reviews written by current user
     */
    getMyWrittenReviews: async (): Promise<ApiResponse<Review[]>> => {
        try {
            const response = await api.get<ApiResponse<Review[]>>("/reviews/written");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch written reviews";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching written reviews");
            throw new Error("Unknown error fetching written reviews");
        }
    },

    /**
     * Get worker's average rating (public)
     */
    getWorkerAverageRating: async (workerId: number): Promise<ApiResponse<AverageRating>> => {
        try {
            const response = await api.get<ApiResponse<AverageRating>>(
                `/reviews/worker/${workerId}/rating`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch worker rating";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching worker rating");
            throw new Error("Unknown error fetching worker rating");
        }
    },

    /**
     * Get institution's average rating (public)
     */
    getInstitutionAverageRating: async (institutionId: number): Promise<ApiResponse<AverageRating>> => {
        try {
            const response = await api.get<ApiResponse<AverageRating>>(
                `/reviews/institution/${institutionId}/rating`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch institution rating";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching institution rating");
            throw new Error("Unknown error fetching institution rating");
        }
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
        try {
            const response = await api.get<ApiResponse<Review[]>>(
                `/reviews${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch reviews";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching reviews");
            throw new Error("Unknown error fetching reviews");
        }
    },

    /**
     * Delete a review (admin only)
     */
    delete: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/reviews/${id}`);
            toast.success("Review deleted");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to delete review";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error deleting review");
            throw new Error("Unknown error deleting review");
        }
    },
};
