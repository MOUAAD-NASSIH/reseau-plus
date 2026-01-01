/**
 * Assignment Validation Schemas
 */

import { z } from "zod";
import { idParamSchema, sortOrderSchema } from "./commonSchemas";

/**
 * Assignment status enum
 */
export const assignmentStatusEnum = z.enum(['ACTIVE', 'ONGOING', 'COMPLETED', 'CANCELLED']);

/**
 * Update assignment status schema
 */
export const updateAssignmentStatusSchema = z.object({
    params: idParamSchema,
    body: z.object({
        status: assignmentStatusEnum,
    }),
});

/**
 * Get assignment by ID schema
 */
export const getAssignmentSchema = z.object({
    params: idParamSchema,
});

/**
 * Assignment filter schema
 */
export const assignmentFilterSchema = z.object({
    query: z.object({
        status: assignmentStatusEnum.optional(),
        missionId: z.coerce.number().int().positive().optional(),
        workerId: z.coerce.number().int().positive().optional(),
        institutionId: z.coerce.number().int().positive().optional(),
        assignedAfter: z.coerce.date().optional(),
        assignedBefore: z.coerce.date().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['assignedAt', 'status']).default('assignedAt'),
        sortOrder: sortOrderSchema,
    }).refine(
        (data) => {
            if (data.assignedAfter && data.assignedBefore) {
                return data.assignedBefore >= data.assignedAfter;
            }
            return true;
        },
        {
            message: "assignedBefore must be after or equal to assignedAfter",
            path: ["assignedBefore"],
        }
    ),
});
