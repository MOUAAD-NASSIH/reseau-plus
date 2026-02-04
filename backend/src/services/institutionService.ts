/**
 * Institution Service
 */

import { prisma } from "../lib/prisma";
import { InstitutionFilters, UpdateInstitutionInput } from "../types/institution.types";

/**
 * Get all institutions with optional filters (admin use)
 */
export const findAll = async (filters?: InstitutionFilters, page = 1, limit = 10) => {
    const where: any = {};

    if (filters?.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.search) {
        where.institutionName = { contains: filters.search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [institutions, total] = await Promise.all([
        prisma.institution.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        missions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.institution.count({ where })
    ]);

    return {
        institutions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get institution by ID (public view)
 */
export const findById = async (id: number) => {
    return prisma.institution.findUnique({
        where: { id },
        select: {
            id: true,
            institutionName: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            _count: {
                select: {
                    missions: true
                }
            }
        }
    });
};

/**
 * Get institution by user ID (full profile for owner)
 */
export const findByUserId = async (userId: number) => {
    return prisma.institution.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true
                }
            },
            _count: {
                select: {
                    missions: true,
                    assignments: true,
                    payments: true
                }
            }
        }
    });
};

/**
 * Update institution profile
 */
export const update = async (id: number, data: UpdateInstitutionInput) => {
    return prisma.institution.update({
        where: { id },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    status: true
                }
            }
        }
    });
};

/**
 * Update institution profile by user ID
 */
export const updateByUserId = async (userId: number, data: UpdateInstitutionInput) => {
    const institution = await prisma.institution.findUnique({ where: { userId } });
    if (!institution) {
        throw new Error("Institution not found");
    }
    return update(institution.id, data);
};

