/**
 * Application Validation Schemas
 */

import { z } from "zod";
import { idParamSchema } from "./commonSchemas";

/**
 * Application status enum
 */
export const applicationStatusEnum = z.enum(['SUBMITTED', 'REJECTED', 'ACCEPTED']);

/**
 * Apply to mission schema
 */
export const applyToMissionSchema = z.object({
    body: z.object({
        missionId: z.coerce.number().int().positive({ message: "Mission ID is required" }),
    }),
});

/**
 * Get applications for mission schema
 */
export const getApplicationsForMissionSchema = z.object({
    params: z.object({
        missionId: z.coerce.number().int().positive({ message: "Mission ID is required" }),
    }),
    query: z.object({
        status: applicationStatusEnum.optional(),
        specialityId: z.coerce.number().int().positive().optional(),
        domainId: z.coerce.number().int().positive().optional(),
        minExperience: z.coerce.number().int().min(0).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Accept/Reject application schema
 */
export const updateApplicationStatusSchema = z.object({
    params: idParamSchema,
});

/**
 * Get my applications schema (for workers)
 */
export const getMyApplicationsSchema = z.object({
    query: z.object({
        status: applicationStatusEnum.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});
