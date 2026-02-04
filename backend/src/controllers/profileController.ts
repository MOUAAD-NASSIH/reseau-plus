/**
 * Profile Picture Controller - handles upload and deletion for all user types
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as profileService from "../services/profileService";
import {
    ProfilePictureValidationError,
    ProfilePictureUploadError,
    ProfilePictureAuthorizationError
} from "../services/profileService";

export const uploadWorkerProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'worker') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }

    try {
        const result = await profileService.uploadWorkerProfilePicture(userId, file);
        res.json({
            success: true,
            data: { url: result.url, publicId: result.publicId },
            message: "Profile picture uploaded successfully"
        });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const uploadInstitutionLogo = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'institution') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }

    try {
        const result = await profileService.uploadInstitutionLogo(userId, file);
        res.json({
            success: true,
            data: { url: result.url, publicId: result.publicId },
            message: "Logo uploaded successfully"
        });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const deleteWorkerProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'worker') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    try {
        await profileService.deleteWorkerProfilePicture(userId);
        res.json({ success: true, message: "Profile picture deleted successfully" });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const deleteInstitutionLogo = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'institution') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    try {
        await profileService.deleteInstitutionLogo(userId);
        res.json({ success: true, message: "Logo deleted successfully" });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const uploadAdminProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'admin') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }

    try {
        const result = await profileService.uploadAdminProfilePicture(userId, file);
        res.json({
            success: true,
            data: { url: result.url, publicId: result.publicId },
            message: "Profile picture uploaded successfully"
        });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const deleteAdminProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    if (userRole !== 'admin') {
        res.status(403).json({ success: false, message: "Not authorized to update this profile" });
        return;
    }

    try {
        await profileService.deleteAdminProfilePicture(userId);
        res.json({ success: true, message: "Profile picture deleted successfully" });
    } catch (error) {
        handleProfileError(error, res);
    }
});

export const getProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
    }

    const url = await profileService.getProfilePictureUrl(userId, userRole);
    res.json({ success: true, data: { url } });
});

function handleProfileError(error: unknown, res: Response): void {
    if (error instanceof ProfilePictureValidationError) {
        res.status(400).json({ success: false, message: error.message });
        return;
    }

    if (error instanceof ProfilePictureAuthorizationError) {
        res.status(403).json({ success: false, message: error.message });
        return;
    }

    if (error instanceof ProfilePictureUploadError) {
        res.status(500).json({ success: false, message: error.message });
        return;
    }

    console.error('Profile picture error:', error);
    res.status(500).json({
        success: false,
        message: "An unexpected error occurred while processing the profile picture"
    });
}
