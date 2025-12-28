import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import {
    getMyProfile,
    getInstitutionById,
    updateMyProfile
} from "../controllers/institutionController";

const router = Router();
const institutionOnly = authorizeRoles(['institution']);

router.get("/me", protect, institutionOnly, getMyProfile);
router.put("/me", protect, institutionOnly, updateMyProfile);
router.get("/:id", getInstitutionById);

export default router;
