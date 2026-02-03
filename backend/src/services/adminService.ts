/**
 * Admin Service
 */

import { prisma } from "../lib/prisma";
import { WorkerStatus, DocumentStatus, UserStatus } from "../types";
import { createNotification } from "./notificationService";
import {
    AdminActionType,
    AdminLogFilters,
    DashboardStats,
    DateRange,
} from "../types/admin.types";

// ============================================
// ADMIN LOGGING
// ============================================

/**
 * Create admin log entry
 */
export const createAdminLog = async (
    adminId: number,
    actionType: AdminActionType,
    targets: {
        targetUserId?: number;
        targetDocumentId?: number;
        targetReviewId?: number;
        targetMissionId?: number;
    },
    reason?: string
) => {
    return await prisma.adminLog.create({
        data: {
            adminId,
            actionType,
            targetUserId: targets.targetUserId,
            targetDocumentId: targets.targetDocumentId,
            targetReviewId: targets.targetReviewId,
            targetMissionId: targets.targetMissionId,
            reason,
        },
        include: {
            admin: { select: { id: true, email: true, profilePicture: true } },
            targetUser: { select: { id: true, email: true } },
            targetDocument: { select: { id: true, type: true } },
        },
    });
};

/**
 * Get admin logs with filters and pagination
 */
export const getAdminLogs = async (
    filters?: AdminLogFilters,
    page = 1,
    limit = 10
) => {
    const where: any = {};
    const skip = (page - 1) * limit;

    if (filters?.adminId) {
        where.adminId = filters.adminId;
    }
    if (filters?.actionType) {
        where.actionType = filters.actionType;
    }
    if (filters?.targetUserId) {
        where.targetUserId = filters.targetUserId;
    }
    if (filters?.createdAfter || filters?.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
            where.createdAt.gte = new Date(filters.createdAfter);
        }
        if (filters.createdBefore) {
            where.createdAt.lte = new Date(filters.createdBefore);
        }
    }

    const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
            where,
            include: {
                admin: { select: { id: true, email: true, profilePicture: true } },
                targetUser: {
                    select: {
                        id: true,
                        email: true,
                        profilePicture: true,
                        role: { select: { name: true } },
                        worker: { select: { firstName: true, lastName: true } },
                        institution: { select: { institutionName: true } }
                    }
                },
                targetDocument: { select: { id: true, type: true, workerId: true, fileUrl: true } },
                targetReview: { select: { id: true, rating: true } },
                targetMission: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.adminLog.count({ where }),
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (): Promise<DashboardStats> => {
    const [
        totalUsers,
        totalWorkers,
        totalInstitutions,
        pendingVerifications,
        pendingDocuments,
        totalMissions,
        activeMissions,
        completedMissions,
        ongoingMissions,
        cancelledMissions,
        totalAssignments,
        activeAssignments,
        completedAssignments,
        totalReviews,
        paymentStats,
        userStatusCounts,
        workerStatusCounts,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.worker.count(),
        prisma.institution.count(),
        prisma.worker.count({ where: { status: "PENDING" } }),
        prisma.workerDocument.count({ where: { status: "PENDING" } }),
        prisma.mission.count(),
        prisma.mission.count({ where: { status: "OPEN" } }),
        prisma.mission.count({ where: { status: "CLOSED" } }),
        prisma.mission.count({ where: { status: "ONGOING" } }),
        prisma.mission.count({ where: { status: "CANCELLED" } }),
        prisma.missionAssignment.count(),
        prisma.missionAssignment.count({ where: { status: "ACTIVE" } }),
        prisma.missionAssignment.count({ where: { status: "COMPLETED" } }),
        prisma.review.count(),
        prisma.payment.aggregate({
            where: {
                OR: [
                    { status: "COMPLETED" },
                    { stripePaymentId: { not: null } }
                ]
            },
            _count: true,
            _sum: { platformFee: true, amountTotal: true, workerAmount: true },
        }),
        prisma.user.groupBy({
            by: ["status"],
            _count: true,
        }),
        prisma.worker.groupBy({
            by: ["status"],
            _count: true,
        }),
    ]);

    return {
        totalUsers,
        totalWorkers,
        totalInstitutions,
        pendingVerifications,
        pendingDocuments,
        totalMissions,
        activeMissions,
        completedMissions,
        ongoingMissions,
        cancelledMissions,
        totalAssignments,
        activeAssignments,
        completedAssignments,
        totalReviews,
        totalPayments: paymentStats._count,
        totalRevenue: paymentStats._sum.platformFee || 0,
        totalPaymentAmount: paymentStats._sum.amountTotal || 0,
        totalWorkerPayouts: paymentStats._sum.workerAmount || 0,
        userStatusBreakdown: userStatusCounts.map((s) => ({
            status: s.status,
            count: s._count,
        })),
        workerStatusBreakdown: workerStatusCounts.map((s) => ({
            status: s.status,
            count: s._count,
        })),
    };
};

// ============================================
// WORKER VERIFICATION
// ============================================

/**
 * Get pending workers for verification
 */
export const getPendingWorkers = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [workers, total] = await Promise.all([
        prisma.worker.findMany({
            where: { status: "PENDING" },
            include: {
                user: { select: { id: true, email: true, createdAt: true, profilePicture: true } },
                speciality: { select: { id: true, name: true } },
                documents: {
                    select: {
                        id: true,
                        type: true,
                        fileUrl: true,
                        status: true,
                        uploadedAt: true,
                    },
                },
                domains: {
                    include: { domain: { select: { id: true, name: true } } },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "asc" },
        }),
        prisma.worker.count({ where: { status: "PENDING" } }),
    ]);

    return {
        workers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Verify worker (approve or reject)
 */
export const verifyWorker = async (
    workerId: number,
    status: WorkerStatus,
    adminId: number,
    reason?: string
) => {
    // Validate status is either VERIFIED or REJECTED
    if (status !== "VERIFIED" && status !== "REJECTED") {
        throw new Error("Invalid status. Must be VERIFIED or REJECTED");
    }

    // Require reason for rejection
    if (status === "REJECTED" && !reason) {
        throw new Error("Reason is required when rejecting a worker");
    }

    // Get worker with user info
    const existingWorker = await prisma.worker.findUnique({
        where: { id: workerId },
        include: { user: true },
    });

    if (!existingWorker) {
        throw new Error("Worker not found");
    }

    // Update worker status
    const worker = await prisma.worker.update({
        where: { id: workerId },
        data: {
            status,
            rejectionReason: status === "REJECTED" ? reason : null,
        },
        include: {
            user: { select: { id: true, email: true } },
            speciality: { select: { id: true, name: true } },
        },
    });

    // Create admin log
    const actionType: AdminActionType =
        status === "VERIFIED" ? "WORKER_VERIFIED" : "WORKER_REJECTED";

    await createAdminLog(
        adminId,
        actionType,
        { targetUserId: worker.user.id },
        reason
    );

    // Create notification for worker
    const notificationMessage =
        status === "VERIFIED"
            ? "Congratulations! Your profile has been verified. You can now apply to missions."
            : `Your profile verification was rejected. Reason: ${reason}`;

    await createNotification(
        worker.user.id,
        "PROFILE_VERIFICATION",
        notificationMessage
    );

    return worker;
};

// ============================================
// DOCUMENT REVIEW
// ============================================

/**
 * Get pending documents for review
 */
export const getPendingDocuments = async (
    page = 1,
    limit = 10,
    type?: string,
    status?: string
) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status && status === 'ALL') {
        // No status filter
    } else if (status) {
        where.status = status;
    } else {
        where.status = "PENDING";
    }

    if (type && type !== 'all') {
        where.type = type;
    }

    const [documents, total] = await Promise.all([
        prisma.workerDocument.findMany({
            where,
            include: {
                worker: {
                    include: {
                        user: { select: { id: true, email: true, profilePicture: true } },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { uploadedAt: "asc" },
        }),
        prisma.workerDocument.count({ where }),
    ]);

    return {
        documents,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Review document (approve or reject)
 */
export const reviewDocument = async (
    documentId: number,
    status: DocumentStatus,
    adminId: number,
    comment?: string
) => {
    // Validate status is either APPROVED or REJECTED
    if (status !== "APPROVED" && status !== "REJECTED") {
        throw new Error("Invalid status. Must be APPROVED or REJECTED");
    }

    // Get document with worker info
    const existingDocument = await prisma.workerDocument.findUnique({
        where: { id: documentId },
        include: {
            worker: {
                include: { user: true },
            },
        },
    });

    if (!existingDocument) {
        throw new Error("Document not found");
    }

    // Update document status
    const document = await prisma.workerDocument.update({
        where: { id: documentId },
        data: {
            status,
            adminComment: comment,
            reviewedAt: new Date(),
        },
        include: {
            worker: {
                include: {
                    user: { select: { id: true, email: true } },
                },
            },
        },
    });

    // Create admin log
    const actionType: AdminActionType =
        status === "APPROVED" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED";

    await createAdminLog(
        adminId,
        actionType,
        {
            targetDocumentId: documentId,
            targetUserId: document.worker.user.id,
        },
        comment
    );

    // Create notification for worker
    const notificationMessage =
        status === "APPROVED"
            ? `Your ${document.type} document has been approved.`
            : `Your ${document.type} document was rejected.${comment ? ` Reason: ${comment}` : ""}`;

    await createNotification(
        document.worker.user.id,
        "DOCUMENT_REVIEW",
        notificationMessage
    );

    return document;
};

// ============================================
// USER STATUS MANAGEMENT
// ============================================

/**
 * Update user status (suspend, ban, activate)
 */
export const updateUserStatus = async (
    userId: number,
    status: UserStatus,
    adminId: number,
    reason: string
) => {
    // Get user
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Update user status
    const user = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
            role: { select: { name: true } },
        },
    });

    // Determine action type
    let actionType: AdminActionType;
    switch (status) {
        case "SUSPENDED":
            actionType = "USER_SUSPENDED";
            break;
        case "BANNED":
            actionType = "USER_BANNED";
            break;
        case "ACTIVE":
            actionType = "USER_ACTIVATED";
            break;
        default:
            actionType = "USER_ACTIVATED";
    }

    // Create admin log
    await createAdminLog(adminId, actionType, { targetUserId: userId }, reason);

    // Create notification for user
    const notificationMessage =
        status === "ACTIVE"
            ? "Your account has been reactivated."
            : `Your account has been ${status.toLowerCase()}. Reason: ${reason}`;

    await createNotification(userId, "ACCOUNT_STATUS", notificationMessage);

    return user;
};

// ============================================
// PAYMENT SUMMARY
// ============================================

/**
 * Get payment summary for admin dashboard
 */
export const getPaymentSummary = async (dateRange?: DateRange) => {
    const where: any = {};
    if (dateRange) {
        where.createdAt = {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
        };
    }

    const effectiveWhere = {
        ...where,
        OR: [
            { status: "COMPLETED" },
            { stripePaymentId: { not: null } }
        ]
    };

    const [summary, statusBreakdown, recentPayments] = await Promise.all([
        prisma.payment.aggregate({
            where: effectiveWhere,
            _count: true,
            _sum: {
                amountTotal: true,
                platformFee: true,
                workerAmount: true,
            },
        }),
        prisma.payment.groupBy({
            by: ["status"],
            where: effectiveWhere,
            _count: true,
            _sum: { amountTotal: true },
        }),
        prisma.payment.findMany({
            where,
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                institution: { select: { institutionName: true } },
                missionAssignment: {
                    include: {
                        worker: {
                            select: { firstName: true, lastName: true },
                        },
                        mission: { select: { title: true } },
                    },
                },
            },
        }),
    ]);

    return {
        totalPayments: summary._count,
        totalAmount: summary._sum.amountTotal || 0,
        totalPlatformFee: summary._sum.platformFee || 0,
        totalWorkerAmount: summary._sum.workerAmount || 0,
        statusBreakdown: statusBreakdown.map((s) => ({
            status: s.status,
            count: s._count,
            totalAmount: s._sum.amountTotal || 0,
        })),
        recentPayments,
    };
};

// ============================================
// ADMIN VIEW ALL RESOURCES
// ============================================

/**
 * Get all missions with filters (admin view)
 */
export const getAllMissions = async (
    filters?: {
        status?: string;
        institutionId?: number;
        urgency?: string;
        startDateFrom?: string;
        startDateTo?: string;
    },
    page = 1,
    limit = 10
) => {
    const where: any = {};
    const skip = (page - 1) * limit;

    if (filters?.status) {
        where.status = filters.status;
    }
    if (filters?.institutionId) {
        where.institutionId = filters.institutionId;
    }
    if (filters?.urgency) {
        where.urgency = filters.urgency;
    }
    if (filters?.startDateFrom || filters?.startDateTo) {
        where.startDate = {};
        if (filters.startDateFrom) {
            where.startDate.gte = new Date(filters.startDateFrom);
        }
        if (filters.startDateTo) {
            where.startDate.lte = new Date(filters.startDateTo);
        }
    }

    const [missions, total] = await Promise.all([
        prisma.mission.findMany({
            where,
            include: {
                institution: {
                    select: { id: true, institutionName: true, city: true },
                },
                requiredSpeciality: { select: { id: true, name: true } },
                domains: { include: { domain: { select: { id: true, name: true } } } },
                _count: {
                    select: { applications: true, assignments: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.mission.count({ where }),
    ]);

    return {
        missions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get all assignments with filters (admin view)
 */
export const getAllAssignments = async (
    filters?: {
        status?: string;
        workerId?: number;
        institutionId?: number;
        missionId?: number;
    },
    page = 1,
    limit = 10
) => {
    const where: any = {};
    const skip = (page - 1) * limit;

    if (filters?.status) {
        where.status = filters.status;
    }
    if (filters?.workerId) {
        where.workerId = filters.workerId;
    }
    if (filters?.institutionId) {
        where.institutionId = filters.institutionId;
    }
    if (filters?.missionId) {
        where.missionId = filters.missionId;
    }

    const [assignments, total] = await Promise.all([
        prisma.missionAssignment.findMany({
            where,
            include: {
                mission: { select: { id: true, title: true, status: true } },
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: { select: { email: true } },
                    },
                },
                institution: {
                    select: {
                        id: true,
                        institutionName: true,
                        user: { select: { email: true } },
                    },
                },
                _count: { select: { reviews: true, payments: true } },
            },
            skip,
            take: limit,
            orderBy: { assignedAt: "desc" },
        }),
        prisma.missionAssignment.count({ where }),
    ]);

    return {
        assignments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get all reviews with filters (admin view)
 */
export const getAllReviews = async (
    filters?: {
        minRating?: number;
        maxRating?: number;
        reviewerId?: number;
        revieweeId?: number;
    },
    page = 1,
    limit = 10
) => {
    const where: any = {};
    const skip = (page - 1) * limit;

    if (filters?.minRating !== undefined) {
        where.rating = { ...where.rating, gte: filters.minRating };
    }
    if (filters?.maxRating !== undefined) {
        where.rating = { ...where.rating, lte: filters.maxRating };
    }
    if (filters?.reviewerId) {
        where.reviewerId = filters.reviewerId;
    }
    if (filters?.revieweeId) {
        where.revieweeId = filters.revieweeId;
    }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        worker: { select: { firstName: true, lastName: true } },
                        institution: { select: { institutionName: true } },
                    },
                },
                reviewee: {
                    select: {
                        id: true,
                        email: true,
                        worker: { select: { firstName: true, lastName: true } },
                        institution: { select: { institutionName: true } },
                    },
                },
                missionAssignment: {
                    include: {
                        mission: { select: { id: true, title: true } },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.review.count({ where }),
    ]);

    return {
        reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get all payments with filters (admin view)
 */
export const getAllPayments = async (
    filters?: {
        status?: string;
        institutionId?: number;
        workerId?: number;
        minAmount?: number;
        maxAmount?: number;
    },
    page = 1,
    limit = 10
) => {
    const where: any = {};
    const skip = (page - 1) * limit;

    if (filters?.status) {
        where.status = filters.status;
    }
    if (filters?.institutionId) {
        where.institutionId = filters.institutionId;
    }
    if (filters?.workerId) {
        where.workerId = filters.workerId;
    }
    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
        where.amountTotal = {};
        if (filters.minAmount !== undefined) {
            where.amountTotal.gte = filters.minAmount;
        }
        if (filters.maxAmount !== undefined) {
            where.amountTotal.lte = filters.maxAmount;
        }
    }

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: {
                institution: { select: { id: true, institutionName: true } },
                missionAssignment: {
                    include: {
                        mission: { select: { id: true, title: true } },
                        worker: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
