import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { generateToken } from "../utils/helpers";
import { createWorkerUser, createInstitutionUser } from "../services/authServices";
import { getUserByEmail } from "../services/userService";
import { Institution, User, Worker } from "../utils/types";

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
        res.status(400);
        throw new Error("User not found!");
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        res.status(400);
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
    const { email, password, firstName, lastName, speciality, experienceYears, bio, location } = req.body;

    if (!email || !password || !firstName || !lastName || !speciality || !experienceYears) {
        res.status(400);
        throw new Error("Please provide all required fields!");
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists!");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const { user } = await createWorkerUser(
            { email, password: hashedPassword },
            { firstName, lastName, speciality, experienceYears: Number(experienceYears), bio, location }
        );

        res.status(201).json({
            message: "Worker registered successfully!",
            user: {
                id: user.id,
                email: user.email,
                role: 'worker',
                createdAt: user.createdAt,
            },
            // token: generateToken(user.id, 'worker'),
        });
    } catch (error) {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const registerInstitution = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, institutionName, address } = req.body;

    if (!email || !password || !institutionName || !address) {
        res.status(400);
        throw new Error("Please provide all required fields!");
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists!");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const { user } = await createInstitutionUser(
            { email, password: hashedPassword },
            { institutionName, address }
        );

        res.status(201).json({
            message: "Institution registered successfully!",
            user: {
                id: user.id,
                email: user.email,
                role: 'institution',
                createdAt: user.createdAt,
            },
            // token: generateToken(user.id, 'institution'),
        });
    } catch (error) {
        res.status(400);
        throw new Error("Invalid user data");
    }
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
    getMe
}