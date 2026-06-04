import { z } from "zod";

export const workerAccountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const workerPersonalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.date().refine((d) => !!d, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
});

export const workerProfessionalSchema = z.object({
  specialityId: z.number().min(1, "Primary speciality is required"),
  experienceYears: z.number().int().min(0, "Years of experience cannot be negative"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000, "Bio cannot exceed 2000 characters"),
  domainIds: z.array(z.number()).min(1, "Please select at least one domain of intervention"),
});

export const workerTermsSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type WorkerAccountForm = z.infer<typeof workerAccountSchema>;
export type WorkerPersonalForm = z.infer<typeof workerPersonalSchema>;
export type WorkerProfessionalForm = z.infer<typeof workerProfessionalSchema>;
export type WorkerTermsForm = z.infer<typeof workerTermsSchema>;
