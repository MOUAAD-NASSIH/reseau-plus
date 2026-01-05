/**
 * Worker Validation Schemas
 * Zod schemas for worker-related forms and API inputs
 */

import { z } from "zod";
import {
    safeStringSchema,
    positiveIntSchema,
    latitudeSchema,
    longitudeSchema,
    zipCodeSchema,
    experienceYearsSchema,
    dateStringSchema,
    paginationSchema,
} from "./commonSchemas";

// ============================================
// ENUM SCHEMAS
// ============================================

/**
 * Worker status enum schema
 */
export const workerStatusSchema = z.enum(["PENDING", "VERIFIED", "REJECTED"]);

/**
 * Document type enum schema
 */
export const documentTypeSchema = z.enum(["DIPLOMA", "CV", "ID", "OTHER"]);

// ============================================
// UPDATE WORKER PROFILE SCHEMA
// ============================================

/**
 * Update worker profile input schema
 */
export const updateWorkerProfileSchema = z.object({
    firstName: safeStringSchema.min(1, "First name is required").optional(),
    lastName: safeStringSchema.min(1, "Last name is required").optional(),
    specialityId: positiveIntSchema.optional().nullable(),
    experienceYears: experienceYearsSchema.optional().nullable(),
    bio: safeStringSchema.max(2000, "Bio must be 2000 characters or less").optional().nullable(),
    city: safeStringSchema.max(100, "City must be 100 characters or less").optional().nullable(),
    zipCode: zipCodeSchema.optional().nullable(),
    latitude: latitudeSchema.optional().nullable(),
    longitude: longitudeSchema.optional().nullable(),
    birthDate: dateStringSchema.optional().nullable(),
    gender: safeStringSchema.max(20, "Gender must be 20 characters or less").optional().nullable(),
});

// ============================================
// WORKER AVAILABILITY SCHEMA
// ============================================

/**
 * Create worker availability input schema
 */
export const createAvailabilitySchema = z
    .object({
        startDate: dateStringSchema,
        endDate: dateStringSchema,
        isRecurring: z.boolean(),
    })
    .refine(
        (data) => new Date(data.endDate) > new Date(data.startDate),
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

/**
 * Update worker availability input schema
 */
export const updateAvailabilitySchema = z
    .object({
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional(),
        isRecurring: z.boolean().optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return new Date(data.endDate) > new Date(data.startDate);
            }
            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

// ============================================
// WORKER EXPERIENCE SCHEMA
// ============================================

/**
 * Create worker experience input schema
 */
export const createExperienceSchema = z
    .object({
        jobTitle: safeStringSchema.min(1, "Job title is required"),
        organization: safeStringSchema.min(1, "Organization is required"),
        startDate: dateStringSchema,
        endDate: dateStringSchema.optional().nullable(),
        description: safeStringSchema.max(2000, "Description must be 2000 characters or less").optional().nullable(),
    })
    .refine(
        (data) => {
            if (data.endDate) {
                return new Date(data.endDate) > new Date(data.startDate);
            }
            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

/**
 * Update worker experience input schema
 */
export const updateExperienceSchema = z
    .object({
        jobTitle: safeStringSchema.min(1, "Job title is required").optional(),
        organization: safeStringSchema.min(1, "Organization is required").optional(),
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional().nullable(),
        description: safeStringSchema.max(2000, "Description must be 2000 characters or less").optional().nullable(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return new Date(data.endDate) > new Date(data.startDate);
            }
            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

// ============================================
// DOCUMENT UPLOAD SCHEMA
// ============================================

/**
 * Document upload input schema
 */
export const documentUploadSchema = z.object({
    type: documentTypeSchema,
});

// ============================================
// DOMAIN MANAGEMENT SCHEMAS
// ============================================

/**
 * Add domain to worker schema
 */
export const addDomainSchema = z.object({
    domainId: positiveIntSchema,
});

// ============================================
// WORKER FILTER SCHEMA
// ============================================

/**
 * Worker filter schema
 */
export const workerFilterSchema = z
    .object({
        status: workerStatusSchema.optional(),
        specialityId: positiveIntSchema.optional(),
        city: safeStringSchema.optional(),
        domainId: positiveIntSchema.optional(),
        minExperience: experienceYearsSchema.optional(),
        maxExperience: experienceYearsSchema.optional(),
    })
    .merge(paginationSchema)
    .refine(
        (data) => {
            if (data.minExperience !== undefined && data.maxExperience !== undefined) {
                return data.maxExperience >= data.minExperience;
            }
            return true;
        },
        {
            message: "maxExperience must be greater than or equal to minExperience",
            path: ["maxExperience"],
        }
    );

// ============================================
// TYPE EXPORTS
// ============================================

export type WorkerStatus = z.infer<typeof workerStatusSchema>;
export type DocumentType = z.infer<typeof documentTypeSchema>;
export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type AddDomainInput = z.infer<typeof addDomainSchema>;
export type WorkerFilters = z.infer<typeof workerFilterSchema>;
