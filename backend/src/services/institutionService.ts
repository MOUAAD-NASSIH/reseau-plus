import { prisma } from "../lib/prisma";

export const getInstitutionByUserId = async (userId: number) => {
    return prisma.institution.findUnique({
        where: { userId },
        include: { user: { include: { role: true } } }
    });
}
