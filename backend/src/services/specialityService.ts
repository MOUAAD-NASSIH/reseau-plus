import { prisma } from "../lib/prisma";

// Get all specialities
export const getAllSpecialities = async () => {
    return prisma.speciality.findMany({
        orderBy: { name: 'asc' }
    });
};

// Get speciality by ID
export const getSpecialityById = async (id: number) => {
    return prisma.speciality.findUnique({
        where: { id }
    });
};
