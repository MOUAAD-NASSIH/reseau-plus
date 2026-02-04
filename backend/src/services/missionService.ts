/**
 * Mission Service
 */

import { prisma } from "../lib/prisma";
import { Urgency, MissionStatus } from "../types";
import {
    CreateMissionInput,
    UpdateMissionInput,
    MissionFilters
} from "../types/mission.types";

/**
 * Standard mission include for consistent response structure
 */
const missionInclude = {
    institution: {
        select: {
            id: true,
            institutionName: true,
            city: true,
            userId: true,
            address: true
        }
    },
    requiredSpeciality: true,
    domains: { include: { domain: true } },
    _count: {
        select: {
            applications: true,
            assignments: true
        }
    },
    applications: {
        take: 3,
        orderBy: { appliedAt: 'desc' },
        include: {
            worker: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    user: {
                        select: {
                            profilePicture: true
                        }
                    }
                }
            }
        }
    }
} as const;

/**
 * Create a new mission
 */
export const createMission = async (institutionId: number, data: CreateMissionInput) => {
    const { domainIds, startDate, endDate, ...missionData } = data;

    const mission = await prisma.mission.create({
        data: {
            ...missionData,
            institutionId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            domains: domainIds && domainIds.length > 0 ? {
                create: domainIds.map(id => ({ domainId: id }))
            } : undefined
        },
        include: missionInclude
    });
    return mission;
};

/**
 * Get all missions with comprehensive filtering
 */
export const findAll = async (filters: MissionFilters = {}, page = 1, limit = 10) => {
    const {
        status,
        specialityId,
        domainId,
        urgency,
        startDateFrom,
        startDateTo,
        endDateFrom,
        endDateTo,
        institutionId,
        location,
        minBudget,
        maxBudget
    } = filters;

    const where: any = {};

    // Status filter
    if (status) {
        where.status = status as MissionStatus;
    }

    // Speciality filter
    if (specialityId) {
        where.requiredSpecialityId = Number(specialityId);
    }

    // Domain filter
    if (domainId) {
        where.domains = {
            some: {
                domainId: Number(domainId)
            }
        };
    }

    // Urgency filter
    if (urgency) {
        where.urgency = urgency as Urgency;
    }

    // Date range filters for startDate
    if (startDateFrom || startDateTo) {
        where.startDate = {};
        if (startDateFrom) {
            where.startDate.gte = new Date(startDateFrom);
        }
        if (startDateTo) {
            where.startDate.lte = new Date(startDateTo);
        }
    }

    // Date range filters for endDate
    if (endDateFrom || endDateTo) {
        where.endDate = {};
        if (endDateFrom) {
            where.endDate.gte = new Date(endDateFrom);
        }
        if (endDateTo) {
            where.endDate.lte = new Date(endDateTo);
        }
    }

    // Institution filter
    if (institutionId) {
        where.institutionId = Number(institutionId);
    }

    // Location filter (partial match)
    if (location) {
        where.location = { contains: location, mode: 'insensitive' };
    }

    // Budget range filters
    if (minBudget !== undefined || maxBudget !== undefined) {
        where.budget = {};
        if (minBudget !== undefined) {
            where.budget.gte = minBudget;
        }
        if (maxBudget !== undefined) {
            where.budget.lte = maxBudget;
        }
    }

    const skip = (page - 1) * limit;

    const [missions, total] = await Promise.all([
        prisma.mission.findMany({
            where,
            skip,
            take: limit,
            include: missionInclude,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.mission.count({ where })
    ]);

    return {
        missions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get available missions for workers (OPEN status only)
 */
export const findAvailable = async (filters: MissionFilters = {}, page = 1, limit = 10) => {
    return findAll({ ...filters, status: 'OPEN' }, page, limit);
};

/**
 * Get missions by institution
 */
export const findByInstitution = async (institutionId: number, filters: MissionFilters = {}, page = 1, limit = 10) => {
    return findAll({ ...filters, institutionId }, page, limit);
};

/**
 * Get mission by ID
 */
export const findById = async (id: number) => {
    return prisma.mission.findUnique({
        where: { id },
        include: {
            ...missionInclude,
            applications: {
                include: {
                    worker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            speciality: true,
                            experienceYears: true,
                            status: true
                        }
                    }
                }
            },
            assignments: {
                include: {
                    worker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    });
};

/**
 * Validate mission ownership
 * @returns true if the institution owns the mission, false otherwise
 */
export const validateOwnership = async (missionId: number, institutionId: number): Promise<boolean> => {
    const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        select: { institutionId: true }
    });

    if (!mission) {
        return false;
    }

    return mission.institutionId === institutionId;
};

/**
 * Update mission
 */
export const update = async (id: number, data: UpdateMissionInput) => {
    const { domainIds, startDate, endDate, ...missionData } = data;

    // Build update data
    const updateData: any = { ...missionData };

    if (startDate !== undefined) {
        updateData.startDate = new Date(startDate);
    }
    if (endDate !== undefined) {
        updateData.endDate = new Date(endDate);
    }

    // Transaction to update mission and domains
    return prisma.$transaction(async (tx) => {
        // Update domain associations if provided
        if (domainIds !== undefined) {
            // Delete existing domains
            await tx.missionDomain.deleteMany({
                where: { missionId: id }
            });

            // Add new domains if any
            if (domainIds.length > 0) {
                await tx.missionDomain.createMany({
                    data: domainIds.map(domainId => ({
                        missionId: id,
                        domainId
                    }))
                });
            }
        }

        return tx.mission.update({
            where: { id },
            data: updateData,
            include: missionInclude
        });
    });
};

/**
 * Delete mission with cascade
 * 
 * Note: Prisma schema has onDelete: Cascade for applications and assignments,
 * so they will be automatically deleted. This function verifies the cascade behavior.
 */
export const deleteMission = async (id: number) => {
    // The Prisma schema has cascade delete configured, so deleting the mission
    // will automatically delete related MissionApplication, MissionAssignment, and MissionDomain records
    return prisma.mission.delete({
        where: { id }
    });
};

/**
 * Get recommended missions for worker based on speciality
 */
export const getRecommendedMissions = async (workerId: number, limit = 5) => {
    const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: {
            specialityId: true,
            domains: { select: { domainId: true } }
        }
    });

    if (!worker?.specialityId) {
        const result = await findAvailable({}, 1, limit);
        return result.missions;
    }

    // Get missions matching worker's speciality or domains
    const workerDomainIds = worker.domains.map(d => d.domainId);

    const missions = await prisma.mission.findMany({
        where: {
            status: 'OPEN',
            OR: [
                { requiredSpecialityId: worker.specialityId },
                workerDomainIds.length > 0 ? {
                    domains: {
                        some: {
                            domainId: { in: workerDomainIds }
                        }
                    }
                } : {}
            ].filter(condition => Object.keys(condition).length > 0)
        },
        include: missionInclude,
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    return missions;
};

/**
 * Check if mission exists
 */
export const exists = async (id: number): Promise<boolean> => {
    const count = await prisma.mission.count({ where: { id } });
    return count > 0;
};

/**
 * Get mission counts by status for an institution
 */
export const getStatusCounts = async (institutionId: number) => {
    const counts = await prisma.mission.groupBy({
        by: ['status'],
        where: { institutionId },
        _count: { status: true }
    });

    const stats = {
        total: 0,
        open: 0,
        ongoing: 0,
        closed: 0,
        cancelled: 0
    };

    counts.forEach(curr => {
        const lowerStatus = curr.status.toLowerCase();
        if (lowerStatus === 'open') stats.open = curr._count.status;
        else if (lowerStatus === 'ongoing') stats.ongoing = curr._count.status;
        else if (lowerStatus === 'closed') stats.closed = curr._count.status;
        else if (lowerStatus === 'cancelled') stats.cancelled = curr._count.status;
    });

    stats.total = stats.open + stats.ongoing + stats.closed + stats.cancelled;

    return stats;
};

