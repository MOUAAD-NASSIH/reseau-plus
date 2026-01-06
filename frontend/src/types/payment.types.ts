/**
 * Payment Types
 * Frontend types mirroring backend payment models
 */

// ENUMS / STATUS TYPES


export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// ENTITY INTERFACES


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
    paidAt?: string | null;
    createdAt: string;
}

// INPUT INTERFACES


/**
 * Payment intent creation input
 * Note: amount is calculated by the backend based on the assignment
 */
export interface CreatePaymentIntentInput {
    assignmentId: number;
}

/**
 * Payment intent response from backend
 */
export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    platformFee: number;
    workerAmount: number;
    currency: string;
}

// CALCULATION INTERFACES


/**
 * Payment fee calculation result
 */
export interface PaymentFeeCalculation {
    amountTotal: number;
    platformFee: number;
    workerAmount: number;
}

// FILTER INTERFACES


/**
 * Payment filter options
 */
export interface PaymentFilters {
    status?: PaymentStatus;
    institutionId?: number;
    workerId?: number;
    missionAssignmentId?: number;
    paidAfter?: string;
    paidBefore?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
}

