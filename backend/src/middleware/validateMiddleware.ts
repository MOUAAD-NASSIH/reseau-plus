/**
 * Validation Middleware
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ErrorResponse, ValidationError } from "../types/api.types";

/**
 * Format Zod error message
 */
const formatErrorMessage = (issue: z.core.$ZodIssue): string => {
    const field = String(issue.path[issue.path.length - 1] || 'value');

    // Handle common error codes with user-friendly messages
    if (issue.code === 'invalid_type') {
        const typeIssue = issue as z.core.$ZodIssueInvalidType;
        if (typeIssue.input === undefined) {
            return `${field} is required`;
        }
        return `${field} must be a ${String(typeIssue.expected)}`;
    }

    if (issue.code === 'too_small') {
        const sizeIssue = issue as z.core.$ZodIssueTooSmall;
        if (sizeIssue.minimum === 1) {
            return `${field} is required`;
        }
        return `${field} must be at least ${sizeIssue.minimum}`;
    }

    if (issue.code === 'too_big') {
        const sizeIssue = issue as z.core.$ZodIssueTooBig;
        return `${field} must be at most ${sizeIssue.maximum}`;
    }

    if (issue.code === 'invalid_format') {
        const formatIssue = issue as z.core.$ZodIssueInvalidStringFormat;
        if (formatIssue.format === 'email') return 'Invalid email address';
        if (formatIssue.format === 'url') return 'Invalid URL';
    }

    if (issue.code === 'invalid_value') {
        const valueIssue = issue as z.core.$ZodIssueInvalidValue;
        return `${field} must be one of: ${valueIssue.values.join(', ')}`;
    }

    return issue.message;
};

/**
 * Format Zod validation errors into standard ValidationError format
 */
const formatZodErrors = (error: ZodError): ValidationError[] => {
    return error.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: formatErrorMessage(issue),
    }));
};

/**
 * Create standardized error response matching ErrorResponse interface
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
 * Validate request against a Zod schema
 * Returns 400 Bad Request with detailed error messages on validation failure
 */
export const validateRequest = (schema: z.ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = formatZodErrors(error);
                res.status(400).json(
                    createErrorResponse('Validation failed', 'VALIDATION_ERROR', details)
                );
            } else {
                next(error);
            }
        }
    };
};