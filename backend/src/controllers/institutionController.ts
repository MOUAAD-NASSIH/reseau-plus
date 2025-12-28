import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as institutionService from "../services/institutionService";
import { AuthenticatedRequest } from "./authController";

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const institution = (req as AuthenticatedRequest).user as any;
    if (!institution) {
        res.status(404);
        throw new Error("Institution profile not found");
    }
    res.json(institution);
});

export const getInstitutionById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const institution = await institutionService.getInstitutionById(id);
    if (!institution) {
        res.status(404);
        throw new Error("Institution not found");
    }
    res.json(institution);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const { institutionName, address, city, latitude, longitude } = req.body;
    const currentInstitution = (req as AuthenticatedRequest).user as any;
    const userId = currentInstitution.userId;

    const institution = await institutionService.updateInstitutionProfile(userId, {
        institutionName,
        address,
        city,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined
    });

    res.json(institution);
});
