/**
 * Authentication Validation Schemas
 */

import { z } from "zod";
import { emailSchema, latitudeSchema, longitudeSchema, passwordSchema, safeStringSchema, zipCodeSchema } from "./commonSchemas";

/**
 * Worker registration schema
 */
export const registerWorkerSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: passwordSchema,
        role: z.literal("worker").optional(),
        firstName: safeStringSchema.min(1, { message: "First name is required" }),
        lastName: safeStringSchema.min(1, { message: "Last name is required" }),
        specialityId: z.coerce.number().int().positive({ message: "Speciality ID is required" }),
        address: safeStringSchema.optional(),
        city: safeStringSchema.optional(),
        longitude: longitudeSchema.optional(),
        latitude: latitudeSchema.optional(),
        birthDate: z.coerce.date().optional(),
        zipCode: zipCodeSchema.optional(),
        gender: z.enum(['MALE', 'FEMALE']).optional(),
        experienceYears: z.coerce.number().int().min(0).optional(),
        bio: safeStringSchema.max(2000).optional(),
        domainIds: z.string().optional(),
        experiences: z.string().optional(),
    }),
});

/**
 * Institution registration schema
 */
export const registerInstitutionSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: passwordSchema,
        role: z.literal("institution").optional(),
        institutionName: safeStringSchema.min(1, { message: "Institution name is required" }),
        address: safeStringSchema.optional(),
        city: safeStringSchema.optional(),
        longitude: longitudeSchema.optional(),
        latitude: latitudeSchema.optional(),
    }),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, { message: "Password is required" }),
    }),
});

/**
 * Password reset request schema
 */
export const requestResetSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
});

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
    body: z.object({
        password: passwordSchema,
    }),
    query: z.object({
        token: z.string().min(1, { message: "Reset token is required" }),
    }),
});

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
    query: z.object({
        token: z.string().min(1, { message: "Verification token is required" }),
    }),
});
