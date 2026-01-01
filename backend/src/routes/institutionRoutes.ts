/**
 * Institution Routes
 */

import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import {
    getInstitutions,
    getCurrentInstitution,
    getInstitutionById,
    updateInstitution
} from "../controllers/institutionController";

const router = Router();

// Admin routes
router.get("/", protect, authorizeRoles('admin'), getInstitutions);

// Institution profile routes (protected)
router.get("/me", protect, authorizeRoles('institution'), getCurrentInstitution);
router.put("/me", protect, authorizeRoles('institution'), updateInstitution);

// Public routes
router.get("/:id", getInstitutionById);

export default router;
