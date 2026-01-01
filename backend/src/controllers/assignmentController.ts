/**
 * Assignment Controller
 */

import { Response } from "express";
import asyncHandler from "express-async-handler";
import * as assignmentService from "../services/assignmentService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { AssignmentStatus } from "../types";

/**
 * @desc    Get all assignments (filtered by role)
 * @route   GET /api/assignments
 * @access  Private (Worker, Institution, Admin)
 */
export const getAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    const { status, missionId, assignedAfter, assignedBefore } = req.query;

    const filters = {
        status: status as AssignmentStatus | undefined,
        missionId: missionId ? Number(missionId) : undefined,
        assignedAfter: assignedAfter as string | undefined,
        assignedBefore: assignedBefore as string | undefined
    };

    let assignments;

    // Filter based on user role
    if (user.role === 'worker' && user.workerId) {
        assignments = await assignmentService.getWorkerAssignments(user.workerId, filters);
    } else if (user.role === 'institution' && user.institutionId) {
        assignments = await assignmentService.getInstitutionAssignments(user.institutionId, filters);
    } else if (user.role === 'admin') {
        assignments = await assignmentService.getAllAssignments(filters);
    } else {
        res.status(403).json({
            success: false,
            message: "Not authorized to view assignments"
        });
        return;
    }

    res.json({
        success: true,
        data: assignments
    });
});

/**
 * @desc    Get assignment by ID
 * @route   GET /api/assignments/:id
 * @access  Private (Worker, Institution, Admin)
 */
export const getAssignmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = Number(req.params.id);
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    try {
        const assignment = await assignmentService.getAssignmentById(assignmentId);

        // Verify access based on role
        if (user.role === 'worker' && assignment.workerId !== user.workerId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view this assignment"
            });
            return;
        }

        if (user.role === 'institution' && assignment.institutionId !== user.institutionId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view this assignment"
            });
            return;
        }

        res.json({
            success: true,
            data: assignment
        });
    } catch (error) {
        if (error instanceof assignmentService.AssignmentError) {
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
 * @desc    Update assignment status
 * @route   PUT /api/assignments/:id/status
 * @access  Private (Institution, Admin)
 */
export const updateAssignmentStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = Number(req.params.id);
    const { status } = req.body;
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Not authorized"
        });
        return;
    }

    // Only institutions and admins can update assignment status
    if (user.role !== 'institution' && user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: "Not authorized to update assignment status"
        });
        return;
    }

    try {
        const updatedAssignment = await assignmentService.updateAssignmentStatus(
            assignmentId,
            status as AssignmentStatus,
            user.userId,
            user.role
        );

        // Send notifications about status change
        await assignmentService.notifyAssignmentStatusChange(updatedAssignment, status);

        let message = "Assignment status updated successfully";
        if (status === 'COMPLETED') {
            message = "Assignment completed. Payment record created.";
        } else if (status === 'CANCELLED') {
            message = "Assignment cancelled.";
        } else if (status === 'ONGOING') {
            message = "Assignment is now in progress.";
        }

        res.json({
            success: true,
            data: updatedAssignment,
            message
        });
    } catch (error) {
        if (error instanceof assignmentService.AssignmentError) {
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
 * @desc    Get worker's assignments
 * @route   GET /api/assignments/my
 * @access  Private (Worker)
 */
export const getMyAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const workerId = req.user?.workerId;

    if (!workerId) {
        res.status(400).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    const { status, assignedAfter, assignedBefore } = req.query;

    const filters = {
        status: status as AssignmentStatus | undefined,
        assignedAfter: assignedAfter as string | undefined,
        assignedBefore: assignedBefore as string | undefined
    };

    const assignments = await assignmentService.getWorkerAssignments(workerId, filters);

    res.json({
        success: true,
        data: assignments
    });
});

/**
 * @desc    Get institution's assignments
 * @route   GET /api/assignments/institution
 * @access  Private (Institution)
 */
export const getInstitutionAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
        res.status(400).json({
            success: false,
            message: "Institution profile not found"
        });
        return;
    }

    const { status, assignedAfter, assignedBefore } = req.query;

    const filters = {
        status: status as AssignmentStatus | undefined,
        assignedAfter: assignedAfter as string | undefined,
        assignedBefore: assignedBefore as string | undefined
    };

    const assignments = await assignmentService.getInstitutionAssignments(institutionId, filters);

    res.json({
        success: true,
        data: assignments
    });
});
