/**
 * Notification Service
 */

import { prisma } from "../lib/prisma";
import { NotificationType, NotificationFilters, NotificationListResult } from "../types/notification.types";
import { socketEmitter } from "../socket/emitter";
import type { NotificationPayload } from "../types/socket.types";

/**
 * Create a new notification and emit socket event
 */
export const createNotification = async (
    userId: number,
    type: NotificationType | string,
    message: string
) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            message,
            // isRead defaults to false per Prisma schema
        }
    });

    // Emit socket event for real-time notification
    const payload: NotificationPayload = {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
    };
    socketEmitter.emitNotification(userId, payload);

    return notification;
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (id: number) => {
    return await prisma.notification.findUnique({
        where: { id }
    });
};

/**
 * Get paginated notifications for a user with sorting
 */
export const getNotifications = async (
    userId: number,
    page: number = 1,
    limit: number = 10,
    filters?: NotificationFilters
): Promise<NotificationListResult> => {
    const where: any = { userId };

    // Apply optional filters
    if (filters?.type) {
        where.type = filters.type;
    }
    if (filters?.isRead !== undefined) {
        where.isRead = filters.isRead;
    }

    // Get total count for pagination
    const total = await prisma.notification.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get paginated notifications sorted by createdAt descending
    const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    });

    return {
        notifications,
        total,
        page,
        limit,
        totalPages,
    };
};

/**
 * Get all notifications for a user
 */
export const getMyNotifications = async (userId: number) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id: number, userId: number) => {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found");
    }

    return await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: number) => {
    return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: number, userId: number) => {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found");
    }

    return await prisma.notification.delete({
        where: { id }
    });
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: number): Promise<number> => {
    return await prisma.notification.count({
        where: { userId, isRead: false }
    });
};

// ============================================
// NOTIFICATION TRIGGERS FOR KEY EVENTS
// ============================================

/**
 * Notify worker when application status changes
 */
export const notifyApplicationStatus = async (
    workerId: number,
    missionTitle: string,
    status: 'ACCEPTED' | 'REJECTED'
) => {
    // Get worker's userId
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    if (!worker) return null;

    const type: NotificationType = status === 'ACCEPTED'
        ? 'APPLICATION_ACCEPTED'
        : 'APPLICATION_REJECTED';

    const message = status === 'ACCEPTED'
        ? `Your application for "${missionTitle}" has been accepted!`
        : `Your application for "${missionTitle}" has been rejected.`;

    return await createNotification(worker.userId, type, message);
};

/**
 * Notify when assignment is created
 */
export const notifyAssignmentCreated = async (
    workerId: number,
    institutionId: number,
    missionTitle: string
) => {
    // Get worker's userId
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    // Get institution's userId
    const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { userId: true }
    });

    const notifications = [];

    if (worker) {
        notifications.push(
            await createNotification(
                worker.userId,
                'ASSIGNMENT_CREATED',
                `You have been assigned to mission "${missionTitle}".`
            )
        );
    }

    if (institution) {
        notifications.push(
            await createNotification(
                institution.userId,
                'ASSIGNMENT_CREATED',
                `A worker has been assigned to your mission "${missionTitle}".`
            )
        );
    }

    return notifications;
};

/**
 * Notify when assignment is completed
 */
export const notifyAssignmentCompleted = async (
    workerId: number,
    institutionId: number,
    missionTitle: string
) => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { userId: true }
    });

    const notifications = [];

    if (worker) {
        notifications.push(
            await createNotification(
                worker.userId,
                'ASSIGNMENT_COMPLETED',
                `Mission "${missionTitle}" has been marked as completed.`
            )
        );
    }

    if (institution) {
        notifications.push(
            await createNotification(
                institution.userId,
                'ASSIGNMENT_COMPLETED',
                `Mission "${missionTitle}" has been marked as completed.`
            )
        );
    }

    return notifications;
};

/**
 * Notify when payment is received
 */
export const notifyPaymentReceived = async (
    workerId: number,
    amount: number,
    missionTitle: string
) => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    if (!worker) return null;

    return await createNotification(
        worker.userId,
        'PAYMENT_RECEIVED',
        `You have received a payment of ${amount.toFixed(2)} MAD for mission "${missionTitle}".`
    );
};

/**
 * Notify when payment fails
 */
export const notifyPaymentFailed = async (
    institutionId: number,
    missionTitle: string
) => {
    const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { userId: true }
    });

    if (!institution) return null;

    return await createNotification(
        institution.userId,
        'PAYMENT_FAILED',
        `Payment for mission "${missionTitle}" has failed. Please try again.`
    );
};

/**
 * Notify worker when verification status changes
 */
export const notifyWorkerVerification = async (
    workerId: number,
    status: 'VERIFIED' | 'REJECTED',
    reason?: string
) => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    if (!worker) return null;

    const type: NotificationType = status === 'VERIFIED'
        ? 'WORKER_VERIFIED'
        : 'WORKER_REJECTED';

    let message = status === 'VERIFIED'
        ? 'Congratulations! Your profile has been verified. You can now apply to missions.'
        : 'Your profile verification has been rejected.';

    if (status === 'REJECTED' && reason) {
        message += ` Reason: ${reason}`;
    }

    return await createNotification(worker.userId, type, message);
};

/**
 * Notify worker when document is reviewed
 */
export const notifyDocumentReviewed = async (
    workerId: number,
    documentType: string,
    status: 'APPROVED' | 'REJECTED',
    comment?: string
) => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { userId: true }
    });

    if (!worker) return null;

    const type: NotificationType = status === 'APPROVED'
        ? 'DOCUMENT_APPROVED'
        : 'DOCUMENT_REJECTED';

    let message = status === 'APPROVED'
        ? `Your ${documentType} document has been approved.`
        : `Your ${documentType} document has been rejected.`;

    if (status === 'REJECTED' && comment) {
        message += ` Comment: ${comment}`;
    }

    return await createNotification(worker.userId, type, message);
};

/**
 * Notify user when they receive a review
 */
export const notifyReviewReceived = async (
    userId: number,
    rating: number,
    missionTitle: string
) => {
    return await createNotification(
        userId,
        'REVIEW_RECEIVED',
        `You received a ${rating}-star review for mission "${missionTitle}".`
    );
};
