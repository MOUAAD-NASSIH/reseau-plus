/**
 * Notification Controller
 */

import { Response } from "express";
import asyncHandler from "express-async-handler";
import * as notificationService from "../services/notificationService";
import { AuthenticatedRequest } from "./authController";
import { NotificationType } from "../types/notification.types";

/**
 * Helper to extract userId from authenticated request
 * Handles both worker/institution (userId) and admin (id) cases
 */
const getUserId = (req: AuthenticatedRequest): number => {
    const user = req.user as any;
    return user.userId || user.id;
};

// @desc    Get notifications with pagination
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as NotificationType | undefined;
    const isRead = req.query.isRead !== undefined
        ? req.query.isRead === 'true'
        : undefined;

    const result = await notificationService.getNotifications(userId, page, limit, {
        type,
        isRead,
    });

    res.json({
        success: true,
        data: result.notifications,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);

    const count = await notificationService.getUnreadCount(userId);

    res.json({
        success: true,
        data: { count },
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = getUserId(req);

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
        success: true,
        data: notification,
        message: "Notification marked as read",
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);

    const result = await notificationService.markAllAsRead(userId);

    res.json({
        success: true,
        data: { count: result.count },
        message: "All notifications marked as read",
    });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = getUserId(req);

    await notificationService.deleteNotification(id, userId);

    res.json({
        success: true,
        message: "Notification deleted",
    });
});