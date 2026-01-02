/**
 * Notification Types
 * Frontend types mirroring backend notification models
 */

// ============================================
// ENUMS / STATUS TYPES
// ============================================

/**
 * Notification type union
 */
export type NotificationType =
    | 'APPLICATION_SUBMITTED'
    | 'APPLICATION_ACCEPTED'
    | 'APPLICATION_REJECTED'
    | 'ASSIGNMENT_CREATED'
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

// ============================================
// ENTITY INTERFACES
// ============================================

/**
 * Notification entity
 */
export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// ============================================
// FILTER INTERFACES
// ============================================

/**
 * Notification filter options
 */
export interface NotificationFilters {
    type?: NotificationType;
    isRead?: boolean;
    page?: number;
    limit?: number;
}
