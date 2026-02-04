/**
 * Payment Validation Schemas
 * Zod schemas for payment-related forms and API inputs
 */

import { z } from "zod";
import {
    positiveIntSchema,
    positiveNumberSchema,
    dateStringSchema,
    paginationSchema,
    sortOrderSchema,
} from "./commonSchemas";

// ENUM SCHEMAS


/**
 * Payment status enum schema
 */
export const paymentStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED"]);

// CREATE PAYMENT INTENT SCHEMA


/**
 * Create payment intent input schema
 */
export const createPaymentIntentSchema = z.object({
    assignmentId: positiveIntSchema,
});

// CALCULATE FEES SCHEMA


/**
 * Calculate fees input schema
 */
export const calculateFeesSchema = z.object({
    amount: positiveNumberSchema,
});

// PAYMENT FILTER SCHEMA


/**
 * Payment filter schema
 */
export const paymentFilterSchema = z
    .object({
        status: paymentStatusSchema.optional(),
        institutionId: positiveIntSchema.optional(),
        workerId: positiveIntSchema.optional(),
        missionAssignmentId: positiveIntSchema.optional(),
        paidAfter: dateStringSchema.optional(),
        paidBefore: dateStringSchema.optional(),
        minAmount: positiveNumberSchema.optional(),
        maxAmount: positiveNumberSchema.optional(),
        sortBy: z.enum(["createdAt", "paidAt", "amountTotal"]).optional(),
        sortOrder: sortOrderSchema.optional(),
    })
    .merge(paginationSchema)
    .refine(
        (data) => {
            if (data.paidAfter && data.paidBefore) {
                return new Date(data.paidBefore) >= new Date(data.paidAfter);
            }
            return true;
        },
        {
            message: "paidBefore must be after or equal to paidAfter",
            path: ["paidBefore"],
        }
    )
    .refine(
        (data) => {
            if (data.minAmount !== undefined && data.maxAmount !== undefined) {
                return data.maxAmount >= data.minAmount;
            }
            return true;
        },
        {
            message: "maxAmount must be greater than or equal to minAmount",
            path: ["maxAmount"],
        }
    );

// TYPE EXPORTS


export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type CalculateFeesInput = z.infer<typeof calculateFeesSchema>;
export type PaymentFilters = z.infer<typeof paymentFilterSchema>;

