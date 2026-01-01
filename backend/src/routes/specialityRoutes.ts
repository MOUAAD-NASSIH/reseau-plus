/**
 * Speciality Routes
 */

import { Router } from "express";
import {
    getAllSpecialities,
    getSpecialityById,
    createSpeciality,
    updateSpeciality,
    deleteSpeciality
} from "../controllers/specialityController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import { createSpecialitySchema, updateSpecialitySchema } from "../schemas/domainSpecialitySchemas";

const router = Router();

// Public routes - read access
router.get("/", getAllSpecialities);
router.get("/:id", getSpecialityById);

// Admin-only routes - write access
router.post("/", protect, adminOnly, validateRequest(createSpecialitySchema), createSpeciality);
router.put("/:id", protect, adminOnly, validateRequest(updateSpecialitySchema), updateSpeciality);
router.delete("/:id", protect, adminOnly, deleteSpeciality);

export default router;
