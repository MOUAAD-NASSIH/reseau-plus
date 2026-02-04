/**
 * Profile Picture Routes
 * Handles profile picture upload and deletion for all user types
 */

import { Router } from "express";
import { protect, workerOnly, institutionOnly, adminOnly } from "../middleware/authMiddleware";
import profileUpload from "../middleware/profileUploadMiddleware";
import {
    uploadWorkerProfilePicture,
    uploadInstitutionLogo,
    deleteWorkerProfilePicture,
    deleteInstitutionLogo,
    uploadAdminProfilePicture,
    deleteAdminProfilePicture,
    getProfilePicture
} from "../controllers/profileController";

const router = Router();

// Get current user's profile picture
router.get("/picture", protect, getProfilePicture);

// Worker profile picture routes
router.post(
    "/worker/picture",
    protect,
    workerOnly,
    profileUpload.single('profilePicture'),
    uploadWorkerProfilePicture
);

router.delete(
    "/worker/picture",
    protect,
    workerOnly,
    deleteWorkerProfilePicture
);

// Institution logo routes
router.post(
    "/institution/picture",
    protect,
    institutionOnly,
    profileUpload.single('logo'),
    uploadInstitutionLogo
);

router.delete(
    "/institution/picture",
    protect,
    institutionOnly,
    deleteInstitutionLogo
);

// Admin profile picture routes
router.post(
    "/admin/picture",
    protect,
    adminOnly,
    profileUpload.single('profilePicture'),
    uploadAdminProfilePicture
);

router.delete(
    "/admin/picture",
    protect,
    adminOnly,
    deleteAdminProfilePicture
);

export default router;
