/**
 * Authentication Controller
 */

import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
    getUserByEmail,
    hashPassword,
    comparePassword,
    generateToken,
    generateSecureToken,
    verifyEmailToken,
    generatePasswordResetToken,
    resetPasswordWithToken,
    createWorkerUser,
    createInstitutionUser
} from "../services/authServices";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService";
import { RoleType } from "../types/auth.types";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
        res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
        return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
        return;
    }

    const roleName = user.role.name as RoleType;
    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: roleName
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: roleName,
                status: user.status,
                createdAt: user.createdAt
            },
            token
        }
    });
});


/**
 * Register worker
 * POST /api/auth/register/worker
 */
const registerWorker = asyncHandler(async (req: Request, res: Response) => {
    const {
        email, password, firstName, lastName,
        specialityId, domainIds, experiences,
        experienceYears, bio, city,
        zipCode, latitude, longitude, birthDate, gender
    } = req.body;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "files", message: "files is required" }]
        });
        return;
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(409).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "body.email", message: "User with this email already exists" }]
        });
        return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Parse domainIds
    const parsedDomainIds = domainIds ? JSON.parse(domainIds) : [];

    // Parse experiences
    const parsedExperiences = experiences ? JSON.parse(experiences).map((exp: any) => ({
        jobTitle: exp.jobTitle,
        organization: exp.organization,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        description: exp.description || null,
    })) : [];

    try {
        const { user, worker } = await createWorkerUser(
            { email, password: hashedPassword },
            {
                firstName,
                lastName,
                specialityId: specialityId ? Number(specialityId) : null,
                experienceYears: experienceYears ? Number(experienceYears) : null,
                bio: bio || null,
                city: city || null,
                zipCode: zipCode || null,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                birthDate: birthDate ? new Date(birthDate) : null,
                gender: gender || null,
            },
            parsedDomainIds,
            parsedExperiences
        );

        // Handle File Uploads
        if (files && files.length > 0) {
            const documentPromises = files.map((file) => {
                const docType = file.fieldname.startsWith('document_')
                    ? file.fieldname.replace('document_', '').toUpperCase()
                    : 'OTHER';

                return prisma.workerDocument.create({
                    data: {
                        workerId: worker.id,
                        type: docType,
                        fileUrl: file.path,
                        status: 'PENDING'
                    }
                });
            });

            await Promise.all(documentPromises);
        }

        // Generate and save verification token
        const { token: verificationToken, hashedToken } = generateSecureToken();
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: hashedToken }
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: 'worker'
        });

        res.status(201).json({
            success: true,
            message: "Worker registered successfully! Please verify your email.",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'worker',
                    createdAt: user.createdAt
                },
                worker: {
                    id: worker.id,
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    status: worker.status
                },
                token
            }
        });
    } catch (error) {
        console.error("Worker registration error:", error);
        res.status(400).json({
            success: false,
            message: "Registration failed. Please check your data and try again."
        });
    }
});


/**
 * Register institution
 * POST /api/auth/register/institution
 */
const registerInstitution = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, institutionName, address, city, latitude, longitude } = req.body;

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(409).json({
            success: false,
            message: "User with this email already exists"
        });
        return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    try {
        const { user, institution } = await createInstitutionUser(
            { email, password: hashedPassword },
            {
                institutionName,
                address: address || null,
                city: city || null,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
            }
        );

        // Generate and save verification token
        const { token: verificationToken, hashedToken } = generateSecureToken();
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: hashedToken }
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: 'institution'
        });

        res.status(201).json({
            success: true,
            message: "Institution registered successfully! Please verify your email.",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'institution',
                    createdAt: user.createdAt
                },
                institution: {
                    id: institution.id,
                    institutionName: institution.institutionName
                },
                token
            }
        });
    } catch (error) {
        console.error("Institution registration error:", error);
        res.status(400).json({
            success: false,
            message: "Registration failed. Please check your data and try again."
        });
    }
});

/**
 * Verify email
 * GET /api/auth/verify-email?token=xxx
 */
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;

    const verified = await verifyEmailToken(token);

    if (!verified) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired verification token"
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: "Email verified successfully"
    });
});


/**
 * Forgot password - request reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await generatePasswordResetToken(email);

    if (!result) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent"
        });
        return;
    }

    try {
        await sendPasswordResetEmail(result.user.email, result.token);
        res.status(200).json({
            success: true,
            message: "Password reset email sent"
        });
    } catch (error) {
        // Clear the reset token on email failure
        await prisma.user.update({
            where: { id: result.user.id },
            data: { passwordResetToken: null, passwordResetExpires: null }
        });
        res.status(500).json({
            success: false,
            message: "Failed to send password reset email"
        });
    }
});

/**
 * Reset password with token
 * POST /api/auth/reset-password?token=xxx
 */
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const { password } = req.body;

    const success = await resetPasswordWithToken(token, password);

    if (!success) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired reset token"
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: "Password reset successfully"
    });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
        res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: {
            user: authReq.user
        }
    });
});

export {
    login,
    registerWorker,
    registerInstitution,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
};
