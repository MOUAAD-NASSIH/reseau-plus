import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/helpers";
import { getUserById } from "../services/userService";
import { getWorkerByUserId } from "../services/workerService";
import { getInstitutionByUserId } from "../services/institutionService";
import { AuthenticatedRequest } from "../controllers/authController";

// protect middleware
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    try {
        // Verify token
        const decoded = verifyToken(token);
        if (!decoded || !decoded.id || !decoded.role) {
            res.status(401);
            throw new Error("Invalid or expired token");
        }

        // fetch user and attach profile
        const user = await getUserById(Number(decoded.id));
        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }

        // attach more detailed profile based on role
        let fullProfile: any = user;
        const roleName = (decoded.role || user.role?.name)?.toString();

        if (roleName === "worker") {
            const worker = await getWorkerByUserId(user.id);
            fullProfile = worker || user;
        } else if (roleName === "institution") {
            const institution = await getInstitutionByUserId(user.id);
            fullProfile = institution || user;
        }

        // attach to req
        (req as AuthenticatedRequest).user = fullProfile;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

// role-based authorization
export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user as any;
        const userRole = user?.role?.name || user?.user?.role?.name;

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403);
            throw new Error("Not authorized to access this route");
        }
        next();
    };
};
