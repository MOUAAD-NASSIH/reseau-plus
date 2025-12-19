import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerWorkerSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(2, "Address must be at least 2 characters"),
    gender: z.enum(["MALE", "FEMALE"]),
    birthDate: z.date({ error: "Birth date is required" }),
});

export const registerInstitutionSchema = z.object({
    institution_name: z.string().min(2, "Institution name must be at least 2 characters"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(2, "Address must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterWorkerSchema = z.infer<typeof registerWorkerSchema>;
export type RegisterInstitutionSchema = z.infer<typeof registerInstitutionSchema>;