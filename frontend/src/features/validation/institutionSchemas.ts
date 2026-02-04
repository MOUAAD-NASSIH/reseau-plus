/**
 * Institution Validation Schemas
 * Zod schemas for institution-related forms and API inputs
 */

import { z } from "zod";
import {
    safeStringSchema,
    latitudeSchema,
    longitudeSchema,
    paginationSchema,
} from "./commonSchemas";

// UPDATE INSTITUTION PROFILE SCHEMA


/**
 * Update institution profile input schema
 */
export const updateInstitutionProfileSchema = z.object({
    institutionName: safeStringSchema.min(2, "Institution name must be at least 2 characters").optional(),
    address: safeStringSchema.optional().nullable(),
    city: safeStringSchema.optional().nullable(),
    latitude: latitudeSchema.optional().nullable(),
    longitude: longitudeSchema.optional().nullable(),
});

// INSTITUTION FILTER SCHEMA


/**
 * Institution filter schema
 */
export const institutionFilterSchema = z
    .object({
        city: safeStringSchema.optional(),
        search: safeStringSchema.optional(),
    })
    .merge(paginationSchema);

// TYPE EXPORTS


export type UpdateInstitutionProfileInput = z.infer<typeof updateInstitutionProfileSchema>;
export type InstitutionFilters = z.infer<typeof institutionFilterSchema>;

