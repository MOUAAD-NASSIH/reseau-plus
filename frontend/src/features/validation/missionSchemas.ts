/**
 * Mission Validation Schemas
 * Zod schemas for mission-related forms and API inputs
 */

import { z } from "zod";
import {
    safeStringSchema,
    positiveNumberSchema,
    positiveIntSchema,
    dateStringSchema,
    paginationSchema,
    sortOrderSchema,
} from "./commonSchemas";

// ============================================
// ENUM SCHEMAS
// ============================================

/**
 * Mission status enum schema
 */
export const missionStatusSchema = z.enum(["OPEN", "ONGOING", "CLOSED", "CANCELLED"]);

/**
 * Urgency enum schema
 */
export const urgencySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

// ============================================
// CREATE MISSION SCHEMA
// ============================================

/**
 * Create mission input schema
 */
export const createMissionSchema = z
    .object({
        title: safeStringSchema.min(3, "Title must be at least 3 characters"),
        description: safeStringSchema.optional(),
        startDate: dateStringSchema,
        endDate: dateStringSchema,
        requiredSpecialityId: positiveIntSchema.optional(),
        location: safeStringSchema.optional(),
        budget: positiveNumberSchema.optional(),
        urgency: urgencySchema,
        domainIds: z.array(positiveIntSchema).optional(),
    })
    .refine(
        (data) => new Date(data.endDate) > new Date(data.startDate),
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

// ============================================
// UPDATE MISSION SCHEMA
// ============================================

/**
 * Update mission input schema
 */
export const updateMissionSchema = z
    .object({
        title: safeStringSchema.min(3, "Title must be at least 3 characters").optional(),
        description: safeStringSchema.optional().nullable(),
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional(),
        requiredSpecialityId: positiveIntSchema.optional().nullable(),
        location: safeStringSchema.optional().nullable(),
        budget: positiveNumberSchema.optional().nullable(),
        urgency: urgencySchema.optional(),
        status: missionStatusSchema.optional(),
        domainIds: z.array(positiveIntSchema).optional(),
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
// MISSION FILTER SCHEMA
// ============================================

/**
 * Mission filter schema
 */
export const missionFilterSchema = z
    .object({
        status: missionStatusSchema.optional(),
        specialityId: positiveIntSchema.optional(),
        domainId: positiveIntSchema.optional(),
        urgency: urgencySchema.optional(),
        startDateFrom: dateStringSchema.optional(),
        startDateTo: dateStringSchema.optional(),
        endDateFrom: dateStringSchema.optional(),
        endDateTo: dateStringSchema.optional(),
        institutionId: positiveIntSchema.optional(),
        location: safeStringSchema.optional(),
        minBudget: positiveNumberSchema.optional(),
        maxBudget: positiveNumberSchema.optional(),
        sortBy: z.enum(["createdAt", "startDate", "endDate", "budget", "urgency"]).optional(),
        sortOrder: sortOrderSchema.optional(),
    })
    .merge(paginationSchema)
    .refine(
        (data) => {
            if (data.startDateFrom && data.startDateTo) {
                return new Date(data.startDateTo) >= new Date(data.startDateFrom);
            }
            return true;
        },
        {
            message: "startDateTo must be after or equal to startDateFrom",
            path: ["startDateTo"],
        }
    )
    .refine(
        (data) => {
            if (data.endDateFrom && data.endDateTo) {
                return new Date(data.endDateTo) >= new Date(data.endDateFrom);
            }
            return true;
        },
        {
            message: "endDateTo must be after or equal to endDateFrom",
            path: ["endDateTo"],
        }
    )
    .refine(
        (data) => {
            if (data.minBudget !== undefined && data.maxBudget !== undefined) {
                return data.maxBudget >= data.minBudget;
            }
            return true;
        },
        {
            message: "maxBudget must be greater than or equal to minBudget",
            path: ["maxBudget"],
        }
    );

// ============================================
// TYPE EXPORTS
// ============================================

export type MissionStatus = z.infer<typeof missionStatusSchema>;
export type Urgency = z.infer<typeof urgencySchema>;
export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
export type MissionFilters = z.infer<typeof missionFilterSchema>;
