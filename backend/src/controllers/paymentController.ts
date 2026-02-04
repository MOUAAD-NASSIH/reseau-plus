/**
 * Payment Controller
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as paymentService from "../services/paymentService";
import stripe from "../lib/stripe";

/**
 * Extended request with authenticated user
 */
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        workerId?: number;
        institutionId?: number;
    };
}

/**
 * @desc    Get payments (filtered by role)
 * @route   GET /api/payments
 * @access  Private
 */
export const getPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { page = 1, limit = 10, status, missionAssignmentId, paidAfter, paidBefore, minAmount, maxAmount } = req.query;

    const filters: any = {};

    if (status) filters.status = status as string;
    if (missionAssignmentId) filters.missionAssignmentId = Number(missionAssignmentId);
    if (paidAfter) filters.paidAfter = paidAfter as string;
    if (paidBefore) filters.paidBefore = paidBefore as string;
    if (minAmount) filters.minAmount = Number(minAmount);
    if (maxAmount) filters.maxAmount = Number(maxAmount);

    let result;

    if (user.role === 'admin') {
        result = await paymentService.getPayments(filters, Number(page), Number(limit));
    } else if (user.role === 'institution' && user.institutionId) {
        filters.institutionId = user.institutionId;
        result = await paymentService.getPayments(filters, Number(page), Number(limit));
    } else if (user.role === 'worker' && user.workerId) {
        filters.workerId = user.workerId;
        result = await paymentService.getPayments(filters, Number(page), Number(limit));
    } else {
        res.status(403).json({
            success: false,
            error: "Forbidden",
            message: "You don't have permission to view payments"
        });
        return;
    }

    res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
    });
});


/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const paymentId = Number(req.params.id);

    const payment = await paymentService.getPaymentById(paymentId);

    // Check authorization
    const isAdmin = user.role === 'admin';
    const isInstitution = user.role === 'institution' && payment.institutionId === user.institutionId;
    const isWorker = user.role === 'worker' && payment.workerId === user.workerId;

    if (!isAdmin && !isInstitution && !isWorker) {
        res.status(403).json({
            success: false,
            error: "Forbidden",
            message: "You don't have permission to view this payment"
        });
        return;
    }

    res.json({
        success: true,
        data: payment
    });
});

/**
 * @desc    Create Stripe PaymentIntent
 * @route   POST /api/payments/create-intent
 * @access  Private (Institution)
 */
export const createPaymentIntent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { assignmentId } = req.body;

    if (user.role !== 'institution' || !user.institutionId) {
        res.status(403).json({
            success: false,
            error: "Forbidden",
            message: "Only institutions can create payment intents"
        });
        return;
    }

    const paymentData = await paymentService.createPaymentIntent(
        user.institutionId,
        Number(assignmentId)
    );

    res.json({
        success: true,
        data: paymentData,
        message: "Payment intent created successfully"
    });
});

/**
 * @desc    Stripe Webhook Handler
 * @route   POST /api/payments/webhook
 * @access  Public (Stripe signature verification)
 */
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.warn("STRIPE_WEBHOOK_SECRET not configured, processing without verification");
        await paymentService.handleStripeWebhook(req.body);
        res.json({ received: true });
        return;
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );

        await paymentService.handleStripeWebhook(event);

        res.json({ received: true });
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).json({
            success: false,
            error: "Webhook Error",
            message: `Webhook signature verification failed`
        });
    }
});

/**
 * @desc    Get payment summary (Admin)
 * @route   GET /api/payments/summary
 * @access  Private (Admin)
 */
export const getPaymentSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    if (user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: "Forbidden",
            message: "Only admins can view payment summary"
        });
        return;
    }

    const { startDate, endDate } = req.query;

    const dateRange = startDate || endDate ? {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
    } : undefined;

    const summary = await paymentService.getPaymentSummary(dateRange);

    res.json({
        success: true,
        data: summary
    });
});

/**
 * @desc    Calculate payment fees (utility endpoint)
 * @route   POST /api/payments/calculate-fees
 * @access  Private
 */
export const calculateFees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { amount } = req.body;

    const fees = paymentService.calculateFees(Number(amount));

    res.json({
        success: true,
        data: fees
    });
});
