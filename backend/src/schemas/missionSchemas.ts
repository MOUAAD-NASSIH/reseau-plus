/**
 * Mission Validation Schemas
 */

import { z } from "zod";
import {
    safeStringSchema,
    idParamSchema,
    budgetSchema,
    sortOrderSchema
} from "./commonSchemas";

/**
 * Urgency enum
 */
export const urgencyEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);

/**
 * Mission status enum
 */
export const missionStatusEnum = z.enum(['OPEN', 'ONGOING', 'CLOSED', 'CANCELLED']);

/**
 * Create mission schema
 */
export const createMissionSchema = z.object({
    body: z.object({
        title: safeStringSchema.min(3, { message: "Title must be at least 3 characters" }),
        description: safeStringSchema.optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        requiredSpecialityId: z.coerce.number().int().positive().optional(),
        location: safeStringSchema.optional(),
        budget: budgetSchema.optional(),
        urgency: urgencyEnum.default('MEDIUM'),
        domainIds: z.array(z.coerce.number().int().positive()).optional(),
    }).refine(
        (data) => data.endDate > data.startDate,
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    ),
});

/**
 * Update mission schema
 */
export const updateMissionSchema = z.object({
    params: idParamSchema,
    body: z.object({
        title: safeStringSchema.min(3).optional(),
        description: safeStringSchema.optional().nullable(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        requiredSpecialityId: z.coerce.number().int().positive().optional().nullable(),
        location: safeStringSchema.optional().nullable(),
        budget: budgetSchema.optional().nullable(),
        urgency: urgencyEnum.optional(),
        domainIds: z.array(z.coerce.number().int().positive()).optional(),
        status: missionStatusEnum.optional(),
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
 * Mission filter schema
 */
export const missionFilterSchema = z.object({
    query: z.object({
        status: missionStatusEnum.optional(),
        specialityId: z.coerce.number().int().positive().optional(),
        domainId: z.coerce.number().int().positive().optional(),
        urgency: urgencyEnum.optional(),
        startDateFrom: z.coerce.date().optional(),
        startDateTo: z.coerce.date().optional(),
        endDateFrom: z.coerce.date().optional(),
        endDateTo: z.coerce.date().optional(),
        location: safeStringSchema.optional(),
        minBudget: z.coerce.number().positive().optional(),
        maxBudget: z.coerce.number().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'budget', 'urgency']).default('createdAt'),
        sortOrder: sortOrderSchema,
    }).refine(
        (data) => {
            if (data.startDateFrom && data.startDateTo) {
                return data.startDateTo >= data.startDateFrom;
            }
            return true;
        },
        {
            message: "startDateTo must be after or equal to startDateFrom",
            path: ["startDateTo"],
        }
    ).refine(
        (data) => {
            if (data.endDateFrom && data.endDateTo) {
                return data.endDateTo >= data.endDateFrom;
            }
            return true;
        },
        {
            message: "endDateTo must be after or equal to endDateFrom",
            path: ["endDateTo"],
        }
    ).refine(
        (data) => {
            if (data.minBudget && data.maxBudget) {
                return data.maxBudget >= data.minBudget;
            }
            return true;
        },
        {
            message: "maxBudget must be greater than or equal to minBudget",
            path: ["maxBudget"],
        }
    ),
});

/**
 * Get mission by ID schema
 */
export const getMissionSchema = z.object({
    params: idParamSchema,
});

/**
 * Delete mission schema
 */
export const deleteMissionSchema = z.object({
    params: idParamSchema,
});
