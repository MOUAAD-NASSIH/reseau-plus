/**
 * Domain Service
 * CRUD operations for domains
 */

import { prisma } from "../lib/prisma";

export interface CreateDomainInput {
    name: string;
    description?: string;
}

export interface UpdateDomainInput {
    name?: string;
    description?: string;
}

/**
 * Get all domains
 */
export const getAllDomains = async () => {
    return prisma.domain.findMany({
        orderBy: { name: 'asc' }
    });
};

/**
 * Get domain by ID
 */
export const getDomainById = async (id: number) => {
    return prisma.domain.findUnique({
        where: { id }
    });
};

/**
 * Create a new domain
 */
export const createDomain = async (data: CreateDomainInput) => {
    return prisma.domain.create({
        data: {
            name: data.name,
            description: data.description
        }
    });
};

/**
 * Update a domain
 */
export const updateDomain = async (id: number, data: UpdateDomainInput) => {
    return prisma.domain.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description })
        }
    });
};

/**
 * Delete a domain
 */
export const deleteDomain = async (id: number) => {
    return prisma.domain.delete({
        where: { id }
    });
};

/**
 * Check if domain exists by name (for uniqueness validation)
 */
export const getDomainByName = async (name: string) => {
    return prisma.domain.findUnique({
        where: { name }
    });
};
