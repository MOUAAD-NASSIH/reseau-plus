import { prisma } from "../lib/prisma";

// Get all domains
export const getAllDomains = async () => {
    return prisma.domain.findMany({
        orderBy: { name: 'asc' }
    });
};

// Get domain by ID
export const getDomainById = async (id: number) => {
    return prisma.domain.findUnique({
        where: { id }
    });
};
