/**
 * Domain and Speciality Zod Validation Schemas
 */

import { z } from "zod";
import { safeStringSchema } from "./commonSchemas";

/**
 * Create Domain Schema
 */
export const createDomainSchema = z.object({
    body: z.object({
        name: safeStringSchema
            .min(1, { message: "Name is required" })
            .max(100, { message: "Name must be at most 100 characters" }),
        description: safeStringSchema.optional()
    })
});

/**
 * Update Domain Schema
 */
export const updateDomainSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive({ message: "ID must be a positive integer" })
    }),
    body: z.object({
        name: safeStringSchema
            .min(1, { message: "Name is required" })
            .max(100, { message: "Name must be at most 100 characters" })
            .optional(),
        description: safeStringSchema.optional()
    })
});

/**
 * Create Speciality Schema
 */
export const createSpecialitySchema = z.object({
    body: z.object({
        name: safeStringSchema
            .min(1, { message: "Name is required" })
            .max(100, { message: "Name must be at most 100 characters" }),
        description: safeStringSchema.optional()
    })
});

/**
 * Update Speciality Schema
 */
export const updateSpecialitySchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive({ message: "ID must be a positive integer" })
    }),
    body: z.object({
        name: safeStringSchema
            .min(1, { message: "Name is required" })
            .max(100, { message: "Name must be at most 100 characters" })
            .optional(),
        description: safeStringSchema.optional()
    })
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>["body"];
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>["body"];
export type CreateSpecialityInput = z.infer<typeof createSpecialitySchema>["body"];
export type UpdateSpecialityInput = z.infer<typeof updateSpecialitySchema>["body"];
