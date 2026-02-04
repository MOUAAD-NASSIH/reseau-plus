/**
 * Admin Types
 */

import { WorkerStatus, DocumentStatus } from './worker.types';
import { UserStatus } from './user.types';

/**
 * Admin action types
 */
export type AdminActionType =
    | 'WORKER_VERIFIED'
    | 'WORKER_REJECTED'
    | 'DOCUMENT_APPROVED'
    | 'DOCUMENT_REJECTED'
    | 'USER_SUSPENDED'
    | 'USER_BANNED'
    | 'USER_ACTIVATED'
    | 'REVIEW_DELETED'
    | 'MISSION_CANCELLED';

/**
 * Admin log entity
 */
export interface AdminLog {
    id: number;
    adminId: number;
    targetUserId?: number | null;
    targetDocumentId?: number | null;
    targetReviewId?: number | null;
    targetMissionId?: number | null;
    actionType: string;
    reason?: string | null;
    createdAt: Date;
}

/**
 * Admin log creation input
 */
export interface CreateAdminLogInput {
    adminId: number;
    actionType: AdminActionType;
    targetUserId?: number;
    targetDocumentId?: number;
    targetReviewId?: number;
    targetMissionId?: number;
    reason?: string;
}

/**
 * Admin log filter options
 */
export interface AdminLogFilters {
    adminId?: number;
    actionType?: AdminActionType | string;
    targetUserId?: number;
    createdAfter?: Date | string;
    createdBefore?: Date | string;
}

/**
 * Worker verification input
 */
export interface VerifyWorkerInput {
    workerId: number;
    status: WorkerStatus;
    reason?: string;
}

/**
 * Document review input
 */
export interface ReviewDocumentInput {
    documentId: number;
    status: DocumentStatus;
    comment?: string;
}

/**
 * User status update input
 */
export interface UpdateUserStatusInput {
    userId: number;
    status: UserStatus;
    reason: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
    totalUsers: number;
    totalWorkers: number;
    totalInstitutions: number;
    pendingVerifications: number;
    pendingDocuments: number;
    totalMissions: number;
    activeMissions: number;
    completedMissions: number;
    ongoingMissions: number;
    cancelledMissions: number;
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    totalReviews: number;
    totalPayments: number;
    totalRevenue: number;
    totalPaymentAmount: number;
    totalWorkerPayouts: number;
    userStatusBreakdown: Array<{ status: string; count: number }>;
    workerStatusBreakdown: Array<{ status: string; count: number }>;
}

/**
 * Date range for reports
 */
export interface DateRange {
    startDate: Date | string;
    endDate: Date | string;
}
