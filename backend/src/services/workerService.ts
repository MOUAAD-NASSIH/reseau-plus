import { prisma } from "../lib/prisma";

// Get worker by user ID
export const getWorkerByUserId = async (userId: number) => {
    return prisma.worker.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            },
            speciality: true,
            domains: {
                include: {
                    domain: true
                }
            },
            documents: true,
            experiences: { orderBy: { startDate: 'desc' } },
            availabilities: { orderBy: { startDate: 'desc' } },
        }
    });
};

// Get worker by ID (public view - less sensitive data)
export const getWorkerById = async (id: number) => {
    return prisma.worker.findUnique({
        where: { id },
        include: {
            speciality: true,
            domains: {
                include: {
                    domain: true
                }
            },
            experiences: { orderBy: { startDate: 'desc' } },
        }
    });
};

// Update worker profile
export const updateWorkerProfile = async (
    userId: number,
    data: {
        firstName?: string;
        lastName?: string;
        specialityId?: number | null;
        experienceYears?: number | null;
        bio?: string;
        city?: string;
        zipCode?: string;
        latitude?: number;
        longitude?: number;
        birthDate?: Date;
        gender?: string;
    }
) => {
    return prisma.worker.update({
        where: { userId },
        data,
        include: {
            speciality: true,
            domains: {
                include: {
                    domain: true
                }
            }
        }
    });
};

// Update worker domains
export const updateWorkerDomains = async (userId: number, domainIds: number[]) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Delete existing domains
    await prisma.workerDomain.deleteMany({
        where: { workerId: worker.id }
    });

    // Create new domain relationships
    if (domainIds.length > 0) {
        await prisma.workerDomain.createMany({
            data: domainIds.map(domainId => ({
                workerId: worker.id,
                domainId
            }))
        });
    }

    return getWorkerByUserId(userId);
};

// Get worker documents
export const getWorkerDocuments = async (userId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    return prisma.workerDocument.findMany({
        where: { workerId: worker.id },
        orderBy: { uploadedAt: 'desc' }
    });
};

// Delete worker document
export const deleteWorkerDocument = async (userId: number, documentId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Verify document belongs to this worker
    const document = await prisma.workerDocument.findFirst({
        where: {
            id: documentId,
            workerId: worker.id
        }
    });

    if (!document) throw new Error("Document not found or unauthorized");

    return prisma.workerDocument.delete({
        where: { id: documentId }
    });
};

// Get worker availabilities
export const getWorkerAvailabilities = async (userId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    return prisma.workerAvailability.findMany({
        where: { workerId: worker.id },
        orderBy: { startDate: 'desc' }
    });
};

// Create worker availability
export const createWorkerAvailability = async (
    userId: number,
    data: {
        startDate: Date;
        endDate: Date;
        isRecurring?: boolean;
    }
) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    return prisma.workerAvailability.create({
        data: {
            ...data,
            workerId: worker.id
        }
    });
};

// Update worker availability
export const updateWorkerAvailability = async (
    userId: number,
    availabilityId: number,
    data: {
        startDate?: Date;
        endDate?: Date;
        isRecurring?: boolean;
    }
) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Verify availability belongs to this worker
    const availability = await prisma.workerAvailability.findFirst({
        where: {
            id: availabilityId,
            workerId: worker.id
        }
    });

    if (!availability) throw new Error("Availability not found or unauthorized");

    return prisma.workerAvailability.update({
        where: { id: availabilityId },
        data
    });
};

// Delete worker availability
export const deleteWorkerAvailability = async (userId: number, availabilityId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Verify availability belongs to this worker
    const availability = await prisma.workerAvailability.findFirst({
        where: {
            id: availabilityId,
            workerId: worker.id
        }
    });

    if (!availability) throw new Error("Availability not found or unauthorized");

    return prisma.workerAvailability.delete({
        where: { id: availabilityId }
    });
};

// Get worker experiences
export const getWorkerExperiences = async (userId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    return prisma.workerExperience.findMany({
        where: { workerId: worker.id },
        orderBy: { startDate: 'desc' }
    });
};

// Create worker experience
export const createWorkerExperience = async (
    userId: number,
    data: {
        jobTitle: string;
        organization: string;
        startDate: Date;
        endDate?: Date | null;
        description?: string;
    }
) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    return prisma.workerExperience.create({
        data: {
            ...data,
            workerId: worker.id
        }
    });
};

// Update worker experience
export const updateWorkerExperience = async (
    userId: number,
    experienceId: number,
    data: {
        jobTitle?: string;
        organization?: string;
        startDate?: Date;
        endDate?: Date | null;
        description?: string;
    }
) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Verify experience belongs to this worker
    const experience = await prisma.workerExperience.findFirst({
        where: {
            id: experienceId,
            workerId: worker.id
        }
    });

    if (!experience) throw new Error("Experience not found or unauthorized");

    return prisma.workerExperience.update({
        where: { id: experienceId },
        data
    });
};

// Delete worker experience
export const deleteWorkerExperience = async (userId: number, experienceId: number) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new Error("Worker not found");

    // Verify experience belongs to this worker
    const experience = await prisma.workerExperience.findFirst({
        where: {
            id: experienceId,
            workerId: worker.id
        }
    });

    if (!experience) throw new Error("Experience not found or unauthorized");

    return prisma.workerExperience.delete({
        where: { id: experienceId }
    });
};
