/**
 * Assignment Validation Schemas
 * Zod schemas for mission assignment-related forms and API inputs
 */

import { z } from "zod";
import {
    positiveIntSchema,
    dateStringSchema,
    paginationSchema,
    sortOrderSchema,
} from "./commonSchemas";

// ENUM SCHEMAS


/**
 * Assignment status enum schema
 */
export const assignmentStatusSchema = z.enum(["ACTIVE", "ONGOING", "COMPLETED", "CANCELLED"]);

// CREATE ASSIGNMENT SCHEMA


/**
 * Create assignment input schema
 */
export const createAssignmentSchema = z.object({
    missionId: positiveIntSchema,
    workerId: positiveIntSchema,
    institutionId: positiveIntSchema,
});

// UPDATE ASSIGNMENT STATUS SCHEMA


/**
 * Update assignment status input schema
 */
export const updateAssignmentStatusSchema = z.object({
    status: assignmentStatusSchema,
});

// ASSIGNMENT FILTER SCHEMA


/**
 * Assignment filter schema
 */
export const assignmentFilterSchema = z
    .object({
        status: assignmentStatusSchema.optional(),
        missionId: positiveIntSchema.optional(),
        workerId: positiveIntSchema.optional(),
        institutionId: positiveIntSchema.optional(),
        assignedAfter: dateStringSchema.optional(),
        assignedBefore: dateStringSchema.optional(),
        sortBy: z.enum(["assignedAt", "status"]).optional(),
        sortOrder: sortOrderSchema.optional(),
    })
    .merge(paginationSchema)
    .refine(
        (data) => {
            if (data.assignedAfter && data.assignedBefore) {
                return new Date(data.assignedBefore) >= new Date(data.assignedAfter);
            }
            return true;
        },
        {
            message: "assignedBefore must be after or equal to assignedAfter",
            path: ["assignedBefore"],
        }
    );

// TYPE EXPORTS


export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentStatusInput = z.infer<typeof updateAssignmentStatusSchema>;
export type AssignmentFilters = z.infer<typeof assignmentFilterSchema>;

