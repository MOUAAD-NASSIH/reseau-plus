import { z } from "zod";

/* ===============================
   STEP 1 – ACCOUNT
================================ */
export const institutionAccountSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/* ===============================
   STEP 2 – INSTITUTION INFO
================================ */
export const institutionInfoSchema = z.object({
  institutionName: z.string().min(2, "Institution name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
});

export type InstitutionAccountForm = z.infer<typeof institutionAccountSchema>;
export type InstitutionInfoForm = z.infer<typeof institutionInfoSchema>;

