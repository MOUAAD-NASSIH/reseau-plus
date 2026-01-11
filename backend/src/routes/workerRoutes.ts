/**
 * Worker Routes
 */

import { Router } from "express";
import { protect, authorizeRoles, adminOnly } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import upload from "../middleware/uploadMiddleware";
import {
    getWorkers,
    getCurrentWorker,
    getWorkerById,
    updateWorker,
    uploadDocument,
    getDocuments,
    addExperience,
    updateExperience,
    deleteExperience,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    addDomain,
    removeDomain,
    getMyAvailabilities,
    getMyExperiences,
    uploadProfilePicture
} from "../controllers/workerController";
import {
    updateWorkerProfileSchema,
    experienceSchema,
    updateExperienceSchema,
    availabilitySchema,
    updateAvailabilitySchema,
    documentUploadSchema,
    addDomainSchema,
    removeDomainSchema,
    workerFilterSchema,
    getWorkerSchema,
    deleteResourceSchema
} from "../schemas/workerSchemas";

const router = Router();
const workerOnly = authorizeRoles('worker');

// Admin routes - List all workers with filters
router.get("/", protect, adminOnly, validateRequest(workerFilterSchema), getWorkers);

// Profile routes
router.get("/me", protect, workerOnly, getCurrentWorker);
router.put("/me", protect, workerOnly, validateRequest(updateWorkerProfileSchema), updateWorker);
router.post("/profile-picture", protect, workerOnly, upload.single('profilePicture'), uploadProfilePicture);

// Documents
router.get("/documents", protect, workerOnly, getDocuments);
router.post("/documents", protect, workerOnly, upload.single('document'), validateRequest(documentUploadSchema), uploadDocument);

// Experiences
router.get("/experiences", protect, workerOnly, getMyExperiences);
router.post("/experiences", protect, workerOnly, validateRequest(experienceSchema), addExperience);
router.put("/experiences/:id", protect, workerOnly, validateRequest(updateExperienceSchema), updateExperience);
router.delete("/experiences/:id", protect, workerOnly, validateRequest(deleteResourceSchema), deleteExperience);

// Availabilities
router.get("/availabilities", protect, workerOnly, getMyAvailabilities);
router.post("/availabilities", protect, workerOnly, validateRequest(availabilitySchema), addAvailability);
router.put("/availabilities/:id", protect, workerOnly, validateRequest(updateAvailabilitySchema), updateAvailability);
router.delete("/availabilities/:id", protect, workerOnly, validateRequest(deleteResourceSchema), deleteAvailability);

// Domains
router.post("/domains", protect, workerOnly, validateRequest(addDomainSchema), addDomain);
router.delete("/domains/:id", protect, workerOnly, validateRequest(removeDomainSchema), removeDomain);

// Public route - Get worker by ID
router.get("/:id", validateRequest(getWorkerSchema), getWorkerById);

export default router;
