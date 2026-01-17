/**
 * Assignment Service
 */

import { prisma } from "../lib/prisma";
import { AssignmentStatus, MissionStatus } from "../types";
import { AssignmentFilters } from "../types/assignment.types";
import * as notificationService from "./notificationService";

const PLATFORM_FEE_PERCENTAGE = 0.15;

/**
 * Custom error class for assignment operations
 */
export class AssignmentError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "AssignmentError";
        this.statusCode = statusCode;
    }
}

/**
 * Valid status transitions
 * ACTIVE → ONGOING → COMPLETED
 * ACTIVE → CANCELLED
 * ONGOING → CANCELLED
 */
const VALID_STATUS_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
    ACTIVE: ['ONGOING', 'CANCELLED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: []  // Terminal state
};

/**
 * Validate status transition
 */
export const isValidStatusTransition = (currentStatus: AssignmentStatus, newStatus: AssignmentStatus): boolean => {
    return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};

/**
 * Create assignment from accepted application
 */
export const createAssignment = async (institutionId: number, applicationId: number) => {
    // 1. Get Application
    const application = await prisma.missionApplication.findUnique({
        where: { id: applicationId },
        include: {
            mission: true,
            worker: { include: { user: true } }
        }
    });

    if (!application) {
        throw new AssignmentError("Application not found", 404);
    }

    // 2. Validate Authorization and Status
    if (application.mission.institutionId !== institutionId) {
        throw new AssignmentError("Unauthorized", 403);
    }

    if (application.status !== 'SUBMITTED') {
        throw new AssignmentError("Application already processed", 409);
    }

    // 3. Transaction: Update Application -> Update Mission -> Create Assignment -> Notify
    return await prisma.$transaction(async (tx) => {
        // Update Application Status to ACCEPTED
        await tx.missionApplication.update({
            where: { id: applicationId },
            data: { status: 'ACCEPTED' }
        });

        // Reject other applications for this mission
        await tx.missionApplication.updateMany({
            where: {
                missionId: application.missionId,
                id: { not: applicationId },
                status: 'SUBMITTED'
            },
            data: { status: 'REJECTED' }
        });

        // Update Mission Status to ASSIGNED (using ONGOING as closest match)
        await tx.mission.update({
            where: { id: application.missionId },
            data: { status: 'ONGOING' }
        });

        // Create Assignment with ACTIVE status
        const assignment = await tx.missionAssignment.create({
            data: {
                missionId: application.missionId,
                workerId: application.workerId,
                institutionId: institutionId,
                status: 'ACTIVE'
            },
            include: {
                mission: true,
                worker: { include: { user: true } },
                institution: { include: { user: true } }
            }
        });

        return assignment;
    });
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (id: number) => {
    const assignment = await prisma.missionAssignment.findUnique({
        where: { id },
        include: {
            mission: true,
            worker: { include: { user: true, speciality: true } },
            institution: { include: { user: true } },
            reviews: true,
            payments: true
        }
    });

    if (!assignment) {
        throw new AssignmentError("Assignment not found", 404);
    }

    return assignment;
};

/**
 * Get worker's assignments
 */
export const getWorkerAssignments = async (workerId: number, filters?: AssignmentFilters) => {
    const where: any = { workerId };

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.assignedAfter) {
        where.assignedAt = { ...where.assignedAt, gte: new Date(filters.assignedAfter) };
    }

    if (filters?.assignedBefore) {
        where.assignedAt = { ...where.assignedAt, lte: new Date(filters.assignedBefore) };
    }

    return await prisma.missionAssignment.findMany({
        where,
        include: {
            mission: {
                include: { institution: true }
            },
            payments: true
        },
        orderBy: { assignedAt: 'desc' }
    });
};

/**
 * Get institution's assignments
 */
export const getInstitutionAssignments = async (institutionId: number, filters?: AssignmentFilters) => {
    const where: any = { institutionId };

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.assignedAfter) {
        where.assignedAt = { ...where.assignedAt, gte: new Date(filters.assignedAfter) };
    }

    if (filters?.assignedBefore) {
        where.assignedAt = { ...where.assignedAt, lte: new Date(filters.assignedBefore) };
    }

    return await prisma.missionAssignment.findMany({
        where,
        include: {
            mission: true,
            worker: { include: { user: true, speciality: true } },
            payments: true
        },
        orderBy: { assignedAt: 'desc' }
    });
};

/**
 * Get all assignments (admin)
 */
export const getAllAssignments = async (filters?: AssignmentFilters) => {
    const where: any = {};

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.missionId) {
        where.missionId = filters.missionId;
    }

    if (filters?.workerId) {
        where.workerId = filters.workerId;
    }

    if (filters?.institutionId) {
        where.institutionId = filters.institutionId;
    }

    if (filters?.assignedAfter) {
        where.assignedAt = { ...where.assignedAt, gte: new Date(filters.assignedAfter) };
    }

    if (filters?.assignedBefore) {
        where.assignedAt = { ...where.assignedAt, lte: new Date(filters.assignedBefore) };
    }

    return await prisma.missionAssignment.findMany({
        where,
        include: {
            mission: true,
            worker: { include: { user: true } },
            institution: { include: { user: true } }
        },
        orderBy: { assignedAt: 'desc' }
    });
};

/**
 * Update assignment status with transition validation
 */
export const updateAssignmentStatus = async (
    id: number,
    newStatus: AssignmentStatus,
    userId: number,
    userRole: string
) => {
    // Get current assignment
    const assignment = await prisma.missionAssignment.findUnique({
        where: { id },
        include: {
            mission: true,
            worker: { include: { user: true } },
            institution: { include: { user: true } }
        }
    });

    if (!assignment) {
        throw new AssignmentError("Assignment not found", 404);
    }

    // Validate authorization
    const isInstitution = userRole === 'institution' && assignment.institution.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isInstitution && !isAdmin) {
        throw new AssignmentError("Unauthorized to update this assignment", 403);
    }

    // Validate status transition
    if (!isValidStatusTransition(assignment.status, newStatus)) {
        throw new AssignmentError(
            `Invalid status transition from ${assignment.status} to ${newStatus}`,
            400
        );
    }

    // Perform update in transaction
    return await prisma.$transaction(async (tx) => {
        // Update assignment status
        const updatedAssignment = await tx.missionAssignment.update({
            where: { id },
            data: { status: newStatus },
            include: {
                mission: true,
                worker: { include: { user: true } },
                institution: { include: { user: true } }
            }
        });

        // Handle status-specific actions
        if (newStatus === 'COMPLETED') {
            // Update mission status to CLOSED
            await tx.mission.update({
                where: { id: assignment.missionId },
                data: { status: 'CLOSED' }
            });

            // Create payment record
            const amount = assignment.mission.budget ? Number(assignment.mission.budget) : 0;

            if (amount > 0) {
                const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
                const workerAmount = Math.round((amount - platformFee) * 100) / 100;

                await tx.payment.create({
                    data: {
                        missionAssignmentId: assignment.id,
                        institutionId: assignment.institutionId,
                        workerId: assignment.workerId,
                        amountTotal: amount,
                        platformFee: platformFee,
                        workerAmount: workerAmount,
                        status: 'PENDING'
                    }
                });
            }
        } else if (newStatus === 'CANCELLED') {
            // Update mission status to CANCELLED
            await tx.mission.update({
                where: { id: assignment.missionId },
                data: { status: 'CANCELLED' }
            });
        } else if (newStatus === 'ONGOING') {
            // Update mission status to ONGOING if not already
            await tx.mission.update({
                where: { id: assignment.missionId },
                data: { status: 'ONGOING' }
            });
        }

        return updatedAssignment;
    });
};

/**
 * Notify parties about assignment status change
 */
export const notifyAssignmentStatusChange = async (
    assignment: any,
    newStatus: AssignmentStatus
) => {
    const workerUserId = assignment.worker.userId;
    const institutionUserId = assignment.institution.userId;
    const missionTitle = assignment.mission.title;

    let workerMessage = '';
    let institutionMessage = '';

    switch (newStatus) {
        case 'ACTIVE':
            workerMessage = `You have been assigned to mission: ${missionTitle}`;
            institutionMessage = `Worker ${assignment.worker.firstName} ${assignment.worker.lastName} has been assigned to mission: ${missionTitle}`;
            break;
        case 'ONGOING':
            workerMessage = `Mission "${missionTitle}" is now in progress`;
            institutionMessage = `Mission "${missionTitle}" is now in progress`;
            break;
        case 'COMPLETED':
            workerMessage = `Mission "${missionTitle}" has been completed. Payment is being processed.`;
            institutionMessage = `Mission "${missionTitle}" has been completed. Please process the payment.`;
            break;
        case 'CANCELLED':
            workerMessage = `Mission "${missionTitle}" has been cancelled`;
            institutionMessage = `Mission "${missionTitle}" has been cancelled`;
            break;
    }

    // Create notifications
    if (workerMessage) {
        await notificationService.createNotification(
            workerUserId,
            `ASSIGNMENT_${newStatus}`,
            workerMessage
        );
    }

    if (institutionMessage) {
        await notificationService.createNotification(
            institutionUserId,
            `ASSIGNMENT_${newStatus}`,
            institutionMessage
        );
    }
};

/**
 * Calculate payment fees
 */
export const calculatePaymentFees = (amount: number) => {
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const workerAmount = Math.round((amount - platformFee) * 100) / 100;

    return {
        amountTotal: amount,
        platformFee,
        workerAmount
    };
};
