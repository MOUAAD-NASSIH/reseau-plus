import { z } from "zod";

// ============================================
// LOGIN SCHEMA
// ============================================

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ============================================
// WORKER REGISTRATION SCHEMA
// ============================================

// Worker experience schema for nested validation
export const workerExperienceSchema = z.object({
    jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
    organization: z.string().min(2, "Organization must be at least 2 characters"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").nullable().optional(),
    description: z.string().optional(),
});

export const registerWorkerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    specialityId: z.number().int().positive("Speciality ID must be a positive integer").optional(),
    domainIds: z.array(z.number().int().positive()).optional(),
    experiences: z.array(workerExperienceSchema).optional(),
    experienceYears: z.number().int().min(0, "Experience years must be 0 or greater").max(50, "Experience years must be 50 or less").optional(),
    bio: z.string().max(1000, "Bio must be 1000 characters or less").optional(),
    city: z.string().min(2, "City must be at least 2 characters").optional(),
    zipCode: z.string().min(3, "Zip code must be at least 3 characters").max(20, "Zip code must be 20 characters or less").optional(),
    latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format").optional(),
    gender: z.string().optional(),
});

// ============================================
// INSTITUTION REGISTRATION SCHEMA
// ============================================

export const registerInstitutionSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    institutionName: z.string().min(2, "Institution name must be at least 2 characters"),
    address: z.string().min(2, "Address must be at least 2 characters").optional(),
    city: z.string().min(2, "City must be at least 2 characters").optional(),
    latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterWorkerSchema = z.infer<typeof registerWorkerSchema>;
export type RegisterInstitutionSchema = z.infer<typeof registerInstitutionSchema>;
export type WorkerExperienceSchema = z.infer<typeof workerExperienceSchema>;