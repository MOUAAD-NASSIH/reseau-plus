/**
 * Application Validation Schemas
 * Zod schemas for mission application-related forms and API inputs
 */

import { z } from "zod";
import {
    positiveIntSchema,
    nonNegativeIntSchema,
    paginationSchema,
} from "./commonSchemas";

// ENUM SCHEMAS


/**
 * Application status enum schema
 */
export const applicationStatusSchema = z.enum(["SUBMITTED", "REJECTED", "ACCEPTED"]);

// CREATE APPLICATION SCHEMA


/**
 * Create application input schema (apply to mission)
 */
export const createApplicationSchema = z.object({
    missionId: positiveIntSchema,
});

// APPLICATION FILTER SCHEMA


/**
 * Application filter schema
 */
export const applicationFilterSchema = z
    .object({
        status: applicationStatusSchema.optional(),
        missionId: positiveIntSchema.optional(),
        workerId: positiveIntSchema.optional(),
        specialityId: positiveIntSchema.optional(),
        domainId: positiveIntSchema.optional(),
        minExperience: nonNegativeIntSchema.optional(),
    })
    .merge(paginationSchema);

/**
 * Get applications for mission filter schema
 */
export const missionApplicationsFilterSchema = z
    .object({
        status: applicationStatusSchema.optional(),
        specialityId: positiveIntSchema.optional(),
        domainId: positiveIntSchema.optional(),
        minExperience: nonNegativeIntSchema.optional(),
    })
    .merge(paginationSchema);

/**
 * Get my applications filter schema (for workers)
 */
export const myApplicationsFilterSchema = z
    .object({
        status: applicationStatusSchema.optional(),
    })
    .merge(paginationSchema);

// TYPE EXPORTS


export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ApplicationFilters = z.infer<typeof applicationFilterSchema>;
export type MissionApplicationsFilters = z.infer<typeof missionApplicationsFilterSchema>;
export type MyApplicationsFilters = z.infer<typeof myApplicationsFilterSchema>;

