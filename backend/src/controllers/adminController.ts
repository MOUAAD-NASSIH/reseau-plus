/**
 * Admin Controller
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as adminService from "../services/adminService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { WorkerStatus, DocumentStatus, UserStatus } from "../types";

// ============================================
// DASHBOARD
// ============================================

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getDashboard = asyncHandler(
    async (req: Request, res: Response) => {
        const stats = await adminService.getAdminStats();
        res.json({
            success: true,
            data: stats,
        });
    }
);

// ============================================
// WORKER VERIFICATION
// ============================================

/**
 * @desc    Get pending workers for verification
 * @route   GET /api/admin/workers/pending
 * @access  Private (Admin)
 */
export const getPendingWorkers = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await adminService.getPendingWorkers(page, limit);
        res.json({
            success: true,
            data: result.workers,
            pagination: result.pagination,
        });
    }
);

/**
 * @desc    Verify worker (approve or reject)
 * @route   PUT /api/admin/workers/:id/verify
 * @access  Private (Admin)
 */
export const verifyWorker = asyncHandler(
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        const workerId = parseInt(req.params.id);
        const { status, reason } = req.body;
        const adminId = authReq.user!.userId;

        // Validate status
        if (status !== "VERIFIED" && status !== "REJECTED") {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be VERIFIED or REJECTED",
            });
            return;
        }

        // Require reason for rejection
        if (status === "REJECTED" && !reason) {
            res.status(400).json({
                success: false,
                message: "Reason is required when rejecting a worker",
            });
            return;
        }

        try {
            const worker = await adminService.verifyWorker(
                workerId,
                status as WorkerStatus,
                adminId,
                reason
            );

            res.json({
                success: true,
                data: worker,
                message: `Worker ${status === "VERIFIED" ? "verified" : "rejected"} successfully`,
            });
        } catch (error: any) {
            if (error.message === "Worker not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            throw error;
        }
    }
);

// ============================================
// DOCUMENT REVIEW
// ============================================

/**
 * @desc    Get pending documents for review
 * @route   GET /api/admin/documents/pending
 * @access  Private (Admin)
 */
export const getPendingDocuments = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const type = req.query.type as string | undefined;
        const status = req.query.status as string | undefined;

        const result = await adminService.getPendingDocuments(page, limit, type, status);
        res.json({
            success: true,
            data: result.documents,
            pagination: result.pagination,
        });
    }
);

/**
 * @desc    Review document (approve or reject)
 * @route   PUT /api/admin/documents/:id/review
 * @access  Private (Admin)
 */
export const reviewDocument = asyncHandler(
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        const documentId = parseInt(req.params.id);
        const { status, comment } = req.body;
        const adminId = authReq.user!.userId;

        // Validate status
        if (status !== "APPROVED" && status !== "REJECTED") {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be APPROVED or REJECTED",
            });
            return;
        }

        try {
            const document = await adminService.reviewDocument(
                documentId,
                status as DocumentStatus,
                adminId,
                comment
            );

            res.json({
                success: true,
                data: document,
                message: `Document ${status === "APPROVED" ? "approved" : "rejected"} successfully`,
            });
        } catch (error: any) {
            if (error.message === "Document not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            throw error;
        }
    }
);

// ============================================
// USER STATUS MANAGEMENT
// ============================================

/**
 * @desc    Update user status (suspend, ban, activate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
export const updateUserStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        const userId = parseInt(req.params.id);
        const { status, reason } = req.body;
        const adminId = authReq.user!.userId;

        // Validate status
        if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be ACTIVE, SUSPENDED, or BANNED",
            });
            return;
        }

        // Require reason
        if (!reason) {
            res.status(400).json({
                success: false,
                message: "Reason is required for status change",
            });
            return;
        }

        try {
            const user = await adminService.updateUserStatus(
                userId,
                status as UserStatus,
                adminId,
                reason
            );

            res.json({
                success: true,
                data: user,
                message: `User status updated to ${status} successfully`,
            });
        } catch (error: any) {
            if (error.message === "User not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            throw error;
        }
    }
);

// ============================================
// ADMIN LOGS
// ============================================

/**
 * @desc    Get admin action logs
 * @route   GET /api/admin/logs
 * @access  Private (Admin)
 */
export const getAdminLogs = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            adminId: req.query.adminId
                ? parseInt(req.query.adminId as string)
                : undefined,
            actionType: req.query.actionType as string | undefined,
            targetUserId: req.query.targetUserId
                ? parseInt(req.query.targetUserId as string)
                : undefined,
            createdAfter: req.query.createdAfter as string | undefined,
            createdBefore: req.query.createdBefore as string | undefined,
        };

        const result = await adminService.getAdminLogs(filters, page, limit);
        res.json({
            success: true,
            data: result.logs,
            pagination: result.pagination,
        });
    }
);

// ============================================
// PAYMENT SUMMARY
// ============================================

/**
 * @desc    Get payment summary
 * @route   GET /api/admin/payments/summary
 * @access  Private (Admin)
 */
export const getPaymentSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const dateRange =
            req.query.startDate && req.query.endDate
                ? {
                    startDate: req.query.startDate as string,
                    endDate: req.query.endDate as string,
                }
                : undefined;

        const summary = await adminService.getPaymentSummary(dateRange);
        res.json({
            success: true,
            data: summary,
        });
    }
);


// ============================================
// ADMIN VIEW ALL RESOURCES
// ============================================

/**
 * @desc    Get all missions (admin view)
 * @route   GET /api/admin/missions
 * @access  Private (Admin)
 */
export const getAllMissions = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            status: req.query.status as string | undefined,
            institutionId: req.query.institutionId
                ? parseInt(req.query.institutionId as string)
                : undefined,
            urgency: req.query.urgency as string | undefined,
            startDateFrom: req.query.startDateFrom as string | undefined,
            startDateTo: req.query.startDateTo as string | undefined,
        };

        const result = await adminService.getAllMissions(filters, page, limit);
        res.json({
            success: true,
            data: result.missions,
            pagination: result.pagination,
        });
    }
);

/**
 * @desc    Get all assignments (admin view)
 * @route   GET /api/admin/assignments
 * @access  Private (Admin)
 */
export const getAllAssignments = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            status: req.query.status as string | undefined,
            workerId: req.query.workerId
                ? parseInt(req.query.workerId as string)
                : undefined,
            institutionId: req.query.institutionId
                ? parseInt(req.query.institutionId as string)
                : undefined,
            missionId: req.query.missionId
                ? parseInt(req.query.missionId as string)
                : undefined,
        };

        const result = await adminService.getAllAssignments(filters, page, limit);
        res.json({
            success: true,
            data: result.assignments,
            pagination: result.pagination,
        });
    }
);

/**
 * @desc    Get all reviews (admin view)
 * @route   GET /api/admin/reviews
 * @access  Private (Admin)
 */
export const getAllReviews = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            minRating: req.query.minRating
                ? parseInt(req.query.minRating as string)
                : undefined,
            maxRating: req.query.maxRating
                ? parseInt(req.query.maxRating as string)
                : undefined,
            reviewerId: req.query.reviewerId
                ? parseInt(req.query.reviewerId as string)
                : undefined,
            revieweeId: req.query.revieweeId
                ? parseInt(req.query.revieweeId as string)
                : undefined,
        };

        const result = await adminService.getAllReviews(filters, page, limit);
        res.json({
            success: true,
            data: result.reviews,
            pagination: result.pagination,
        });
    }
);

/**
 * @desc    Get all payments (admin view)
 * @route   GET /api/admin/payments
 * @access  Private (Admin)
 */
export const getAllPayments = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            status: req.query.status as string | undefined,
            institutionId: req.query.institutionId
                ? parseInt(req.query.institutionId as string)
                : undefined,
            workerId: req.query.workerId
                ? parseInt(req.query.workerId as string)
                : undefined,
            minAmount: req.query.minAmount
                ? parseFloat(req.query.minAmount as string)
                : undefined,
            maxAmount: req.query.maxAmount
                ? parseFloat(req.query.maxAmount as string)
                : undefined,
        };

        const result = await adminService.getAllPayments(filters, page, limit);
        res.json({
            success: true,
            data: result.payments,
            pagination: result.pagination,
        });
    }
);
