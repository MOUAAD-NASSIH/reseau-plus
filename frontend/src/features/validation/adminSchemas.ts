import { z } from "zod";

/**
 * Admin Profile Update Schema
 * Minimal schema for admin profile updates
 */
export const updateAdminProfileSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
