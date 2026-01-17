/**
 * Admin Validation Schemas
 */

import { z } from "zod";
import { idParamSchema, safeStringSchema, sortOrderSchema } from "./commonSchemas";
import { workerStatusEnum, documentTypeEnum } from "./workerSchemas";

/**
 * User status enum
 */
export const userStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']);

/**
 * Document status enum
 */
export const documentStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

/**
 * Admin action type enum
 */
export const adminActionTypeEnum = z.enum([
    'WORKER_VERIFIED',
    'WORKER_REJECTED',
    'DOCUMENT_APPROVED',
    'DOCUMENT_REJECTED',
    'USER_SUSPENDED',
    'USER_BANNED',
    'USER_ACTIVATED',
    'REVIEW_DELETED',
    'MISSION_CANCELLED',
]);

/**
 * Verify worker schema
 */
export const verifyWorkerSchema = z.object({
    params: idParamSchema,
    body: z.object({
        status: z.enum(['VERIFIED', 'REJECTED']),
        reason: safeStringSchema.optional(),
    }).refine(
        (data) => {
            if (data.status === 'REJECTED') {
                return !!data.reason && data.reason.trim().length > 0;
            }
            return true;
        },
        {
            message: "Reason is required when rejecting a worker",
            path: ["reason"],
        }
    ),
});

/**
 * Review document schema
 */
export const reviewDocumentSchema = z.object({
    params: idParamSchema,
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        comment: safeStringSchema.optional(),
    }),
});

/**
 * Update user status schema
 */
export const updateUserStatusSchema = z.object({
    params: idParamSchema,
    body: z.object({
        status: userStatusEnum,
        reason: safeStringSchema.min(1, { message: "Reason is required for status change" }),
    }),
});

/**
 * Admin log filter schema
 */
export const adminLogFilterSchema = z.object({
    query: z.object({
        adminId: z.coerce.number().int().positive().optional(),
        actionType: adminActionTypeEnum.optional(),
        targetUserId: z.coerce.number().int().positive().optional(),
        createdAfter: z.coerce.date().optional(),
        createdBefore: z.coerce.date().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt', 'actionType']).default('createdAt'),
        sortOrder: sortOrderSchema,
    }).refine(
        (data) => {
            if (data.createdAfter && data.createdBefore) {
                return data.createdBefore >= data.createdAfter;
            }
            return true;
        },
        {
            message: "createdBefore must be after or equal to createdAfter",
            path: ["createdBefore"],
        }
    ),
});

/**
 * Payment summary filter schema
 */
export const paymentSummaryFilterSchema = z.object({
    query: z.object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
    }).refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.endDate >= data.startDate;
            }
            return true;
        },
        {
            message: "End date must be after or equal to start date",
            path: ["endDate"],
        }
    ),
});

/**
 * Pending workers filter schema
 */
export const pendingWorkersFilterSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Pending documents filter schema
 */
export const pendingDocumentsFilterSchema = z.object({
    query: z.object({
        type: documentTypeEnum.optional(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ALL']).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Admin missions filter schema
 */
export const adminMissionsFilterSchema = z.object({
    query: z.object({
        status: z.enum(['OPEN', 'ONGOING', 'CLOSED', 'CANCELLED']).optional(),
        institutionId: z.coerce.number().int().positive().optional(),
        urgency: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
        startDateFrom: z.coerce.date().optional(),
        startDateTo: z.coerce.date().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Admin assignments filter schema
 */
export const adminAssignmentsFilterSchema = z.object({
    query: z.object({
        status: z.enum(['ACTIVE', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
        workerId: z.coerce.number().int().positive().optional(),
        institutionId: z.coerce.number().int().positive().optional(),
        missionId: z.coerce.number().int().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Admin reviews filter schema
 */
export const adminReviewsFilterSchema = z.object({
    query: z.object({
        minRating: z.coerce.number().int().min(1).max(5).optional(),
        maxRating: z.coerce.number().int().min(1).max(5).optional(),
        reviewerId: z.coerce.number().int().positive().optional(),
        revieweeId: z.coerce.number().int().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

/**
 * Admin payments filter schema
 */
export const adminPaymentsFilterSchema = z.object({
    query: z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
        institutionId: z.coerce.number().int().positive().optional(),
        workerId: z.coerce.number().int().positive().optional(),
        minAmount: z.coerce.number().positive().optional(),
        maxAmount: z.coerce.number().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});
