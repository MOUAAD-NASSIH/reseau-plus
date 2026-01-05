/**
 * Review Hooks
 * React Query hooks for review operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/reviewService";
import type {
    Review,
    ReviewFilters,
    CreateReviewInput,
    AverageRating,
} from "@/types/review.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const reviewKeys = {
    all: ["reviews"] as const,
    lists: () => [...reviewKeys.all, "list"] as const,
    list: (filters?: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
    myReceived: () => [...reviewKeys.all, "received"] as const,
    myWritten: () => [...reviewKeys.all, "written"] as const,
    worker: (workerId: number, filters?: ReviewFilters) =>
        [...reviewKeys.all, "worker", workerId, filters] as const,
    institution: (institutionId: number, filters?: ReviewFilters) =>
        [...reviewKeys.all, "institution", institutionId, filters] as const,
    workerRating: (workerId: number) => [...reviewKeys.all, "rating", "worker", workerId] as const,
    institutionRating: (institutionId: number) =>
        [...reviewKeys.all, "rating", "institution", institutionId] as const,
};

/**
 * Hook to get reviews received by current user
 */
export function useMyReceivedReviews() {
    return useQuery({
        queryKey: reviewKeys.myReceived(),
        queryFn: async (): Promise<ApiResponse<Review[]>> => {
            return reviewService.getMyReceivedReviews();
        },
    });
}

/**
 * Hook to get reviews written by current user
 */
export function useMyWrittenReviews() {
    return useQuery({
        queryKey: reviewKeys.myWritten(),
        queryFn: async (): Promise<ApiResponse<Review[]>> => {
            return reviewService.getMyWrittenReviews();
        },
    });
}

/**
 * Combined hook for "my reviews" - returns both received and written
 */
export function useMyReviews() {
    const received = useMyReceivedReviews();
    const written = useMyWrittenReviews();

    return {
        received,
        written,
        isLoading: received.isLoading || written.isLoading,
        isError: received.isError || written.isError,
    };
}

/**
 * Hook to get reviews for a specific worker
 */
export function useWorkerReviews(workerId: number, filters?: ReviewFilters) {
    return useQuery({
        queryKey: reviewKeys.worker(workerId, filters),
        queryFn: async (): Promise<ApiResponse<Review[]>> => {
            return reviewService.getWorkerReviews(workerId, filters);
        },
        enabled: !!workerId,
    });
}

/**
 * Hook to get reviews for a specific institution
 */
export function useInstitutionReviews(institutionId: number, filters?: ReviewFilters) {
    return useQuery({
        queryKey: reviewKeys.institution(institutionId, filters),
        queryFn: async (): Promise<ApiResponse<Review[]>> => {
            return reviewService.getInstitutionReviews(institutionId, filters);
        },
        enabled: !!institutionId,
    });
}

/**
 * Hook to get worker's average rating
 */
export function useWorkerRating(workerId: number) {
    return useQuery({
        queryKey: reviewKeys.workerRating(workerId),
        queryFn: async (): Promise<ApiResponse<AverageRating>> => {
            return reviewService.getWorkerAverageRating(workerId);
        },
        enabled: !!workerId,
    });
}

/**
 * Hook to get institution's average rating
 */
export function useInstitutionRating(institutionId: number) {
    return useQuery({
        queryKey: reviewKeys.institutionRating(institutionId),
        queryFn: async (): Promise<ApiResponse<AverageRating>> => {
            return reviewService.getInstitutionAverageRating(institutionId);
        },
        enabled: !!institutionId,
    });
}

/**
 * Hook to get all reviews (admin)
 */
export function useAllReviews(filters?: ReviewFilters) {
    return useQuery({
        queryKey: reviewKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Review[]>> => {
            return reviewService.getAll(filters);
        },
    });
}

/**
 * Hook to create a review
 */
export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateReviewInput): Promise<ApiResponse<Review>> => {
            return reviewService.create(data);
        },
        onSuccess: () => {
            // Invalidate review lists
            queryClient.invalidateQueries({ queryKey: reviewKeys.myWritten() });
            queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
        },
    });
}

/**
 * Hook to delete a review (admin)
 */
export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return reviewService.delete(id);
        },
        onSuccess: () => {
            // Invalidate all review lists
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
        },
    });
}
