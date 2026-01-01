/**
 * Worker Service
 */

import { prisma } from "../lib/prisma";
import cloudinary from "../lib/cloudinary";
import { WorkerFilters, UpdateWorkerInput, ExperienceInput, AvailabilityInput } from "../types/worker.types";

/**
 * Get all workers with optional filters (admin use)
 */
export const findAll = async (filters?: WorkerFilters, page = 1, limit = 10) => {
    const where: any = {};

    if (filters?.status) {
        where.status = filters.status;
    }
    if (filters?.specialityId) {
        where.specialityId = filters.specialityId;
    }
    if (filters?.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.domainId) {
        where.domains = {
            some: { domainId: filters.domainId }
        };
    }
    if (filters?.minExperience !== undefined || filters?.maxExperience !== undefined) {
        where.experienceYears = {};
        if (filters?.minExperience !== undefined) {
            where.experienceYears.gte = filters.minExperience;
        }
        if (filters?.maxExperience !== undefined) {
            where.experienceYears.lte = filters.maxExperience;
        }
    }

    const skip = (page - 1) * limit;

    const [workers, total] = await Promise.all([
        prisma.worker.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true
                    }
                },
                speciality: true,
                domains: {
                    include: { domain: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.worker.count({ where })
    ]);

    return {
        workers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get worker by ID (public view - less sensitive data)
 */
export const findById = async (id: number) => {
    return prisma.worker.findUnique({
        where: { id },
        include: {
            speciality: true,
            domains: {
                include: { domain: true }
            },
            experiences: { orderBy: { startDate: 'desc' } }
        }
    });
};

/**
 * Get worker by user ID (full profile for owner)
 */
export const findByUserId = async (userId: number) => {
    return prisma.worker.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true
                }
            },
            speciality: true,
            domains: {
                include: { domain: true }
            },
            documents: { orderBy: { uploadedAt: 'desc' } },
            experiences: { orderBy: { startDate: 'desc' } },
            availabilities: { orderBy: { startDate: 'desc' } }
        }
    });
};

/**
 * Update worker profile
 */
export const update = async (id: number, data: UpdateWorkerInput) => {
    // Convert string dates to Date objects if needed
    const updateData: any = { ...data };
    if (data.birthDate && typeof data.birthDate === 'string') {
        updateData.birthDate = new Date(data.birthDate);
    }

    return prisma.worker.update({
        where: { id },
        data: updateData,
        include: {
            speciality: true,
            domains: {
                include: { domain: true }
            }
        }
    });
};

/**
 * Update worker profile by user ID
 */
export const updateByUserId = async (userId: number, data: UpdateWorkerInput) => {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
        throw new Error("Worker not found");
    }
    return update(worker.id, data);
};

/**
 * Upload document with Cloudinary integration
 */
export const uploadDocument = async (
    workerId: number,
    file: Express.Multer.File,
    type: string
): Promise<any> => {
    // File is already uploaded to Cloudinary via multer-storage-cloudinary
    // The file.path contains the Cloudinary URL
    const document = await prisma.workerDocument.create({
        data: {
            workerId,
            type: type.toUpperCase(),
            fileUrl: file.path,
            status: 'PENDING'
        }
    });

    return document;
};

/**
 * Get worker documents
 */
export const getDocuments = async (workerId: number) => {
    return prisma.workerDocument.findMany({
        where: { workerId },
        orderBy: { uploadedAt: 'desc' }
    });
};

/**
 * Delete worker document (Note: workers cannot directly modify documents)
 * This creates an admin action request instead
 */
export const deleteDocument = async (workerId: number, documentId: number) => {
    // Verify document belongs to this worker
    const document = await prisma.workerDocument.findFirst({
        where: {
            id: documentId,
            workerId
        }
    });

    if (!document) {
        throw new Error("Document not found or unauthorized");
    }

    // Delete from Cloudinary if URL exists
    if (document.fileUrl) {
        try {
            // Extract public_id from Cloudinary URL
            const urlParts = document.fileUrl.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicIdWithExt);
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
        }
    }

    return prisma.workerDocument.delete({
        where: { id: documentId }
    });
};

/**
 * Add experience
 */
export const addExperience = async (workerId: number, data: ExperienceInput) => {
    return prisma.workerExperience.create({
        data: {
            workerId,
            jobTitle: data.jobTitle,
            organization: data.organization,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            description: data.description || null
        }
    });
};

/**
 * Update experience
 */
export const updateExperience = async (
    workerId: number,
    experienceId: number,
    data: Partial<ExperienceInput>
) => {
    // Verify experience belongs to this worker
    const experience = await prisma.workerExperience.findFirst({
        where: {
            id: experienceId,
            workerId
        }
    });

    if (!experience) {
        throw new Error("Experience not found or unauthorized");
    }

    const updateData: any = {};
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.organization !== undefined) updateData.organization = data.organization;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.description !== undefined) updateData.description = data.description;

    return prisma.workerExperience.update({
        where: { id: experienceId },
        data: updateData
    });
};

/**
 * Delete experience
 */
export const deleteExperience = async (workerId: number, experienceId: number) => {
    // Verify experience belongs to this worker
    const experience = await prisma.workerExperience.findFirst({
        where: {
            id: experienceId,
            workerId
        }
    });

    if (!experience) {
        throw new Error("Experience not found or unauthorized");
    }

    return prisma.workerExperience.delete({
        where: { id: experienceId }
    });
};

/**
 * Get experiences
 */
export const getExperiences = async (workerId: number) => {
    return prisma.workerExperience.findMany({
        where: { workerId },
        orderBy: { startDate: 'desc' }
    });
};

/**
 * Add availability
 */
export const addAvailability = async (workerId: number, data: AvailabilityInput) => {
    return prisma.workerAvailability.create({
        data: {
            workerId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isRecurring: data.isRecurring || false
        }
    });
};

/**
 * Update availability
 */
export const updateAvailability = async (
    workerId: number,
    availabilityId: number,
    data: Partial<AvailabilityInput>
) => {
    // Verify availability belongs to this worker
    const availability = await prisma.workerAvailability.findFirst({
        where: {
            id: availabilityId,
            workerId
        }
    });

    if (!availability) {
        throw new Error("Availability not found or unauthorized");
    }

    const updateData: any = {};
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;

    return prisma.workerAvailability.update({
        where: { id: availabilityId },
        data: updateData
    });
};

/**
 * Delete availability
 */
export const deleteAvailability = async (workerId: number, availabilityId: number) => {
    // Verify availability belongs to this worker
    const availability = await prisma.workerAvailability.findFirst({
        where: {
            id: availabilityId,
            workerId
        }
    });

    if (!availability) {
        throw new Error("Availability not found or unauthorized");
    }

    return prisma.workerAvailability.delete({
        where: { id: availabilityId }
    });
};

/**
 * Get availabilities
 */
export const getAvailabilities = async (workerId: number) => {
    return prisma.workerAvailability.findMany({
        where: { workerId },
        orderBy: { startDate: 'desc' }
    });
};

/**
 * Add domain association
 */
export const addDomain = async (workerId: number, domainId: number) => {
    // Check if domain exists
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) {
        throw new Error("Domain not found");
    }

    // Check if association already exists
    const existing = await prisma.workerDomain.findUnique({
        where: {
            workerId_domainId: { workerId, domainId }
        }
    });

    if (existing) {
        throw new Error("Domain already associated with worker");
    }

    return prisma.workerDomain.create({
        data: { workerId, domainId },
        include: { domain: true }
    });
};

/**
 * Remove domain association
 */
export const removeDomain = async (workerId: number, domainId: number) => {
    // Verify association exists
    const association = await prisma.workerDomain.findUnique({
        where: {
            workerId_domainId: { workerId, domainId }
        }
    });

    if (!association) {
        throw new Error("Domain association not found");
    }

    return prisma.workerDomain.delete({
        where: { id: association.id }
    });
};

/**
 * Update all worker domains (replace existing)
 */
export const updateDomains = async (workerId: number, domainIds: number[]) => {
    // Delete existing domains
    await prisma.workerDomain.deleteMany({
        where: { workerId }
    });

    // Create new domain relationships
    if (domainIds.length > 0) {
        await prisma.workerDomain.createMany({
            data: domainIds.map(domainId => ({
                workerId,
                domainId
            }))
        });
    }

    return prisma.worker.findUnique({
        where: { id: workerId },
        include: {
            domains: {
                include: { domain: true }
            }
        }
    });
};

/**
 * Get worker domains
 */
export const getDomains = async (workerId: number) => {
    return prisma.workerDomain.findMany({
        where: { workerId },
        include: { domain: true }
    });
};

