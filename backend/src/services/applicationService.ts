/**
 * Application Service
 */

import { prisma } from "../lib/prisma";
import { ApplicationFilters, ApplicationStatus } from "../types/application.types";
import { createNotification } from "./notificationService";

/**
 * Custom error class for application-related errors
 */
export class ApplicationError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = "ApplicationError";
    }
}

/**
 * Apply to a mission
 */
export const applyToMission = async (workerId: number, missionId: number) => {
    // Get worker with status
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { id: true, status: true, userId: true }
    });

    if (!worker) {
        throw new ApplicationError("Worker not found", 404);
    }

    // Non-Verified Worker Application 
    if (worker.status !== "VERIFIED") {
        throw new ApplicationError("Only verified workers can apply to missions", 403);
    }

    // Check if mission exists and is OPEN
    const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: { institution: { select: { userId: true } } }
    });

    if (!mission) {
        throw new ApplicationError("Mission not found", 404);
    }

    if (mission.status !== "OPEN") {
        throw new ApplicationError("Mission is not open for applications", 400);
    }

    // Duplicate Application Prevention
    const existingApplication = await prisma.missionApplication.findUnique({
        where: {
            missionId_workerId: {
                missionId,
                workerId
            }
        }
    });

    if (existingApplication) {
        throw new ApplicationError("Already applied to this mission", 409);
    }

    // Verified Worker Application Creation
    const application = await prisma.missionApplication.create({
        data: {
            missionId,
            workerId,
            status: "SUBMITTED"
        },
        include: {
            mission: {
                include: {
                    institution: { select: { institutionName: true, userId: true } }
                }
            },
            worker: { select: { firstName: true, lastName: true } }
        }
    });

    // Notify institution about new application
    await createNotification(
        mission.institution.userId,
        "APPLICATION_SUBMITTED",
        `New application received from ${application.worker.firstName} ${application.worker.lastName} for mission "${mission.title}"`,
        application.id,
        'APPLICATION'
    );

    return application;
};

/**
 * Withdraw an application
 */
export const withdrawApplication = async (workerId: number, applicationId: number) => {
    const application = await prisma.missionApplication.findUnique({
        where: { id: applicationId },
        include: { mission: true }
    });

    if (!application) {
        throw new ApplicationError("Application not found", 404);
    }

    if (application.workerId !== workerId) {
        throw new ApplicationError("Not authorized to withdraw this application", 403);
    }

    if (application.status !== "SUBMITTED") {
        throw new ApplicationError("Cannot withdraw processed application", 400);
    }

    return await prisma.missionApplication.delete({
        where: { id: applicationId }
    });
};

/**
 * Get worker's applications with optional filtering
 */
export const getWorkerApplications = async (
    workerId: number,
    filters?: { status?: ApplicationStatus; page?: number; limit?: number }
) => {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { workerId };
    if (filters?.status) {
        where.status = filters.status;
    }

    const [applications, total] = await Promise.all([
        prisma.missionApplication.findMany({
            where,
            include: {
                mission: {
                    include: {
                        institution: {
                            select: { institutionName: true, city: true }
                        },
                        requiredSpeciality: true,
                        domains: { include: { domain: true } }
                    }
                }
            },
            orderBy: { appliedAt: "desc" },
            skip,
            take: limit
        }),
        prisma.missionApplication.count({ where })
    ]);

    return {
        applications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get applications for a mission with filtering
 */
export const getMissionApplications = async (
    institutionId: number,
    missionId: number,
    filters?: ApplicationFilters
) => {
    // Verify mission belongs to institution
    const mission = await prisma.mission.findUnique({
        where: { id: missionId }
    });

    if (!mission) {
        throw new ApplicationError("Mission not found", 404);
    }

    if (mission.institutionId !== institutionId) {
        throw new ApplicationError("Not authorized to view applications for this mission", 403);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const where: any = { missionId };
    if (filters?.status) {
        where.status = filters.status;
    }

    // Build worker filter conditions
    const workerWhere: any = {};
    if (filters?.specialityId) {
        workerWhere.specialityId = filters.specialityId;
    }
    if (filters?.minExperience !== undefined) {
        workerWhere.experienceYears = { gte: filters.minExperience };
    }

    // If we have worker filters, add them
    if (Object.keys(workerWhere).length > 0) {
        where.worker = workerWhere;
    }

    // Domain filter requires a more complex query
    if (filters?.domainId) {
        where.worker = {
            ...where.worker,
            domains: {
                some: { domainId: filters.domainId }
            }
        };
    }

    const [applications, total] = await Promise.all([
        prisma.missionApplication.findMany({
            where,
            include: {
                worker: {
                    include: {
                        user: { select: { profilePicture: true } },
                        speciality: true,
                        documents: {
                            where: { type: "DIPLOMA", status: "APPROVED" },
                            select: { id: true, title: true, type: true, status: true, fileUrl: true }
                        },
                        experiences: {
                            orderBy: { startDate: "desc" },
                            take: 5
                        },
                        domains: { include: { domain: true } }
                    }
                }
            },
            orderBy: { appliedAt: "desc" },
            skip,
            take: limit
        }),
        prisma.missionApplication.count({ where })
    ]);

    return {
        applications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Accept an application (creates assignment)
 */
export const acceptApplication = async (institutionId: number, applicationId: number) => {
    const application = await prisma.missionApplication.findUnique({
        where: { id: applicationId },
        include: {
            mission: true,
            worker: { select: { userId: true, firstName: true, lastName: true } }
        }
    });

    if (!application) {
        throw new ApplicationError("Application not found", 404);
    }

    if (application.mission.institutionId !== institutionId) {
        throw new ApplicationError("Not authorized to accept this application", 403);
    }

    if (application.status !== "SUBMITTED") {
        throw new ApplicationError("Application has already been processed", 400);
    }

    // Transaction: Update application, reject others, create assignment
    const result = await prisma.$transaction(async (tx) => {
        // Update application status to ACCEPTED
        const updatedApplication = await tx.missionApplication.update({
            where: { id: applicationId },
            data: { status: "ACCEPTED" }
        });

        // Reject other pending applications for this mission
        await tx.missionApplication.updateMany({
            where: {
                missionId: application.missionId,
                id: { not: applicationId },
                status: "SUBMITTED"
            },
            data: { status: "REJECTED" }
        });

        // Update mission status to ONGOING
        await tx.mission.update({
            where: { id: application.missionId },
            data: { status: "ONGOING" }
        });

        // Create assignment with ACTIVE status
        const assignment = await tx.missionAssignment.create({
            data: {
                missionId: application.missionId,
                workerId: application.workerId,
                institutionId: institutionId,
                status: "ACTIVE"
            },
            include: {
                mission: true,
                worker: { select: { firstName: true, lastName: true, userId: true } },
                institution: { select: { institutionName: true } }
            }
        });

        return { application: updatedApplication, assignment };
    });

    // Notify worker about acceptance
    await createNotification(
        application.worker.userId,
        "APPLICATION_ACCEPTED",
        `Your application for mission "${application.mission.title}" has been accepted!`,
        result.assignment.id,
        'ASSIGNMENT'
    );

    // Notify other applicants about rejection
    const rejectedApplications = await prisma.missionApplication.findMany({
        where: {
            missionId: application.missionId,
            status: "REJECTED",
            id: { not: applicationId }
        },
        include: { worker: { select: { userId: true } } }
    });

    for (const rejected of rejectedApplications) {
        await createNotification(
            rejected.worker.userId,
            "APPLICATION_REJECTED",
            `Your application for mission "${application.mission.title}" was not selected.`,
            application.missionId,
            'MISSION'
        );
    }

    return result;
};

/**
 * Reject an application
 */
export const rejectApplication = async (institutionId: number, applicationId: number) => {
    const application = await prisma.missionApplication.findUnique({
        where: { id: applicationId },
        include: {
            mission: true,
            worker: { select: { userId: true } }
        }
    });

    if (!application) {
        throw new ApplicationError("Application not found", 404);
    }

    if (application.mission.institutionId !== institutionId) {
        throw new ApplicationError("Not authorized to reject this application", 403);
    }

    if (application.status !== "SUBMITTED") {
        throw new ApplicationError("Application has already been processed", 400);
    }

    const updatedApplication = await prisma.missionApplication.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
        include: {
            mission: { select: { title: true } }
        }
    });

    // Notify worker about rejection
    await createNotification(
        application.worker.userId,
        "APPLICATION_REJECTED",
        `Your application for mission "${application.mission.title}" has been rejected.`
    );

    return updatedApplication;
};

/**
 * Get application by ID
 */
export const getApplicationById = async (applicationId: number) => {
    const application = await prisma.missionApplication.findUnique({
        where: { id: applicationId },
        include: {
            mission: {
                include: {
                    institution: { select: { institutionName: true, city: true } }
                }
            },
            worker: {
                include: {
                    speciality: true,
                    documents: {
                        where: { type: "DIPLOMA", status: "APPROVED" },
                        select: { id: true, title: true, type: true, status: true, fileUrl: true }
                    },
                    experiences: true,
                    domains: { include: { domain: true } }
                }
            }
        }
    });

    if (!application) {
        throw new ApplicationError("Application not found", 404);
    }

    return application;
};

/**
 * Check if worker can apply to mission (utility function for validation)
 */
export const canWorkerApply = async (workerId: number, missionId: number): Promise<{
    canApply: boolean;
    reason?: string;
}> => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { status: true }
    });

    if (!worker) {
        return { canApply: false, reason: "Worker not found" };
    }

    if (worker.status !== "VERIFIED") {
        return { canApply: false, reason: "Worker must be verified to apply" };
    }

    const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        select: { status: true }
    });

    if (!mission) {
        return { canApply: false, reason: "Mission not found" };
    }

    if (mission.status !== "OPEN") {
        return { canApply: false, reason: "Mission is not open for applications" };
    }

    const existingApplication = await prisma.missionApplication.findUnique({
        where: {
            missionId_workerId: { missionId, workerId }
        }
    });

    if (existingApplication) {
        return { canApply: false, reason: "Already applied to this mission" };
    }

    return { canApply: true };
};
