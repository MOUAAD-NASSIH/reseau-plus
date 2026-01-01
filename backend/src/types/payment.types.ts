/**
 * Payment Types
 */

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/**
 * Payment entity
 */
export interface Payment {
    id: number;
    missionAssignmentId: number;
    institutionId: number;
    workerId: number;
    amountTotal: number;
    platformFee: number;
    workerAmount: number;
    stripePaymentId?: string | null;
    status: PaymentStatus;
    paidAt?: Date | null;
    createdAt: Date;
}

/**
 * Payment creation input
 */
export interface CreatePaymentInput {
    missionAssignmentId: number;
    institutionId: number;
    workerId: number;
    amountTotal: number;
}

/**
 * Payment intent creation input
 */
export interface CreatePaymentIntentInput {
    assignmentId: number;
    amount: number;
}

/**
 * Payment fee calculation result
 */
export interface PaymentFeeCalculation {
    amountTotal: number;
    platformFee: number;
    workerAmount: number;
}

/**
 * Payment filter options
 */
export interface PaymentFilters {
    status?: PaymentStatus;
    institutionId?: number;
    workerId?: number;
    missionAssignmentId?: number;
    paidAfter?: Date | string;
    paidBefore?: Date | string;
    minAmount?: number;
    maxAmount?: number;
}

/**
 * Payment summary for admin dashboard
 */
export interface PaymentSummary {
    totalPayments: number;
    totalAmount: number;
    totalPlatformFees: number;
    totalWorkerPayouts: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
}
