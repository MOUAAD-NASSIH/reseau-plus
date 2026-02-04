/**
 * Worker Validation Schemas
 */

import { z } from "zod";
import {
    safeStringSchema,
    experienceYearsSchema,
    latitudeSchema,
    longitudeSchema,
    zipCodeSchema,
    idParamSchema,
    paginationSchema
} from "./commonSchemas";

/**
 * Worker status enum
 */
export const workerStatusEnum = z.enum(['PENDING', 'VERIFIED', 'REJECTED']);

/**
 * Document type enum
 */
export const documentTypeEnum = z.enum(['DIPLOMA', 'CV', 'ID', 'OTHER']);

/**
 * Update worker profile schema
 */
export const updateWorkerProfileSchema = z.object({
    body: z.object({
        firstName: safeStringSchema.min(1).optional(),
        lastName: safeStringSchema.min(1).optional(),
        profilePicture: safeStringSchema.max(500).optional().nullable(),
        specialityId: z.coerce.number().int().positive().optional().nullable(),
        experienceYears: experienceYearsSchema.optional().nullable(),
        bio: safeStringSchema.max(2000).optional().nullable(),
        city: safeStringSchema.max(100).optional().nullable(),
        zipCode: zipCodeSchema.optional().nullable(),
        latitude: latitudeSchema.optional().nullable(),
        longitude: longitudeSchema.optional().nullable(),
        birthDate: z.coerce.date().optional().nullable(),
        gender: safeStringSchema.max(20).optional().nullable(),
        domainIds: z.array(z.number().int().positive()).optional(),
    }),
});

/**
 * Worker availability schema
 */
export const availabilitySchema = z.object({
    body: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        status: z.enum(['available', 'blocked']).optional().default('available'),
        isRecurring: z.boolean().default(false),
    }).refine(
        (data) => data.endDate > data.startDate,
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    ),
});

/**
 * Update availability schema
 */
export const updateAvailabilitySchema = z.object({
    params: idParamSchema,
    body: z.object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        status: z.enum(['available', 'blocked']).optional(),
        isRecurring: z.boolean().optional(),
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
    ),
});

/**
 * Worker experience schema
 */
export const experienceSchema = z.object({
    body: z.object({
        jobTitle: safeStringSchema.min(1, { message: "Job title is required" }),
        organization: safeStringSchema.min(1, { message: "Organization is required" }),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional().nullable(),
        description: safeStringSchema.max(2000).optional().nullable(),
    }).refine(
        (data) => {
            if (data.endDate) {
                return data.endDate > data.startDate;
            }
            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    ),
});

/**
 * Update experience schema
 */
export const updateExperienceSchema = z.object({
    params: idParamSchema,
    body: z.object({
        jobTitle: safeStringSchema.min(1).optional(),
        organization: safeStringSchema.min(1).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional().nullable(),
        description: safeStringSchema.max(2000).optional().nullable(),
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
    ),
});

/**
 * Document upload schema
 */
export const documentUploadSchema = z.object({
    body: z.object({
        type: documentTypeEnum,
    }),
});

/**
 * Add domain schema
 */
export const addDomainSchema = z.object({
    body: z.object({
        domainId: z.coerce.number().int().positive({ message: "Domain ID is required" }),
    }),
});

/**
 * Remove domain schema
 */
export const removeDomainSchema = z.object({
    params: idParamSchema,
});

/**
 * Worker filter schema
 */
export const workerFilterSchema = z.object({
    query: z.object({
        status: workerStatusEnum.optional(),
        specialityId: z.coerce.number().int().positive().optional(),
        city: safeStringSchema.optional(),
        domainId: z.coerce.number().int().positive().optional(),
        minExperience: experienceYearsSchema.optional(),
        maxExperience: experienceYearsSchema.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }).refine(
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
    ),
});

/**
 * Get worker by ID schema
 */
export const getWorkerSchema = z.object({
    params: idParamSchema,
});

/**
 * Delete experience/availability schema
 */
export const deleteResourceSchema = z.object({
    params: idParamSchema,
});
