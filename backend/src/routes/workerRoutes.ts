import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";
import {
    getMyProfile,
    getWorkerById,
    updateMyProfile,
    updateMyDomains,
    getMyDocuments,
    uploadDocument,
    deleteDocument,
    getMyAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    getMyExperiences,
    createExperience,
    updateExperience,
    deleteExperience
} from "../controllers/workerController";

const router = Router();
const workerOnly = authorizeRoles(['worker']);


// Profile routes
router.get("/me", protect, workerOnly, getMyProfile);
router.put("/me", protect, workerOnly, updateMyProfile);

// Public routes
router.get("/:id", getWorkerById);

// Domains
router.put("/me/domains", protect, workerOnly, updateMyDomains);

// Documents
router.get("/me/documents", protect, workerOnly, getMyDocuments);
router.post("/me/documents", protect, workerOnly, upload.single('document'), uploadDocument);
router.delete("/me/documents/:id", protect, workerOnly, deleteDocument);

// Availability
router.get("/me/availability", protect, workerOnly, getMyAvailabilities);
router.post("/me/availability", protect, workerOnly, createAvailability);
router.put("/me/availability/:id", protect, workerOnly, updateAvailability);
router.delete("/me/availability/:id", protect, workerOnly, deleteAvailability);

// Experience
router.get("/me/experience", protect, workerOnly, getMyExperiences);
router.post("/me/experience", protect, workerOnly, createExperience);
router.put("/me/experience/:id", protect, workerOnly, updateExperience);
router.delete("/me/experience/:id", protect, workerOnly, deleteExperience);

export default router;
