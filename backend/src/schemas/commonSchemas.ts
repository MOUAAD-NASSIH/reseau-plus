/**
 * Common Zod Validation Schemas
 */

import { z } from "zod";

/**
 * Rating validator (1-5)
 */
export const ratingSchema = z.number()
    .int({ message: "Rating must be an integer" })
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" });

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
