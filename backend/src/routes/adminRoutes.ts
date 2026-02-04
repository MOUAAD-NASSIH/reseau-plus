/**
 * Admin Routes
 */

import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    getDashboard,
    getPendingWorkers,
    verifyWorker,
    getPendingDocuments,
    reviewDocument,
    updateUserStatus,
    getAdminLogs,
    getPaymentSummary,
    getAllMissions,
    getAllAssignments,
    getAllReviews,
    getAllPayments,
} from "../controllers/adminController";
import {
    verifyWorkerSchema,
    reviewDocumentSchema,
    updateUserStatusSchema,
    adminLogFilterSchema,
    paymentSummaryFilterSchema,
    pendingWorkersFilterSchema,
    pendingDocumentsFilterSchema,
    adminMissionsFilterSchema,
    adminAssignmentsFilterSchema,
    adminReviewsFilterSchema,
    adminPaymentsFilterSchema,
} from "../schemas/adminSchemas";

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(protect);
router.use(authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Worker verification
router.get(
    "/workers/pending",
    validateRequest(pendingWorkersFilterSchema),
    getPendingWorkers
);
router.put(
    "/workers/:id/verify",
    validateRequest(verifyWorkerSchema),
    verifyWorker
);

// Document review
router.get(
    "/documents/pending",
    validateRequest(pendingDocumentsFilterSchema),
    getPendingDocuments
);
router.put(
    "/documents/:id/review",
    validateRequest(reviewDocumentSchema),
    reviewDocument
);

// User status management
router.put(
    "/users/:id/status",
    validateRequest(updateUserStatusSchema),
    updateUserStatus
);

// Admin logs
router.get("/logs", validateRequest(adminLogFilterSchema), getAdminLogs);

// Payment summary
router.get(
    "/payments/summary",
    validateRequest(paymentSummaryFilterSchema),
    getPaymentSummary
);

// Admin view all resources
router.get(
    "/missions",
    validateRequest(adminMissionsFilterSchema),
    getAllMissions
);
router.get(
    "/assignments",
    validateRequest(adminAssignmentsFilterSchema),
    getAllAssignments
);
router.get(
    "/reviews",
    validateRequest(adminReviewsFilterSchema),
    getAllReviews
);
router.get(
    "/payments",
    validateRequest(adminPaymentsFilterSchema),
    getAllPayments
);

export default router;
