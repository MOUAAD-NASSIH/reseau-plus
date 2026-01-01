/**
 * Speciality Service
 * CRUD operations for specialities
 */

import { prisma } from "../lib/prisma";

export interface CreateSpecialityInput {
    name: string;
    description?: string;
}

export interface UpdateSpecialityInput {
    name?: string;
    description?: string;
}

/**
 * Get all specialities
 */
export const getAllSpecialities = async () => {
    return prisma.speciality.findMany({
        orderBy: { name: 'asc' }
    });
};

/**
 * Get speciality by ID
 */
export const getSpecialityById = async (id: number) => {
    return prisma.speciality.findUnique({
        where: { id }
    });
};

/**
 * Create a new speciality
 */
export const createSpeciality = async (data: CreateSpecialityInput) => {
    return prisma.speciality.create({
        data: {
            name: data.name,
            description: data.description
        }
    });
};

/**
 * Update a speciality
 */
export const updateSpeciality = async (id: number, data: UpdateSpecialityInput) => {
    return prisma.speciality.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description })
        }
    });
};

/**
 * Delete a speciality
 */
export const deleteSpeciality = async (id: number) => {
    return prisma.speciality.delete({
        where: { id }
    });
};

/**
 * Check if speciality exists by name (for uniqueness validation)
 */
export const getSpecialityByName = async (name: string) => {
    return prisma.speciality.findUnique({
        where: { name }
    });
};
