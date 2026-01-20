/**
 * Notification Validation Schemas
 */

import { z } from "zod";
import { idParamSchema, sortOrderSchema } from "./commonSchemas";

/**
 * Notification type enum
 */
export const notificationTypeEnum = z.enum([
    'APPLICATION_SUBMITTED',
    'APPLICATION_ACCEPTED',
    'APPLICATION_REJECTED',
    'ASSIGNMENT_CREATED',
    'ASSIGNMENT_ACTIVE',
    'ASSIGNMENT_ONGOING',
    'ASSIGNMENT_COMPLETED',
    'ASSIGNMENT_CANCELLED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'PAYMENT_COMPLETED',
    'WORKER_VERIFIED',
    'WORKER_REJECTED',
    'DOCUMENT_APPROVED',
    'DOCUMENT_REJECTED',
    'REVIEW_RECEIVED',
    'GENERAL',
]);

/**
 * Mark notification as read schema
 */
export const markAsReadSchema = z.object({
    params: idParamSchema,
});

/**
 * Notification filter schema
 */
export const notificationFilterSchema = z.object({
    query: z.object({
        type: notificationTypeEnum.optional(),
        isRead: z.coerce.boolean().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt']).default('createdAt'),
        sortOrder: sortOrderSchema.default('desc'),
    }),
});
