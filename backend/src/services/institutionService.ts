import { prisma } from "../lib/prisma";

// Get institution by user ID
export const getInstitutionByUserId = async (userId: number) => {
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
            }
        }
    });
};

// Get institution by ID
export const getInstitutionById = async (id: number) => {
    return prisma.institution.findUnique({
        where: { id },
        select: {
            id: true,
            institutionName: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
            createdAt: true
        }
    });
};

// Update institution profile
export const updateInstitutionProfile = async (
    userId: number,
    data: {
        institutionName?: string;
        address?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
    }
) => {
    return prisma.institution.update({
        where: { userId },
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
