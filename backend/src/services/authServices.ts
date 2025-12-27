import { prisma } from "../lib/prisma";

// Create a new user
export const createUser = async (data: {
    email: string;
    password: string;
    role: 'admin' | 'worker' | 'institution';
}) => {
    const { role, ...rest } = data;
    return prisma.user.create({
        data: {
            ...rest,
            role: {
                connect: { name: role }
            }
        }
    });
};

// Create a new worker user
export const createWorkerUser = async (
    userData: { email: string; password: string; },
    workerData: {
        firstName: string;
        lastName: string;
        specialityId?: number | null;
        experienceYears?: number | null;
        bio?: string | null;
        city?: string | null;
        zipCode?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        birthDate?: Date | null;
        gender?: string | null;
    },
    domainIds?: number[],
    experiences?: Array<{
        jobTitle: string;
        organization: string;
        startDate: Date;
        endDate?: Date | null;
        description?: string | null;
    }>
) => {
    return prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                role: {
                    connect: { name: 'worker' }
                }
            }
        });

        // Create the worker profile
        const worker = await tx.worker.create({
            data: {
                userId: user.id,
                firstName: workerData.firstName,
                lastName: workerData.lastName,
                specialityId: workerData.specialityId,
                experienceYears: workerData.experienceYears,
                bio: workerData.bio,
                city: workerData.city,
                zipCode: workerData.zipCode,
                latitude: workerData.latitude,
                longitude: workerData.longitude,
                birthDate: workerData.birthDate,
                gender: workerData.gender,
            }
        });

        // Create worker-domain relationships if domains provided
        if (domainIds && domainIds.length > 0) {
            await tx.workerDomain.createMany({
                data: domainIds.map(domainId => ({
                    workerId: worker.id,
                    domainId: domainId
                }))
            });
        }

        // Create worker experiences if provided
        if (experiences && experiences.length > 0) {
            await tx.workerExperience.createMany({
                data: experiences.map(exp => ({
                    workerId: worker.id,
                    jobTitle: exp.jobTitle,
                    organization: exp.organization,
                    startDate: exp.startDate,
                    endDate: exp.endDate || null,
                    description: exp.description || null,
                }))
            });
        }

        return { user, worker };
    });
};

// Create a new institution user
export const createInstitutionUser = async (
    userData: { email: string; password: string; },
    institutionData: {
        institutionName: string;
        address?: string | null;
        city?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    }
) => {
    return prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                role: {
                    connect: { name: 'institution' }
                }
            }
        });

        // Create the institution profile
        const institution = await tx.institution.create({
            data: {
                userId: user.id,
                institutionName: institutionData.institutionName,
                address: institutionData.address,
                city: institutionData.city,
                latitude: institutionData.latitude,
                longitude: institutionData.longitude,
            }
        });

        return { user, institution };
    });
};