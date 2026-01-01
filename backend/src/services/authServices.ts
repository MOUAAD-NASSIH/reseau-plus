/**
 * Authentication Service
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { TokenPayload, RoleType } from "../types/auth.types";

const SALT_ROUNDS = 10;
const JWT_EXPIRY = "24h";
const RESET_TOKEN_EXPIRY_MINUTES = 10;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

/**
 * Compare plaintext password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token with user claims
 */
export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(
        { userId: payload.userId, email: payload.email, role: payload.role },
        process.env.JWT_SECRET!,
        { expiresIn: JWT_EXPIRY }
    );
};

/**
 * Verify and decode JWT token
 * Returns null if token is invalid or expired
 */
export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
        return decoded;
    } catch {
        return null;
    }
};

/**
 * Generate a secure random token for email verification or password reset
 */
export const generateSecureToken = (): { token: string; hashedToken: string } => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return { token, hashedToken };
};


/**
 * Hash a token for storage
 */
export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });
};

/**
 * Get user by ID with role
 */
export const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        include: { role: true }
    });
};

/**
 * Create a new user
 */
export const createUser = async (data: {
    email: string;
    password: string;
    role: RoleType;
}) => {
    const { role, ...rest } = data;
    return prisma.user.create({
        data: {
            ...rest,
            role: {
                connect: { name: role }
            }
        },
        include: { role: true }
    });
};

/**
 * Save verification token for a user
 */
export const saveVerificationToken = async (userId: number, hashedToken: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { verificationToken: hashedToken }
    });
};

/**
 * Verify email with token
 */
export const verifyEmailToken = async (token: string): Promise<boolean> => {
    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
        where: { verificationToken: hashedToken }
    });

    if (!user) {
        return false;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken: null,
            status: 'ACTIVE'
        }
    });

    return true;
};


/**
 * Generate and save password reset token
 */
export const generatePasswordResetToken = async (email: string): Promise<{ token: string; user: any } | null> => {
    const user = await getUserByEmail(email);
    if (!user) {
        return null;
    }

    const { token, hashedToken } = generateSecureToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpires: expiresAt
        }
    });

    return { token, user };
};

/**
 * Reset password with token
 */
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<boolean> => {
    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() }
        }
    });

    if (!user) {
        return false;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
        }
    });

    return true;
};

/**
 * Clear password reset token (on failure)
 */
export const clearPasswordResetToken = async (userId: number) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            passwordResetToken: null,
            passwordResetExpires: null
        }
    });
};

/**
 * Create worker user with profile data
 */
export const createWorkerUser = async (
    userData: { email: string; password: string },
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
): Promise<{ user: any; worker: any }> => {
    // Note: Password should already be hashed when calling this function
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                role: { connect: { name: 'worker' } }
            },
            include: { role: true }
        });

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
                status: 'PENDING'
            }
        });

        if (domainIds && domainIds.length > 0) {
            await tx.workerDomain.createMany({
                data: domainIds.map(domainId => ({
                    workerId: worker.id,
                    domainId
                }))
            });
        }

        if (experiences && experiences.length > 0) {
            await tx.workerExperience.createMany({
                data: experiences.map(exp => ({
                    workerId: worker.id,
                    jobTitle: exp.jobTitle,
                    organization: exp.organization,
                    startDate: exp.startDate,
                    endDate: exp.endDate || null,
                    description: exp.description || null
                }))
            });
        }

        return { user, worker };
    });

    return result;
};

/**
 * Create institution user with profile data
 */
export const createInstitutionUser = async (
    userData: { email: string; password: string },
    institutionData: {
        institutionName: string;
        address?: string | null;
        city?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    }
): Promise<{ user: any; institution: any }> => {
    // Note: Password should already be hashed when calling this function
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                role: { connect: { name: 'institution' } }
            },
            include: { role: true }
        });

        const institution = await tx.institution.create({
            data: {
                userId: user.id,
                institutionName: institutionData.institutionName,
                address: institutionData.address,
                city: institutionData.city,
                latitude: institutionData.latitude,
                longitude: institutionData.longitude
            }
        });

        return { user, institution };
    });

    return result;
};


/**
 * Authenticate user and return token
 */
export const login = async (
    email: string,
    password: string
): Promise<{ user: any; token: string }> => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role.name as RoleType
    });

    return { user, token };
};


/**
 * Get current user with profile data
 */
export const getMe = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user) {
        return null;
    }

    const roleName = user.role.name;

    if (roleName === 'worker') {
        const worker = await prisma.worker.findUnique({
            where: { userId },
            include: {
                speciality: true,
                domains: { include: { domain: true } },
                documents: true,
                experiences: { orderBy: { startDate: 'desc' } },
                availabilities: { orderBy: { startDate: 'desc' } }
            }
        });
        return { user, worker };
    }

    if (roleName === 'institution') {
        const institution = await prisma.institution.findUnique({
            where: { userId }
        });
        return { user, institution };
    }

    return { user };
};

