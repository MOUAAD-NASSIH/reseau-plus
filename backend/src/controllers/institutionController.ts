/**
 * Institution Controller
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as institutionService from "../services/institutionService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { InstitutionFilters } from "../types/institution.types";

/**
 * Get all institutions (admin only)
 * GET /api/institutions
 */
export const getInstitutions = asyncHandler(async (req: Request, res: Response) => {
    const { city, search, page = 1, limit = 10 } = req.query;

    const filters: InstitutionFilters = {};
    if (city) filters.city = city as string;
    if (search) filters.search = search as string;

    const result = await institutionService.findAll(filters, Number(page), Number(limit));

    res.json({
        success: true,
        data: result.institutions,
        pagination: result.pagination
    });
});

/**
 * Get current institution profile
 * GET /api/institutions/me
 */
export const getCurrentInstitution = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const institution = await institutionService.findByUserId(userId);

    if (!institution) {
        res.status(404).json({
            success: false,
            message: "Institution profile not found"
        });
        return;
    }

    res.json({
        success: true,
        data: institution
    });
});

/**
 * Get institution by ID (public)
 * GET /api/institutions/:id
 */
export const getInstitutionById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({
            success: false,
            message: "Invalid institution ID"
        });
        return;
    }

    const institution = await institutionService.findById(id);

    if (!institution) {
        res.status(404).json({
            success: false,
            message: "Institution not found"
        });
        return;
    }

    res.json({
        success: true,
        data: institution
    });
});

/**
 * Update current institution profile
 * PUT /api/institutions/me
 */
export const updateInstitution = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const { institutionName, address, city, latitude, longitude } = req.body;

    try {
        const institution = await institutionService.updateByUserId(userId, {
            institutionName,
            address,
            city,
            latitude: latitude !== undefined ? (latitude === null ? null : Number(latitude)) : undefined,
            longitude: longitude !== undefined ? (longitude === null ? null : Number(longitude)) : undefined
        });

        res.json({
            success: true,
            data: institution,
            message: "Profile updated successfully"
        });
    } catch (error: any) {
        if (error.message === "Institution not found") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});


