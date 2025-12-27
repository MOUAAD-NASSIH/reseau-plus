import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { generateToken } from "../utils/helpers";
import { createWorkerUser, createInstitutionUser } from "../services/authServices";
import { getUserByEmail } from "../services/userService";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService";
import { Institution, User, Worker } from "../utils/types";
import { prisma } from "../lib/prisma";

export interface AuthenticatedRequest extends Request {
    user: User | Worker | Institution;
}

const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide all fields!");
    }

    // check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
        res.status(401);
        throw new Error("user not found!");
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        res.status(401);
        throw new Error("Invalid credentials!");
    }

    const roleName = user.role.name as 'admin' | 'worker' | 'institution';

    res.status(200).json({
        message: "user logged in successfully!",
        user: {
            id: user.id,
            email: user.email,
            role: roleName,
            createdAt: user.createdAt,
        },
        token: generateToken(user.id, roleName),
    });
});

const registerWorker = asyncHandler(async (req: Request, res: Response) => {
    const {
        email, password, firstName, lastName,
        specialityId, domainIds, experiences,
        experienceYears, bio, city,
        zipCode, latitude, longitude, birthDate, gender
    } = req.body;
    const files = req.files as Express.Multer.File[];

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
        res.status(400);
        throw new Error("Please provide all required fields!");
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(409);
        throw new Error("User already exists!");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
            parsedDomainIds, // Pass domain IDs to service
            parsedExperiences // Pass experiences to service
        );

        // Handle File Uploads - extract type from field name
        if (files && files.length > 0) {
            const documentPromises = files.map((file) => {
                // Extract type from fieldname: 'document_DIPLOMA' → 'DIPLOMA'
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

        // Send Verification Email
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        // Save token to user
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: hashedToken }
        });

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            message: "Worker registered successfully! Please verify your email.",
            user: {
                id: user.id,
                email: user.email,
                role: 'worker',
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(400);
        throw new Error("Invalid user data or file upload failed");
    }
});

const registerInstitution = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, institutionName, address, city, latitude, longitude } = req.body;

    if (!email || !password || !institutionName) {
        res.status(400);
        throw new Error("Please provide all required fields!");
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(409);
        throw new Error("User already exists!");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const { user } = await createInstitutionUser(
            { email, password: hashedPassword },
            {
                institutionName,
                address: address || null,
                city: city || null,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
            }
        );

        // Send Verification Email
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: hashedToken }
        });

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            message: "Institution registered successfully! Please verify your email.",
            user: {
                id: user.id,
                email: user.email,
                role: 'institution',
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
        res.status(400);
        throw new Error("Missing verification token");
    }

    const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

    const user = await prisma.user.findFirst({
        where: { verificationToken: hashedToken }
    });

    if (!user) {
        res.status(401);
        throw new Error("Invalid or expired token");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken: null,
            status: 'ACTIVE'
        }
    });

    res.status(200).json({ message: "Email verified successfully" });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
    });

    try {
        await sendPasswordResetEmail(user.email, resetToken);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordResetToken: null, passwordResetExpires: null }
        });
        res.status(500);
        throw new Error("Email sending failed");
    }
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("Missing token")
    }

    if (!password) {
        res.status(400);
        throw new Error("Please provide a new password")
    }

    const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() }
        }
    });

    if (!user) {
        res.status(401);
        throw new Error("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
        }
    });

    res.status(200).json({ message: "Password reset successfully" });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
        message: "authenticated successfully!",
        user: (req as AuthenticatedRequest).user || null,
    });
});

export {
    login,
    registerWorker,
    registerInstitution,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword
}