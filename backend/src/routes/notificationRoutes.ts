/**
 * Notification Routes
 */

import express from "express";
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notificationController";
import { markAsReadSchema, notificationFilterSchema } from "../schemas/notificationSchemas";

const router = express.Router();

// GET /api/notifications - Get paginated notifications
// @route   GET /api/notifications
// @access  Private
router.get("/", protect, validateRequest(notificationFilterSchema), getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", protect, getUnreadCount);

// PUT /api/notifications/read-all - Mark all as read (must be before /:id routes)
router.put("/read-all", protect, markAllAsRead);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put("/:id/read", protect, validateRequest(markAsReadSchema), markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", protect, validateRequest(markAsReadSchema), deleteNotification);

export default router;
