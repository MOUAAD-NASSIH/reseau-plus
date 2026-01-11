/**
 * Review Validation Schemas
 */

import { z } from "zod";
import { idParamSchema, ratingSchema, safeStringSchema, sortOrderSchema } from "./commonSchemas";

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
    body: z.object({
        missionAssignmentId: z.coerce.number().int().positive({ message: "Mission assignment ID is required" }),
        rating: ratingSchema,
        comment: safeStringSchema.max(2000).optional(),
    }),
});

/**
 * Get reviews for worker schema
 */
export const getWorkerReviewsSchema = z.object({
    params: z.object({
        workerId: z.coerce.number().int().positive({ message: "Worker ID is required" }),
    }),
    query: z.object({
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Get reviews for institution schema
 */
export const getInstitutionReviewsSchema = z.object({
    params: idParamSchema,
    query: z.object({
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Delete review schema (admin)
 */
export const deleteReviewSchema = z.object({
    params: idParamSchema,
    body: z.object({
        reason: safeStringSchema.min(1, { message: "Reason is required for deleting a review" }),
    }),
});

/**
 * Get worker rating schema
 */
export const getWorkerRatingSchema = z.object({
    params: z.object({
        workerId: z.coerce.number().int().positive({ message: "Worker ID must be a positive integer" }),
    }),
});

/**
 * Get institution rating schema
 */
export const getInstitutionRatingSchema = z.object({
    params: idParamSchema,
});

/**
 * Review filter schema
 */
export const reviewFilterSchema = z.object({
    query: z.object({
        missionAssignmentId: z.coerce.number().int().positive().optional(),
        reviewerId: z.coerce.number().int().positive().optional(),
        revieweeId: z.coerce.number().int().positive().optional(),
        minRating: ratingSchema.optional(),
        maxRating: ratingSchema.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
        sortOrder: sortOrderSchema,
    }).refine(
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
    ),
});
