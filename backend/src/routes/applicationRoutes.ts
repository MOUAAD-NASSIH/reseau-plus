/**
 * Application Routes
 */

import express from "express";
import {
    protect,
    requireVerifiedWorker,
    workerOnly,
    institutionOnly,
    workerOrInstitution
} from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    applyToMissionSchema,
    getApplicationsForMissionSchema,
    updateApplicationStatusSchema,
    getMyApplicationsSchema
} from "../schemas/applicationSchemas";
import {
    applyToMission,
    withdrawApplication,
    getMyApplications,
    getApplicationsForMission,
    acceptApplication,
    rejectApplication,
    getApplicationById
} from "../controllers/applicationController";

const router = express.Router();

// ============================================
// WORKER APPLICATION ROUTES
// ============================================

/**
 * POST /api/applications
 * Apply to a mission (verified workers only)
 */
router.post(
    "/",
    protect,
    workerOnly,
    requireVerifiedWorker,
    validateRequest(applyToMissionSchema),
    applyToMission
);

/**
 * GET /api/applications/my
 * Get worker's own applications
 */
router.get(
    "/my",
    protect,
    workerOnly,
    validateRequest(getMyApplicationsSchema),
    getMyApplications
);

/**
 * DELETE /api/applications/:id
 * Withdraw an application (workers only)
 */
router.delete(
    "/:id",
    protect,
    workerOnly,
    validateRequest(updateApplicationStatusSchema),
    withdrawApplication
);

// ============================================
// INSTITUTION APPLICATION ROUTES
// ============================================

/**
 * GET /api/applications/mission/:missionId
 * Get applications for a specific mission (institutions only)
 */
router.get(
    "/mission/:missionId",
    protect,
    institutionOnly,
    validateRequest(getApplicationsForMissionSchema),
    getApplicationsForMission
);

/**
 * PUT /api/applications/:id/accept
 * Accept an application (creates assignment)
 */
router.put(
    "/:id/accept",
    protect,
    institutionOnly,
    validateRequest(updateApplicationStatusSchema),
    acceptApplication
);

/**
 * PUT /api/applications/:id/reject
 * Reject an application
 */
router.put(
    "/:id/reject",
    protect,
    institutionOnly,
    validateRequest(updateApplicationStatusSchema),
    rejectApplication
);

// ============================================
// SHARED ROUTES
// ============================================

/**
 * GET /api/applications/:id
 * Get application by ID (worker or institution)
 */
router.get(
    "/:id",
    protect,
    workerOrInstitution,
    validateRequest(updateApplicationStatusSchema),
    getApplicationById
);

export default router;
