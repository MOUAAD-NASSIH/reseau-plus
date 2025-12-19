import { prisma } from "../lib/prisma";

export const getWorkerByUserId = async (userId: number) => {
    return prisma.worker.findUnique({
        where: { userId },
        include: { user: { include: { role: true } } }
    });
}
