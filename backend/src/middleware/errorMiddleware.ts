/**
 * Global Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse, ValidationError, ErrorResponse } from '../types/api.types';

/**
 * Custom application error class for typed errors
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public details?: ValidationError[];

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        details?: ValidationError[]
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

/**
 * Validation Error - 400
 */
export class ValidationAppError extends AppError {
    constructor(message: string = 'Validation failed', details?: ValidationError[]) {
        super(message, 400, true, details);
    }
}

/**
 * Unauthorized Error - 401
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * Forbidden Error - 403
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409);
    }
}

/**
 * Format Zod validation errors into our standard format
 */
const formatZodErrors = (error: ZodError): ValidationError[] => {
    return error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
};

/**
 * Log error details for debugging (server-side only)
 */
const logError = (err: Error, req: Request): void => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.error(`[${timestamp}] ERROR: ${method} ${url}`);
    console.error(`User-Agent: ${userAgent}`);
    console.error(`Message: ${err.message}`);

    if (process.env.NODE_ENV !== 'production') {
        console.error(`Stack: ${err.stack}`);
    }
};

/**
 * Create standardized error response
 */
const createErrorResponse = (
    message: string,
    error: string,
    details?: ValidationError[]
): ErrorResponse => {
    const response: ErrorResponse = {
        success: false,
        error,
        message,
    };

    if (details && details.length > 0) {
        response.details = details;
    }

    return response;
};

/**
 * Global error handler middleware
 * 
 * Handles all error types and returns consistent JSON responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (authentication errors)
 * - 403: Forbidden (authorization errors)
 * - 404: Not Found (resource not found)
 * - 409: Conflict (duplicate resources)
 * - 500: Internal Server Error (unexpected errors)
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log all errors
    logError(err, req);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const details = formatZodErrors(err);
        res.status(400).json(
            createErrorResponse('Validation failed', 'VALIDATION_ERROR', details)
        );
        return;
    }

    // Handle custom AppError instances
    if (err instanceof AppError) {
        const errorCode = getErrorCode(err.statusCode);
        res.status(err.statusCode).json(
            createErrorResponse(err.message, errorCode, err.details)
        );
        return;
    }

    // Handle any error with statusCode property (e.g., ReviewError, PaymentError)
    if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
        const statusCode = (err as any).statusCode;
        const errorCode = getErrorCode(statusCode);
        res.status(statusCode).json(
            createErrorResponse(err.message, errorCode)
        );
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            res.status(409).json(
                createErrorResponse('Resource already exists', 'CONFLICT_ERROR')
            );
            return;
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            res.status(404).json(
                createErrorResponse('Resource not found', 'NOT_FOUND_ERROR')
            );
            return;
        }

        // Foreign key constraint failed
        if (prismaError.code === 'P2003') {
            res.status(400).json(
                createErrorResponse('Invalid reference - related resource not found', 'VALIDATION_ERROR')
            );
            return;
        }
    }

    // Handle Prisma validation errors
    if (err.name === 'PrismaClientValidationError') {
        res.status(400).json(
            createErrorResponse('Invalid data provided', 'VALIDATION_ERROR')
        );
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json(
            createErrorResponse('Invalid token', 'UNAUTHORIZED_ERROR')
        );
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json(
            createErrorResponse('Token expired', 'UNAUTHORIZED_ERROR')
        );
        return;
    }

    // Handle syntax errors (malformed JSON)
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json(
            createErrorResponse('Invalid JSON in request body', 'VALIDATION_ERROR')
        );
        return;
    }

    // Default to 500 Internal Server Error
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction
        ? 'An unexpected error occurred'
        : err.message || 'Internal Server Error';

    res.status(500).json(
        createErrorResponse(message, 'INTERNAL_SERVER_ERROR')
    );
};

/**
 * Get error code string from status code
 */
const getErrorCode = (statusCode: number): string => {
    const errorCodes: Record<number, string> = {
        400: 'BAD_REQUEST_ERROR',
        401: 'UNAUTHORIZED_ERROR',
        403: 'FORBIDDEN_ERROR',
        404: 'NOT_FOUND_ERROR',
        409: 'CONFLICT_ERROR',
        500: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodes[statusCode] || 'UNKNOWN_ERROR';
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    res.status(404).json(
        createErrorResponse(
            `Route ${req.method} ${req.originalUrl} not found`,
            'NOT_FOUND_ERROR'
        )
    );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * This is an alternative to express-async-handler
 */
export const asyncHandler = <T>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Helper function to send success responses with consistent structure
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (message) {
        response.message = message;
    }

    res.status(statusCode).json(response);
};

/**
 * Helper function to send paginated success responses
 */
export const sendPaginatedSuccess = <T>(
    res: Response,
    data: T[],
    pagination: {
        page: number;
        limit: number;
        total: number;
    },
    message?: string
): void => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: ApiResponse<T[]> = {
        success: true,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages,
        },
    };

    if (message) {
        response.message = message;
    }

    res.status(200).json(response);
};
