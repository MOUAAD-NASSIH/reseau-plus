/**
 * Payment Service
 */

import { prisma } from "../lib/prisma";
import stripe from "../lib/stripe";
import { PaymentStatus } from "../types";
import { PaymentFilters, PaymentFeeCalculation, PaymentSummary } from "../types/payment.types";
import * as notificationService from "./notificationService";
import Stripe from "stripe";

const PLATFORM_FEE_PERCENTAGE = 0.15;
const WORKER_AMOUNT_PERCENTAGE = 0.85;

/**
 * Custom error class for payment operations
 */
export class PaymentError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "PaymentError";
        this.statusCode = statusCode;
    }
}

/**
 * Calculate payment fees
 * 
 * For any payment amount, platformFee SHALL equal exactly 15% of amountTotal 
 * (rounded to 2 decimal places), and workerAmount SHALL equal exactly 85% of 
 * amountTotal (rounded to 2 decimal places).
 */
export const calculateFees = (amount: number): PaymentFeeCalculation => {
    if (amount <= 0) {
        throw new PaymentError("Amount must be positive", 400);
    }

    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const workerAmount = Math.round(amount * WORKER_AMOUNT_PERCENTAGE * 100) / 100;

    return {
        amountTotal: amount,
        platformFee,
        workerAmount
    };
};

/**
 * Create payment record for completed assignment
 */
export const createPaymentRecord = async (
    assignmentId: number,
    institutionId: number,
    workerId: number,
    amount: number
) => {
    const fees = calculateFees(amount);

    return await prisma.payment.create({
        data: {
            missionAssignmentId: assignmentId,
            institutionId,
            workerId,
            amountTotal: fees.amountTotal,
            platformFee: fees.platformFee,
            workerAmount: fees.workerAmount,
            status: 'PENDING'
        }
    });
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: number) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            missionAssignment: {
                include: {
                    mission: true,
                    worker: { include: { user: true } },
                    institution: { include: { user: true } }
                }
            },
            institution: { include: { user: true } }
        }
    });

    if (!payment) {
        throw new PaymentError("Payment not found", 404);
    }

    return payment;
};

/**
 * Get all payments with filters
 */
export const getPayments = async (filters?: PaymentFilters, page: number = 1, limit: number = 10) => {
    const where: any = {};

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.institutionId) {
        where.institutionId = filters.institutionId;
    }

    if (filters?.workerId) {
        where.workerId = filters.workerId;
    }

    if (filters?.missionAssignmentId) {
        where.missionAssignmentId = filters.missionAssignmentId;
    }

    if (filters?.paidAfter || filters?.paidBefore) {
        where.paidAt = {};
        if (filters.paidAfter) {
            where.paidAt.gte = new Date(filters.paidAfter);
        }
        if (filters.paidBefore) {
            where.paidAt.lte = new Date(filters.paidBefore);
        }
    }

    if (filters?.minAmount || filters?.maxAmount) {
        where.amountTotal = {};
        if (filters.minAmount) {
            where.amountTotal.gte = filters.minAmount;
        }
        if (filters.maxAmount) {
            where.amountTotal.lte = filters.maxAmount;
        }
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: {
                missionAssignment: {
                    include: {
                        mission: true,
                        worker: { include: { user: true } }
                    }
                },
                institution: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.payment.count({ where })
    ]);

    return {
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get payments for worker
 */
export const getWorkerPayments = async (workerId: number, page: number = 1, limit: number = 10) => {
    return getPayments({ workerId }, page, limit);
};

/**
 * Get payments for institution
 */
export const getInstitutionPayments = async (institutionId: number, page: number = 1, limit: number = 10) => {
    return getPayments({ institutionId }, page, limit);
};

/**
 * Create Stripe PaymentIntent
 */
export const createPaymentIntent = async (institutionId: number, assignmentId: number) => {
    // Get assignment with mission details
    const assignment = await prisma.missionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
            mission: true,
            worker: { include: { user: true } },
            institution: { include: { user: true } }
        }
    });

    if (!assignment) {
        throw new PaymentError("Assignment not found", 404);
    }

    // Validate ownership
    if (assignment.institutionId !== institutionId) {
        throw new PaymentError("Unauthorized to pay for this assignment", 403);
    }

    // Validate assignment status
    if (assignment.status !== 'COMPLETED') {
        throw new PaymentError("Assignment must be completed before payment", 400);
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
        where: {
            missionAssignmentId: assignmentId,
            status: { in: ['PENDING', 'COMPLETED'] }
        }
    });

    if (existingPayment?.status === 'COMPLETED') {
        throw new PaymentError("Payment already completed for this assignment", 409);
    }

    // Get mission budget
    if (!assignment.mission.budget) {
        throw new PaymentError("Mission budget is not set", 400);
    }

    const amount = Number(assignment.mission.budget);
    const fees = calculateFees(amount);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'eur',
        metadata: {
            assignmentId: assignment.id.toString(),
            institutionId: institutionId.toString(),
            workerId: assignment.workerId.toString(),
            missionId: assignment.missionId.toString()
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    // Create or update payment record
    if (existingPayment) {
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                stripePaymentId: paymentIntent.id,
                amountTotal: fees.amountTotal,
                platformFee: fees.platformFee,
                workerAmount: fees.workerAmount
            }
        });
    } else {
        await prisma.payment.create({
            data: {
                missionAssignmentId: assignmentId,
                institutionId,
                workerId: assignment.workerId,
                amountTotal: fees.amountTotal,
                platformFee: fees.platformFee,
                workerAmount: fees.workerAmount,
                stripePaymentId: paymentIntent.id,
                status: 'PENDING'
            }
        });
    }

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: fees.amountTotal,
        platformFee: fees.platformFee,
        workerAmount: fees.workerAmount,
        currency: 'eur'
    };
};

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (event: Stripe.Event) => {
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
            break;

        default:
            // Unhandled event type
            console.log(`Unhandled event type: ${event.type}`);
    }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
    const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: {
            missionAssignment: {
                include: {
                    mission: true,
                    worker: { include: { user: true } },
                    institution: { include: { user: true } }
                }
            }
        }
    });

    if (!payment) {
        console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
        return;
    }

    // Update payment status
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: 'COMPLETED',
            paidAt: new Date()
        }
    });

    // Send notifications
    const workerUserId = payment.missionAssignment.worker.userId;
    const institutionUserId = payment.missionAssignment.institution.userId;
    const missionTitle = payment.missionAssignment.mission.title;
    const amount = payment.workerAmount;

    // Notify worker
    await notificationService.createNotification(
        workerUserId,
        'PAYMENT_RECEIVED',
        `Payment of €${amount.toFixed(2)} received for mission: ${missionTitle}`
    );

    // Notify institution
    await notificationService.createNotification(
        institutionUserId,
        'PAYMENT_COMPLETED',
        `Payment of €${payment.amountTotal.toFixed(2)} completed for mission: ${missionTitle}`
    );
};

/**
 * Handle failed payment
 */
const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
    const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: {
            missionAssignment: {
                include: {
                    mission: true,
                    institution: { include: { user: true } }
                }
            }
        }
    });

    if (!payment) {
        console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
        return;
    }

    // Update payment status
    await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
    });

    // Notify institution about failure
    const institutionUserId = payment.missionAssignment.institution.userId;
    const missionTitle = payment.missionAssignment.mission.title;

    await notificationService.createNotification(
        institutionUserId,
        'PAYMENT_FAILED',
        `Payment failed for mission: ${missionTitle}. Please try again.`
    );
};

/**
 * Get payment summary for admin dashboard
 */
export const getPaymentSummary = async (dateRange?: { startDate?: Date; endDate?: Date }): Promise<PaymentSummary> => {
    const where: any = {};

    if (dateRange?.startDate || dateRange?.endDate) {
        where.createdAt = {};
        if (dateRange.startDate) {
            where.createdAt.gte = dateRange.startDate;
        }
        if (dateRange.endDate) {
            where.createdAt.lte = dateRange.endDate;
        }
    }

    const [
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        aggregates
    ] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
        prisma.payment.count({ where: { ...where, status: 'FAILED' } }),
        prisma.payment.aggregate({
            where: { ...where, status: 'COMPLETED' },
            _sum: {
                amountTotal: true,
                platformFee: true,
                workerAmount: true
            }
        })
    ]);

    return {
        totalPayments,
        totalAmount: aggregates._sum.amountTotal || 0,
        totalPlatformFees: aggregates._sum.platformFee || 0,
        totalWorkerPayouts: aggregates._sum.workerAmount || 0,
        pendingPayments,
        completedPayments,
        failedPayments
    };
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (
    payload: string | Buffer,
    signature: string,
    endpointSecret: string
): Stripe.Event => {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
};
