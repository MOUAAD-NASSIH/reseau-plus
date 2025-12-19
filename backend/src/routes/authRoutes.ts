import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
    login,
    registerWorker,
    registerInstitution,
    getMe
} from "../controllers/authController";

const router = Router();

router.post("/register/worker", registerWorker);
router.post("/register/institution", registerInstitution);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;