/**
 * Payment Routes
 */

import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    getPayments,
    getPaymentById,
    createPaymentIntent,
    stripeWebhook,
    getPaymentSummary,
    calculateFees
} from "../controllers/paymentController";
import {
    createPaymentIntentSchema,
    getPaymentSchema,
    paymentFilterSchema,
    calculateFeesSchema
} from "../schemas/paymentSchemas";

const router = express.Router();

// Stripe webhook - raw body parsing is handled in index.ts
// Must be before protect middleware as it's called by Stripe
router.post("/webhook", stripeWebhook);

// Protected routes
router.use(protect);

// Get all payments (filtered by role)
router.get(
    "/",
    validateRequest(paymentFilterSchema),
    getPayments
);

// Get payment summary (admin only)
router.get(
    "/summary",
    authorizeRoles("admin"),
    getPaymentSummary
);

// Calculate fees (utility endpoint)
router.post(
    "/calculate-fees",
    validateRequest(calculateFeesSchema),
    calculateFees
);

// Create payment intent (institution only)
router.post(
    "/create-intent",
    authorizeRoles("institution"),
    validateRequest(createPaymentIntentSchema),
    createPaymentIntent
);

// Get payment by ID
router.get(
    "/:id",
    validateRequest(getPaymentSchema),
    getPaymentById
);

export default router;
