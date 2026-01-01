/**
 * Mission Routes
 */

import express from "express";
import {
    protect,
    authorizeRoles,
    requireVerifiedWorker
} from "../middleware/authMiddleware";
import {
    createMission,
    getAllMissions,
    getAvailableMissions,
    getMyMissions,
    getMissionById,
    updateMission,
    deleteMission,
    getRecommendedMissions,
    getMissionStats
} from "../controllers/missionController";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    createMissionSchema,
    updateMissionSchema,
    missionFilterSchema,
    getMissionSchema,
    deleteMissionSchema
} from "../schemas/missionSchemas";

const router = express.Router();

// Worker routes (must be before /:id to avoid conflicts)
// GET /api/missions/available - Available missions for verified workers
router.get(
    "/available",
    protect,
    authorizeRoles("worker"),
    requireVerifiedWorker,
    validateRequest(missionFilterSchema),
    getAvailableMissions
);

// GET /api/missions/recommended - Recommended missions for workers
router.get(
    "/recommended",
    protect,
    authorizeRoles("worker"),
    requireVerifiedWorker,
    getRecommendedMissions
);

// Institution routes
// GET /api/missions/my - Institution's own missions
router.get(
    "/my",
    protect,
    authorizeRoles("institution"),
    validateRequest(missionFilterSchema),
    getMyMissions
);

// GET /api/missions/stats - Mission status counts for institution
router.get(
    "/stats",
    protect,
    authorizeRoles("institution"),
    getMissionStats
);

// Admin routes
// GET /api/missions - All missions (admin only)
router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    validateRequest(missionFilterSchema),
    getAllMissions
);

// Shared routes
// GET /api/missions/:id - Get mission by ID
router.get(
    "/:id",
    protect,
    validateRequest(getMissionSchema),
    getMissionById
);

// Institution CRUD routes
// POST /api/missions - Create mission
router.post(
    "/",
    protect,
    authorizeRoles("institution"),
    validateRequest(createMissionSchema),
    createMission
);

// PUT /api/missions/:id - Update mission
router.put(
    "/:id",
    protect,
    authorizeRoles("institution"),
    validateRequest(updateMissionSchema),
    updateMission
);

// DELETE /api/missions/:id - Delete mission
router.delete(
    "/:id",
    protect,
    authorizeRoles("institution"),
    validateRequest(deleteMissionSchema),
    deleteMission
);

export default router;
