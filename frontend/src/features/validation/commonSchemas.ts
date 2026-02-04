/**
 * Common Validation Schemas
 * Shared validation schemas used across multiple domains
 */

import { z } from "zod";

// PRIMITIVE SCHEMAS
/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim();

/**
 * Password validation schema
 */
export const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters");

/**
 * Safe string schema (trimmed)
 */
export const safeStringSchema = z.string().trim();

/**
 * Positive integer schema
 */
export const positiveIntSchema = z
    .number()
    .int("Must be an integer")
    .positive("Must be a positive number");

/**
 * Non-negative integer schema
 */
export const nonNegativeIntSchema = z
    .number()
    .int("Must be an integer")
    .min(0, "Must be 0 or greater");

/**
 * Positive number schema (for decimals like budget)
 */
export const positiveNumberSchema = z
    .number({ message: "Please enter a valid amount" })
    .positive("Must be a positive number");


// COORDINATE SCHEMAS
/**
 * Latitude validation schema (-90 to 90)
 */
export const latitudeSchema = z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90");

/**
 * Longitude validation schema (-180 to 180)
 */
export const longitudeSchema = z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180");


// DATE SCHEMAS
/**
 * ISO date string schema (YYYY-MM-DD or full ISO)
 */
export const dateStringSchema = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date format" }
);

/**
 * Optional ISO date string schema
 */
export const optionalDateStringSchema = dateStringSchema.optional().nullable();


// PAGINATION SCHEMAS
/**
 * Page number schema (min 1)
 */
export const pageSchema = z
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1);

/**
 * Limit schema (1-100)
 */
export const limitSchema = z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10);

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

/**
 * Base pagination schema
 */
export const paginationSchema = z.object({
    page: pageSchema.optional(),
    limit: limitSchema.optional(),
});


// ID SCHEMAS
/**
 * ID parameter schema
 */
export const idSchema = positiveIntSchema;

/**
 * Optional ID schema
 */
export const optionalIdSchema = positiveIntSchema.optional().nullable();


// RATING SCHEMA
/**
 * Rating schema (1-5)
 */
export const ratingSchema = z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5");


// ZIP CODE SCHEMA
/**
 * Zip code schema
 */
export const zipCodeSchema = z
    .string()
    .min(3, "Zip code must be at least 3 characters")
    .max(20, "Zip code must be at most 20 characters")
    .trim();


// EXPERIENCE YEARS SCHEMA
/**
 * Experience years schema (0-50)
 */
export const experienceYearsSchema = z
    .number()
    .int("Experience years must be an integer")
    .min(0, "Experience years must be 0 or greater")
    .max(50, "Experience years must be 50 or less");


// TYPE EXPORTS
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;