import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";
import {
    login,
    registerWorker,
    registerInstitution,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword
} from "../controllers/authController";

const router = Router();

router.post("/register/worker", upload.any(), registerWorker);
router.post("/register/institution", registerInstitution);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

export default router;