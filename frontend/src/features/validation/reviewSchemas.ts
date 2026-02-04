/**
 * Review Validation Schemas
 * Zod schemas for review-related forms and API inputs
 */

import { z } from "zod";
import {
    positiveIntSchema,
    ratingSchema,
    safeStringSchema,
    paginationSchema,
    sortOrderSchema,
} from "./commonSchemas";

// CREATE REVIEW SCHEMA


/**
 * Create review input schema
 * Note: revieweeId is determined automatically by the backend based on the assignment
 */
export const createReviewSchema = z.object({
    missionAssignmentId: positiveIntSchema,
    rating: ratingSchema,
    comment: safeStringSchema.max(2000, "Comment must be 2000 characters or less").optional(),
});

// DELETE REVIEW SCHEMA (ADMIN)


/**
 * Delete review input schema (requires reason)
 */
export const deleteReviewSchema = z.object({
    reason: safeStringSchema.min(1, "Reason is required for deleting a review"),
});

// REVIEW FILTER SCHEMA


/**
 * Review filter schema
 */
export const reviewFilterSchema = z
    .object({
        missionAssignmentId: positiveIntSchema.optional(),
        reviewerId: positiveIntSchema.optional(),
        revieweeId: positiveIntSchema.optional(),
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
        sortBy: z.enum(["createdAt", "rating"]).optional(),
        sortOrder: sortOrderSchema.optional(),
    })
    .merge(paginationSchema)
    .refine(
        (data) => {
            if (data.minRating !== undefined && data.maxRating !== undefined) {
                return data.maxRating >= data.minRating;
            }
            return true;
        },
        {
            message: "maxRating must be greater than or equal to minRating",
            path: ["maxRating"],
        }
    );

/**
 * Get worker reviews filter schema
 */
export const workerReviewsFilterSchema = z
    .object({
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
    })
    .merge(paginationSchema);

/**
 * Get institution reviews filter schema
 */
export const institutionReviewsFilterSchema = z
    .object({
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
    })
    .merge(paginationSchema);

// TYPE EXPORTS


export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
export type ReviewFilters = z.infer<typeof reviewFilterSchema>;
export type WorkerReviewsFilters = z.infer<typeof workerReviewsFilterSchema>;
export type InstitutionReviewsFilters = z.infer<typeof institutionReviewsFilterSchema>;

