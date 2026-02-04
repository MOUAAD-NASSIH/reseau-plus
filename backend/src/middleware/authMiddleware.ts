/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { verifyToken } from "../services/authServices";
import { prisma } from "../lib/prisma";
import { TokenPayload, RoleType, AuthenticatedUser } from "../types/auth.types";

/**
 * Extended Request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser & { [key: string]: any };
}

/**
 * JWT Authentication Middleware
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
        return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId || !decoded.role) {
        res.status(401).json({
            success: false,
            message: "Not authorized, invalid or expired token"
        });
        return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
    });

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Not authorized, user not found"
        });
        return;
    }

    // Build authenticated user object
    const authUser: AuthenticatedUser = {
        userId: user.id,
        email: user.email,
        role: user.role.name as RoleType,
        profilePicture: user.profilePicture
    };

    // Attach profile data based on role
    if (user.role.name === "worker") {
        const worker = await prisma.worker.findUnique({
            where: { userId: user.id },
            include: {
                speciality: true,
                domains: { include: { domain: true } }
            }
        });
        if (worker) {
            authUser.workerId = worker.id;
            (req as AuthenticatedRequest).user = { ...authUser, worker };
        } else {
            (req as AuthenticatedRequest).user = authUser;
        }
    } else if (user.role.name === "institution") {
        const institution = await prisma.institution.findUnique({
            where: { userId: user.id }
        });
        if (institution) {
            authUser.institutionId = institution.id;
            (req as AuthenticatedRequest).user = { ...authUser, institution };
        } else {
            (req as AuthenticatedRequest).user = authUser;
        }
    } else {
        (req as AuthenticatedRequest).user = authUser;
    }

    next();
});


/**
 * Role-Based Access Control Middleware
 */
export const authorizeRoles = (...allowedRoles: RoleType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Not authorized, no user found"
            });
            return;
        }

        const userRole = user.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "Not authorized to access this route"
            });
            return;
        }

        next();
    };
};

/**
 * Verified Worker Check Middleware
 */
export const requireVerifiedWorker = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Not authorized, no user found"
        });
        return;
    }

    // Only check for workers
    if (user.role !== 'worker') {
        next();
        return;
    }

    // Get worker status
    const worker = await prisma.worker.findUnique({
        where: { userId: user.userId },
        select: { status: true }
    });

    if (!worker) {
        res.status(404).json({
            success: false,
            message: "Worker profile not found"
        });
        return;
    }

    if (worker.status !== 'VERIFIED') {
        res.status(403).json({
            success: false,
            message: "Your account must be verified to access this resource"
        });
        return;
    }

    next();
});

/**
 * Admin Only Middleware
 * Convenience middleware for admin-only routes
 */
export const adminOnly = authorizeRoles('admin');

/**
 * Worker Only Middleware
 * Convenience middleware for worker-only routes
 */
export const workerOnly = authorizeRoles('worker');

/**
 * Institution Only Middleware
 * Convenience middleware for institution-only routes
 */
export const institutionOnly = authorizeRoles('institution');

/**
 * Worker or Institution Middleware
 * Convenience middleware for routes accessible by workers or institutions
 */
export const workerOrInstitution = authorizeRoles('worker', 'institution');
