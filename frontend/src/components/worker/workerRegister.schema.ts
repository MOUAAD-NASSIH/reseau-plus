import { z } from "zod";

export const workerAccountSchema = z
  .object({
    email: z.string().email("Invalid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(8, "Confirmation password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const workerPersonalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.date().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
});

export const workerProfessionalSchema = z.object({
  specialityId: z.number().refine((v) => !!v, "Speciality is required"),
  experienceYears: z.number().int().min(0).optional(),
  bio: z.string().max(2000).optional(),
  domainIds: z.array(z.number()).optional(),
});

export const workerExperienceItemSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  organization: z.string().min(1, "Organization is required"),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const workerExperienceSchema = z.object({
  experiences: z.array(workerExperienceItemSchema).optional(),
});

export const workerDocumentsSchema = z.object({
  documents: z
    .array(
      z.object({
        type: z.enum(["DIPLOMA", "CV", "ID"]),
        file: z.instanceof(File),
      })
    )
    .refine(
      (docs) =>
        ["DIPLOMA", "CV", "ID"].every((t) => docs.some((d) => d.type === t)),
      {
        message: "Diploma, CV and ID are required",
      }
    ),
});

export type WorkerAccountForm = z.infer<typeof workerAccountSchema>;
export type WorkerPersonalForm = z.infer<typeof workerPersonalSchema>;
export type WorkerProfessionalForm = z.infer<typeof workerProfessionalSchema>;
export type WorkerExperienceForm = z.infer<typeof workerExperienceSchema>;
export type WorkerDocumentsForm = z.infer<typeof workerDocumentsSchema>;

