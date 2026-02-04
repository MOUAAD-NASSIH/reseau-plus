/**
 * Worker Controller
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../lib/prisma";
import * as workerService from "../services/workerService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { WorkerFilters } from "../types/worker.types";

/**
 * Get all workers (admin only)
 * GET /api/workers
 */
export const getWorkers = asyncHandler(async (req: Request, res: Response) => {
    const {
        status,
        specialityId,
        city,
        domainId,
        minExperience,
        maxExperience,
        page = 1,
        limit = 10
    } = req.query;

    const filters: WorkerFilters = {};
    if (status) filters.status = status as any;
    if (specialityId) filters.specialityId = Number(specialityId);
    if (city) filters.city = city as string;
    if (domainId) filters.domainId = Number(domainId);
    if (minExperience) filters.minExperience = Number(minExperience);
    if (maxExperience) filters.maxExperience = Number(maxExperience);

    const result = await workerService.findAll(filters, Number(page), Number(limit));

    res.json({
        success: true,
        data: result.workers,
        pagination: result.pagination
    });
});

/**
 * Get current worker profile
 * GET /api/workers/me
 */
export const getCurrentWorker = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await workerService.findByUserId(userId);

    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    res.json({
        success: true,
        data: worker
    });
});

/**
 * Get worker by ID (public)
 * GET /api/workers/:id
 */
export const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const worker = await workerService.findById(id);

    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    res.json({
        success: true,
        data: worker
    });
});

/**
 * Update current worker profile
 * PUT /api/workers/me
 */
export const updateWorker = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const {
        firstName,
        lastName,
        profilePicture,
        specialityId,
        experienceYears,
        bio,
        city,
        zipCode,
        latitude,
        longitude,
        birthDate,
        gender,
        domainIds
    } = req.body;

    const worker = await workerService.updateByUserId(userId, {
        firstName,
        lastName,
        profilePicture,
        specialityId: specialityId !== undefined ? (specialityId === null ? null : Number(specialityId)) : undefined,
        experienceYears: experienceYears !== undefined ? (experienceYears === null ? null : Number(experienceYears)) : undefined,
        bio,
        city,
        zipCode,
        latitude: latitude !== undefined ? (latitude === null ? null : Number(latitude)) : undefined,
        longitude: longitude !== undefined ? (longitude === null ? null : Number(longitude)) : undefined,
        birthDate: birthDate !== undefined ? (birthDate === null ? null : birthDate) : undefined,
        gender,
        domainIds
    });

    res.json({
        success: true,
        data: worker,
        message: "Profile updated successfully"
    });
});

/**
 * Upload document
 * POST /api/workers/documents
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const file = req.file as Express.Multer.File;
    if (!file) {
        res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "file", message: "file is required" }]
        });
        return;
    }

    const { type, title } = req.body;

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const document = await workerService.uploadDocument(worker.id, file, type, title);

    res.status(201).json({
        success: true,
        data: document,
        message: "Document uploaded successfully"
    });
});

/**
 * Get worker documents
 * GET /api/workers/documents
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const documents = await workerService.getDocuments(worker.id);

    res.json({
        success: true,
        data: documents
    });
});

/**
 * Add experience
 * POST /api/workers/experiences
 */
export const addExperience = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const { jobTitle, organization, startDate, endDate, description } = req.body;

    const experience = await workerService.addExperience(worker.id, {
        jobTitle,
        organization,
        startDate,
        endDate,
        description
    });

    res.status(201).json({
        success: true,
        data: experience,
        message: "Experience added successfully"
    });
});

/**
 * Update experience
 * PUT /api/workers/experiences/:id
 */
export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const experienceId = Number(req.params.id);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const { jobTitle, organization, startDate, endDate, description } = req.body;

    try {
        const experience = await workerService.updateExperience(worker.id, experienceId, {
            jobTitle,
            organization,
            startDate,
            endDate,
            description
        });

        res.json({
            success: true,
            data: experience,
            message: "Experience updated successfully"
        });
    } catch (error: any) {
        if (error.message === "Experience not found or unauthorized") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Delete experience
 * DELETE /api/workers/experiences/:id
 */
export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const experienceId = Number(req.params.id);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    try {
        await workerService.deleteExperience(worker.id, experienceId);

        res.json({
            success: true,
            message: "Experience deleted successfully"
        });
    } catch (error: any) {
        if (error.message === "Experience not found or unauthorized") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Add availability
 * POST /api/workers/availabilities
 */
export const addAvailability = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const { startDate, endDate, status, isRecurring } = req.body;

    console.log('Received availability data:', { startDate, endDate, status, isRecurring });

    const availability = await workerService.addAvailability(worker.id, {
        startDate,
        endDate,
        status,
        isRecurring
    });

    res.status(201).json({
        success: true,
        data: availability,
        message: "Availability added successfully"
    });
});

/**
 * Update availability
 * PUT /api/workers/availabilities/:id
 */
export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const availabilityId = Number(req.params.id);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const { startDate, endDate, status, isRecurring } = req.body;

    try {
        const availability = await workerService.updateAvailability(worker.id, availabilityId, {
            startDate,
            endDate,
            status,
            isRecurring
        });

        res.json({
            success: true,
            data: availability,
            message: "Availability updated successfully"
        });
    } catch (error: any) {
        if (error.message === "Availability not found or unauthorized") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Delete availability
 * DELETE /api/workers/availabilities/:id
 */
export const deleteAvailability = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const availabilityId = Number(req.params.id);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    try {
        await workerService.deleteAvailability(worker.id, availabilityId);

        res.json({
            success: true,
            message: "Availability deleted successfully"
        });
    } catch (error: any) {
        if (error.message === "Availability not found or unauthorized") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Add domain
 * POST /api/workers/domains
 */
export const addDomain = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const { domainId } = req.body;

    try {
        const workerDomain = await workerService.addDomain(worker.id, Number(domainId));

        res.status(201).json({
            success: true,
            data: workerDomain,
            message: "Domain added successfully"
        });
    } catch (error: any) {
        if (error.message === "Domain not found") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        if (error.message === "Domain already associated with worker") {
            res.status(409).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Remove domain
 * DELETE /api/workers/domains/:id
 */
export const removeDomain = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const domainId = Number(req.params.id);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    try {
        await workerService.removeDomain(worker.id, domainId);

        res.json({
            success: true,
            message: "Domain removed successfully"
        });
    } catch (error: any) {
        if (error.message === "Domain association not found") {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * Get worker availabilities
 * GET /api/workers/availabilities
 */
export const getMyAvailabilities = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const availabilities = await workerService.getAvailabilities(worker.id);

    res.json({
        success: true,
        data: availabilities
    });
});

/**
 * Get worker experiences
 * GET /api/workers/experiences
 */
export const getMyExperiences = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker not found"
        });
        return;
    }

    const experiences = await workerService.getExperiences(worker.id);

    res.json({
        success: true,
        data: experiences
    });
});

// Note: Profile picture upload is handled by profileController.ts via /api/profile/worker/picture
