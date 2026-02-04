/**
 * Common Zod Validation Schemas
 */

import { z } from "zod";

/**
 * Custom date range validator
 * Validates that endDate is after startDate
 */
export const dateRangeSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
}).refine(
    (data) => data.endDate > data.startDate,
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

/**
 * Optional date range validator (both dates optional but validated if present)
 */
export const optionalDateRangeSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
        }
        return true;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

/**
 * Rating validator (1-5)
 */
export const ratingSchema = z.number()
    .int({ message: "Rating must be an integer" })
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" });

/**
 * Positive number validator
 */
export const positiveNumberSchema = z.number()
    .positive({ message: "Value must be positive" });

/**
 * Budget validator (positive decimal)
 */
export const budgetSchema = z.number()
    .positive({ message: "Budget must be positive" })
    .multipleOf(0.01, { message: "Budget must have at most 2 decimal places" });

/**
 * Experience years validator (non-negative integer)
 */
export const experienceYearsSchema = z.number()
    .int({ message: "Experience years must be an integer" })
    .min(0, { message: "Experience years must be non-negative" });

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive({ message: "ID must be a positive integer" }),
});

/**
 * Email schema with sanitization
 */
export const emailSchema = z.string()
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .trim();

/**
 * Password schema
 */
export const passwordSchema = z.string()
    .min(6, { message: "Password must be at least 6 characters long" });

/**
 * Safe string schema (sanitized)
 */
export const safeStringSchema = z.string().trim();

/**
 * Sanitize string helper (for use after validation)
 */
export function sanitizeString(val: string): string {
    return val.replace(/[<>]/g, '');
}

/**
 * Coordinate schema (latitude/longitude)
 */
export const latitudeSchema = z.number()
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" });

export const longitudeSchema = z.number()
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" });

/**
 * Zip code schema
 */
export const zipCodeSchema = z.string()
    .min(3, { message: "Zip code must be at least 3 characters" })
    .max(20, { message: "Zip code must be at most 20 characters" })
    .trim();

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Validate date range helper function
 * Can be used for standalone validation
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
    return endDate > startDate;
}
