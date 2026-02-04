/**
 * Application Controller
 */

import { Response } from "express";
import asyncHandler from "express-async-handler";
import * as applicationService from "../services/applicationService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { ApplicationStatus } from "../types";
import { prisma } from "../lib/prisma";

/**
 * @desc    Apply to mission
 * @route   POST /api/applications
 * @access  Private (Verified Worker)
 */
export const applyToMission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { missionId } = req.body;
    const workerId = req.user?.workerId;

    if (!workerId) {
        res.status(400).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    try {
        const application = await applicationService.applyToMission(workerId, missionId);
        res.status(201).json({
            success: true,
            data: application,
            message: "Application submitted successfully"
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});


/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Private (Worker)
 */
export const withdrawApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applicationId = Number(req.params.id);
    const workerId = req.user?.workerId;

    if (!workerId) {
        res.status(400).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    try {
        await applicationService.withdrawApplication(workerId, applicationId);
        res.json({
            success: true,
            message: "Application withdrawn successfully"
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * @desc    Get my applications (worker)
 * @route   GET /api/applications/my
 * @access  Private (Worker)
 */
export const getMyApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const workerId = req.user?.workerId;

    if (!workerId) {
        res.status(400).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    const { status, page, limit } = req.query;

    const result = await applicationService.getWorkerApplications(workerId, {
        status: status as ApplicationStatus | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined
    });

    res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
    });
});

/**
 * @desc    Get applications for a mission
 * @route   GET /api/applications/mission/:missionId
 * @access  Private (Institution)
 */
export const getApplicationsForMission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const missionId = Number(req.params.missionId);
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
        res.status(400).json({
            success: false,
            message: "Institution profile not found"
        });
        return;
    }

    const { status, specialityId, domainId, minExperience, page, limit } = req.query;

    try {
        const result = await applicationService.getMissionApplications(institutionId, missionId, {
            status: status as ApplicationStatus | undefined,
            specialityId: specialityId ? Number(specialityId) : undefined,
            domainId: domainId ? Number(domainId) : undefined,
            minExperience: minExperience ? Number(minExperience) : undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });

        res.json({
            success: true,
            data: result.applications,
            pagination: result.pagination
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});


/**
 * @desc    Accept application (creates assignment)
 * @route   PUT /api/applications/:id/accept
 * @access  Private (Institution)
 */
export const acceptApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applicationId = Number(req.params.id);
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
        res.status(400).json({
            success: false,
            message: "Institution profile not found"
        });
        return;
    }

    try {
        const result = await applicationService.acceptApplication(institutionId, applicationId);
        res.json({
            success: true,
            data: result,
            message: "Application accepted and assignment created"
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * @desc    Reject application
 * @route   PUT /api/applications/:id/reject
 * @access  Private (Institution)
 */
export const rejectApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applicationId = Number(req.params.id);
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
        res.status(400).json({
            success: false,
            message: "Institution profile not found"
        });
        return;
    }

    try {
        const application = await applicationService.rejectApplication(institutionId, applicationId);
        res.json({
            success: true,
            data: application,
            message: "Application rejected"
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});

/**
 * @desc    Get application by ID
 * @route   GET /api/applications/:id
 * @access  Private (Worker or Institution)
 */
export const getApplicationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applicationId = Number(req.params.id);

    try {
        const application = await applicationService.getApplicationById(applicationId);

        // Verify access - only the worker who applied or the institution that owns the mission can view
        const workerId = req.user?.workerId;
        const institutionId = req.user?.institutionId;

        if (workerId && application.workerId !== workerId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view this application"
            });
            return;
        }

        if (institutionId && application.mission.institution?.institutionName) {
            // Institution is viewing - verify they own the mission
            const mission = await prisma.mission.findUnique({
                where: { id: application.missionId },
                select: { institutionId: true }
            });
            if (mission?.institutionId !== institutionId) {
                res.status(403).json({
                    success: false,
                    message: "Not authorized to view this application"
                });
                return;
            }
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        if (error instanceof applicationService.ApplicationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        throw error;
    }
});
