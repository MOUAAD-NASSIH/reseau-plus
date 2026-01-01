/**
 * Domain Routes
 */

import { Router } from "express";
import {
    getAllDomains,
    getDomainById,
    createDomain,
    updateDomain,
    deleteDomain
} from "../controllers/domainController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import { createDomainSchema, updateDomainSchema } from "../schemas/domainSpecialitySchemas";

const router = Router();

// Public routes - read access
router.get("/", getAllDomains);
router.get("/:id", getDomainById);

// Admin-only routes - write access
router.post("/", protect, adminOnly, validateRequest(createDomainSchema), createDomain);
router.put("/:id", protect, adminOnly, validateRequest(updateDomainSchema), updateDomain);
router.delete("/:id", protect, adminOnly, deleteDomain);

export default router;
