import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../lib/prisma";
import * as workerService from "../services/workerService";
import { AuthenticatedRequest } from "./authController";

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const worker = (req as AuthenticatedRequest).user as any;
    if (!worker) {
        res.status(404);
        throw new Error("Worker profile not found");
    }
    res.json(worker);
});

export const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const worker = await workerService.getWorkerById(id);
    if (!worker) {
        res.status(404);
        throw new Error("Worker not found");
    }
    res.json(worker);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const {
        firstName,
        lastName,
        specialityId,
        experienceYears,
        bio,
        city,
        zipCode,
        latitude,
        longitude,
        birthDate,
        gender
    } = req.body;

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const worker = await workerService.updateWorkerProfile(userId, {
        firstName,
        lastName,
        specialityId: specialityId ? Number(specialityId) : null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        bio,
        city,
        zipCode,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender
    });

    res.json(worker);
});

export const updateMyDomains = asyncHandler(async (req: Request, res: Response) => {
    const { domainIds } = req.body;
    if (!Array.isArray(domainIds)) {
        res.status(400);
        throw new Error("domainIds must be an array");
    }

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const worker = await workerService.updateWorkerDomains(userId, domainIds);
    res.json(worker);
});

export const getMyDocuments = asyncHandler(async (req: Request, res: Response) => {
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const documents = await workerService.getWorkerDocuments(userId);
    res.json(documents);
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const { type } = req.body;

    if (!file) {
        res.status(400);
        throw new Error("No file uploaded");
    }

    if (!type) {
        res.status(400);
        throw new Error("Document type is required");
    }

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        res.status(404);
        throw new Error("Worker not found");
    }

    const document = await prisma.workerDocument.create({
        data: {
            workerId: worker.id,
            type: type.toUpperCase(),
            fileUrl: file.path,
            status: 'PENDING'
        }
    });

    res.status(201).json(document);
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.id);
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    await workerService.deleteWorkerDocument(userId, documentId);
    res.json({ message: "Document deleted successfully" });
});

export const getMyAvailabilities = asyncHandler(async (req: Request, res: Response) => {
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const availabilities = await workerService.getWorkerAvailabilities(userId);
    res.json(availabilities);
});

export const createAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, isRecurring } = req.body;

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error("Start date and end date are required");
    }

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const availability = await workerService.createWorkerAvailability(userId, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isRecurring: isRecurring || false
    });

    res.status(201).json(availability);
});

export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const availabilityId = parseInt(req.params.id);
    const { startDate, endDate, isRecurring } = req.body;

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const availability = await workerService.updateWorkerAvailability(userId, availabilityId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isRecurring
    });

    res.json(availability);
});

export const deleteAvailability = asyncHandler(async (req: Request, res: Response) => {
    const availabilityId = parseInt(req.params.id);
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    await workerService.deleteWorkerAvailability(userId, availabilityId);
    res.json({ message: "Availability deleted successfully" });
});

export const getMyExperiences = asyncHandler(async (req: Request, res: Response) => {
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const experiences = await workerService.getWorkerExperiences(userId);
    res.json(experiences);
});

export const createExperience = asyncHandler(async (req: Request, res: Response) => {
    const { jobTitle, organization, startDate, endDate, description } = req.body;

    if (!jobTitle || !organization || !startDate) {
        res.status(400);
        throw new Error("Job title, organization, and start date are required");
    }

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const experience = await workerService.createWorkerExperience(userId, {
        jobTitle,
        organization,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description
    });

    res.status(201).json(experience);
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
    const experienceId = parseInt(req.params.id);
    const { jobTitle, organization, startDate, endDate, description } = req.body;

    const userId = ((req as AuthenticatedRequest).user as any).userId;
    const experience = await workerService.updateWorkerExperience(userId, experienceId, {
        jobTitle,
        organization,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate === null ? null : (endDate ? new Date(endDate) : undefined),
        description
    });

    res.json(experience);
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
    const experienceId = parseInt(req.params.id);
    const userId = ((req as AuthenticatedRequest).user as any).userId;
    await workerService.deleteWorkerExperience(userId, experienceId);
    res.json({ message: "Experience deleted successfully" });
});
