/**
 * Notification Types
 */

/**
 * Notification type enum
 */
export type NotificationType =
    | 'APPLICATION_SUBMITTED'
    | 'APPLICATION_ACCEPTED'
    | 'APPLICATION_REJECTED'
    | 'ASSIGNMENT_CREATED'
    | 'ASSIGNMENT_ACTIVE'
    | 'ASSIGNMENT_ONGOING'
    | 'ASSIGNMENT_COMPLETED'
    | 'ASSIGNMENT_CANCELLED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_FAILED'
    | 'WORKER_VERIFIED'
    | 'WORKER_REJECTED'
    | 'DOCUMENT_APPROVED'
    | 'DOCUMENT_REJECTED'
    | 'REVIEW_RECEIVED'
    | 'GENERAL';

/**
 * Notification entity
 */
export interface Notification {
    id: number;
    userId: number;
    type: string;
    message: string;
    entityId?: number;
    entityType?: string;
    isRead: boolean;
    createdAt: Date;
}

/**
 * Notification creation input
 */
export interface CreateNotificationInput {
    userId: number;
    type: NotificationType;
    message: string;
}

/**
 * Notification filter options
 */
export interface NotificationFilters {
    userId?: number;
    type?: NotificationType;
    isRead?: boolean;
}

/**
 * Notification list with pagination
 */
export interface NotificationListResult {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
