/**
 * Authentication Routes
 */

import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/documentUploadMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    loginSchema,
    registerWorkerSchema,
    registerInstitutionSchema,
    verifyEmailSchema,
    requestResetSchema,
    resetPasswordSchema
} from "../schemas/authSchemas";
import {
    login,
    registerWorker,
    registerInstitution,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
} from "../controllers/authController";

const router = Router();

// Public routes
router.post("/register/worker", upload.any(), validateRequest(registerWorkerSchema), registerWorker);
router.post("/register/institution", validateRequest(registerInstitutionSchema), registerInstitution);
router.post("/login", validateRequest(loginSchema), login);
router.get("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/forgot-password", validateRequest(requestResetSchema), forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.get("/me", protect, getMe);

export default router;
