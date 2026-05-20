/**
 * Payment Validation Schemas
 */

import { z } from "zod";
import { idParamSchema, sortOrderSchema } from "./commonSchemas";

/**
 * Payment status enum
 */
export const paymentStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED']);

/**
 * Create payment intent schema
 */
export const createPaymentIntentSchema = z.object({
    body: z.object({
        assignmentId: z.coerce.number().int().positive({ message: "Assignment ID is required" }),
    }),
});

/**
 * Get payment by ID schema
 */
export const getPaymentSchema = z.object({
    params: idParamSchema,
});

/**
 * Payment filter schema
 */
export const paymentFilterSchema = z.object({
    query: z.object({
        status: paymentStatusEnum.optional(),
        institutionId: z.coerce.number().int().positive().optional(),
        workerId: z.coerce.number().int().positive().optional(),
        missionAssignmentId: z.coerce.number().int().positive().optional(),
        paidAfter: z.coerce.date().optional(),
        paidBefore: z.coerce.date().optional(),
        minAmount: z.coerce.number().positive().optional(),
        maxAmount: z.coerce.number().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt', 'paidAt', 'amountTotal']).default('createdAt'),
        sortOrder: sortOrderSchema,
    }).refine(
        (data) => {
            if (data.paidAfter && data.paidBefore) {
                return data.paidBefore >= data.paidAfter;
            }
            return true;
        },
        {
            message: "paidBefore must be after or equal to paidAfter",
            path: ["paidBefore"],
        }
    ).refine(
        (data) => {
            if (data.minAmount && data.maxAmount) {
                return data.maxAmount >= data.minAmount;
            }
            return true;
        },
        {
            message: "maxAmount must be greater than or equal to minAmount",
            path: ["maxAmount"],
        }
    ),
});

/**
 * Calculate fees schema
 */
export const calculateFeesSchema = z.object({
    body: z.object({
        amount: z.coerce.number().positive({ message: "Amount must be a positive number" }),
    }),
});
