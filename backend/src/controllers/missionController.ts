/**
 * Mission Controller
 */

import { Response } from "express";
import asyncHandler from "express-async-handler";
import * as missionService from "../services/missionService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { MissionFilters } from "../types/mission.types";

/**
 * @desc    Create a new mission
 * @route   POST /api/missions
 * @access  Private (Institution only)
 */
export const createMission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user?.institutionId) {
        res.status(403).json({
            success: false,
            message: "Only institutions can create missions"
        });
        return;
    }

    const mission = await missionService.createMission(user.institutionId, req.body);

    res.status(201).json({
        success: true,
        data: mission,
        message: "Mission created successfully"
    });
});

/**
 * @desc    Get all missions with filters
 * @route   GET /api/missions
 * @access  Private (Admin)
 */
export const getAllMissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await missionService.findAll(
        filters as MissionFilters,
        Number(page),
        Number(limit)
    );

    res.json({
        success: true,
        data: result.missions,
        pagination: result.pagination
    });
});

/**
 * @desc    Get available missions for workers (OPEN status)
 * @route   GET /api/missions/available
 * @access  Private (Verified Workers)
 */
export const getAvailableMissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await missionService.findAvailable(
        filters as MissionFilters,
        Number(page),
        Number(limit)
    );

    res.json({
        success: true,
        data: result.missions,
        pagination: result.pagination
    });
});

/**
 * @desc    Get institution's own missions
 * @route   GET /api/missions/my
 * @access  Private (Institution only)
 */
export const getMyMissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user?.institutionId) {
        res.status(403).json({
            success: false,
            message: "Only institutions can access this endpoint"
        });
        return;
    }

    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await missionService.findByInstitution(
        user.institutionId,
        filters as MissionFilters,
        Number(page),
        Number(limit)
    );

    res.json({
        success: true,
        data: result.missions,
        pagination: result.pagination
    });
});

/**
 * @desc    Get mission by ID
 * @route   GET /api/missions/:id
 * @access  Private
 */
export const getMissionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const mission = await missionService.findById(id);

    if (!mission) {
        res.status(404).json({
            success: false,
            message: "Mission not found"
        });
        return;
    }

    res.json({
        success: true,
        data: mission
    });
});

/**
 * @desc    Update mission
 * @route   PUT /api/missions/:id
 * @access  Private (Institution Owner only)
 */
export const updateMission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user;

    if (!user?.institutionId) {
        res.status(403).json({
            success: false,
            message: "Only institutions can update missions"
        });
        return;
    }

    // Validate ownership
    const isOwner = await missionService.validateOwnership(id, user.institutionId);

    if (!isOwner) {
        // Check if mission exists
        const exists = await missionService.exists(id);
        if (!exists) {
            res.status(404).json({
                success: false,
                message: "Mission not found"
            });
            return;
        }

        res.status(403).json({
            success: false,
            message: "Not authorized to update this mission"
        });
        return;
    }

    const updatedMission = await missionService.update(id, req.body);

    res.json({
        success: true,
        data: updatedMission,
        message: "Mission updated successfully"
    });
});

/**
 * @desc    Delete mission
 * @route   DELETE /api/missions/:id
 * @access  Private (Institution Owner only)
 */
export const deleteMission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user;

    if (!user?.institutionId) {
        res.status(403).json({
            success: false,
            message: "Only institutions can delete missions"
        });
        return;
    }

    // Validate ownership
    const isOwner = await missionService.validateOwnership(id, user.institutionId);

    if (!isOwner) {
        // Check if mission exists
        const exists = await missionService.exists(id);
        if (!exists) {
            res.status(404).json({
                success: false,
                message: "Mission not found"
            });
            return;
        }

        res.status(403).json({
            success: false,
            message: "Not authorized to delete this mission"
        });
        return;
    }

    await missionService.deleteMission(id);

    res.json({
        success: true,
        message: "Mission deleted successfully"
    });
});

/**
 * @desc    Get recommended missions for worker
 * @route   GET /api/missions/recommended
 * @access  Private (Worker only)
 */
export const getRecommendedMissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user?.workerId) {
        res.status(403).json({
            success: false,
            message: "Only workers can access recommendations"
        });
        return;
    }

    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const missions = await missionService.getRecommendedMissions(user.workerId, limit);

    res.json({
        success: true,
        data: missions
    });
});

/**
 * @desc    Get mission status counts for institution
 * @route   GET /api/missions/stats
 * @access  Private (Institution only)
 */
export const getMissionStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user?.institutionId) {
        res.status(403).json({
            success: false,
            message: "Only institutions can access mission stats"
        });
        return;
    }

    const counts = await missionService.getStatusCounts(user.institutionId);

    res.json({
        success: true,
        data: counts
    });
});
