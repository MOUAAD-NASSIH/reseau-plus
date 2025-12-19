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
        speciality: string;
        experienceYears: number;
        bio?: string;
        location?: string;
    }
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
                ...workerData
            }
        });

        return { user, worker };
    });
};

// Create a new institution user
export const createInstitutionUser = async (
    userData: { email: string; password: string; },
    institutionData: {
        institutionName: string;
        address: string;
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
                ...institutionData
            }
        });

        return { user, institution };
    });
};