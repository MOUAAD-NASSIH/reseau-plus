/**
 * Assignment Routes
 */

import express from "express";
import {
    protect,
    workerOnly,
    institutionOnly,
    workerOrInstitution,
    authorizeRoles
} from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    getAssignmentSchema,
    updateAssignmentStatusSchema,
    assignmentFilterSchema
} from "../schemas/assignmentSchemas";
import {
    getAssignments,
    getAssignmentById,
    updateAssignmentStatus,
    getMyAssignments,
    getInstitutionAssignments
} from "../controllers/assignmentController";

const router = express.Router();

// ============================================
// WORKER ASSIGNMENT ROUTES
// ============================================

/**
 * GET /api/assignments/my
 * Get worker's own assignments
 */
router.get(
    "/my",
    protect,
    workerOnly,
    validateRequest(assignmentFilterSchema),
    getMyAssignments
);

// ============================================
// INSTITUTION ASSIGNMENT ROUTES
// ============================================

/**
 * GET /api/assignments/institution
 * Get institution's assignments
 */
router.get(
    "/institution",
    protect,
    institutionOnly,
    validateRequest(assignmentFilterSchema),
    getInstitutionAssignments
);

// ============================================
// SHARED ROUTES
// ============================================

/**
 * GET /api/assignments
 * Get all assignments (filtered by role)
 * - Workers see their own assignments
 * - Institutions see their own assignments
 * - Admins see all assignments
 */
router.get(
    "/",
    protect,
    authorizeRoles('worker', 'institution', 'admin'),
    validateRequest(assignmentFilterSchema),
    getAssignments
);

/**
 * GET /api/assignments/:id
 * Get assignment by ID
 * Access controlled by role
 */
router.get(
    "/:id",
    protect,
    authorizeRoles('worker', 'institution', 'admin'),
    validateRequest(getAssignmentSchema),
    getAssignmentById
);

/**
 * PUT /api/assignments/:id/status
 * Update assignment status
 */
router.put(
    "/:id/status",
    protect,
    authorizeRoles('institution', 'admin'),
    validateRequest(updateAssignmentStatusSchema),
    updateAssignmentStatus
);

export default router;
