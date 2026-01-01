/**
 * Property-Based Tests for API Response Standards
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Request, Response } from 'express';
import {
    errorHandler,
    notFoundHandler,
    AppError,
    NotFoundError,
    ValidationAppError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    sendSuccess,
    sendPaginatedSuccess,
} from '../../src/middleware/errorMiddleware';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

// Mock Express Request
const createMockRequest = (overrides: Partial<Request> = {}): Request => ({
    method: 'GET',
    originalUrl: '/api/test',
    get: () => 'test-agent',
    ...overrides,
} as Request);

// Mock Express Response
const createMockResponse = (): Response & {
    statusCode: number;
    jsonData: any;
    status: (code: number) => Response;
    json: (data: any) => Response;
} => {
    const res: any = {
        statusCode: 200,
        jsonData: null,
        status: function (code: number) {
            this.statusCode = code;
            return this;
        },
        json: function (data: any) {
            this.jsonData = data;
            return this;
        },
    };
    return res;
};

// Arbitrary for generating error messages
const errorMessageArb = fc.string({ minLength: 1, maxLength: 200 })
    .filter(s => s.trim().length > 0);

// Arbitrary for generating resource names
const resourceNameArb = fc.constantFrom(
    'User', 'Worker', 'Mission', 'Application',
    'Assignment', 'Payment', 'Review', 'Notification'
);

// Arbitrary for generating HTTP status codes
const successStatusCodeArb = fc.constantFrom(200, 201, 204);
const errorStatusCodeArb = fc.constantFrom(400, 401, 403, 404, 409, 500);

// Arbitrary for generating validation error details
const validationErrorArb = fc.record({
    field: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    message: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
});

// Arbitrary for generating pagination params
const paginationArb = fc.record({
    page: fc.integer({ min: 1, max: 100 }),
    limit: fc.integer({ min: 1, max: 100 }),
    total: fc.integer({ min: 0, max: 10000 }),
});

// Arbitrary for generating sample data
const sampleDataArb = fc.oneof(
    fc.record({ id: fc.integer(), name: fc.string() }),
    fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
    fc.string(),
    fc.integer(),
);

describe('API Response Property Tests', () => {
    // Property 26: API Response Structure Consistency
    describe('Property 26: API Response Structure Consistency', () => {
        it('all success responses should have success=true and 2xx status codes', () => {
            fc.assert(
                fc.property(
                    sampleDataArb,
                    errorMessageArb,
                    successStatusCodeArb,
                    (data, message, statusCode) => {
                        const res = createMockResponse();

                        sendSuccess(res, data, message, statusCode);

                        // Verify success field is true
                        expect(res.jsonData.success).toBe(true);

                        // Verify status code is 2xx
                        expect(res.statusCode).toBeGreaterThanOrEqual(200);
                        expect(res.statusCode).toBeLessThan(300);

                        // Verify data is present
                        expect(res.jsonData.data).toEqual(data);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('all error responses should have success=false and 4xx/5xx status codes', () => {
            fc.assert(
                fc.property(
                    errorMessageArb,
                    errorStatusCodeArb,
                    (message, statusCode) => {
                        const req = createMockRequest();
                        const res = createMockResponse();
                        const next = () => { };

                        const error = new AppError(message, statusCode);
                        errorHandler(error, req, res, next);

                        // Verify success field is false
                        expect(res.jsonData.success).toBe(false);

                        // Verify status code is 4xx or 5xx
                        expect(res.statusCode).toBeGreaterThanOrEqual(400);
                        expect(res.statusCode).toBeLessThan(600);

                        // Verify error and message fields exist
                        expect(typeof res.jsonData.error).toBe('string');
                        expect(typeof res.jsonData.message).toBe('string');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('paginated responses should include pagination metadata with correct structure', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.record({ id: fc.integer(), name: fc.string() })),
                    paginationArb,
                    (data, pagination) => {
                        const res = createMockResponse();

                        sendPaginatedSuccess(res, data, pagination);

                        // Verify success field
                        expect(res.jsonData.success).toBe(true);

                        // Verify pagination metadata exists
                        expect(res.jsonData.pagination).toBeDefined();
                        expect(res.jsonData.pagination.page).toBe(pagination.page);
                        expect(res.jsonData.pagination.limit).toBe(pagination.limit);
                        expect(res.jsonData.pagination.total).toBe(pagination.total);

                        // Verify totalPages calculation
                        const expectedTotalPages = Math.ceil(pagination.total / pagination.limit);
                        expect(res.jsonData.pagination.totalPages).toBe(expectedTotalPages);

                        // Verify data is present
                        expect(res.jsonData.data).toEqual(data);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('validation errors should have success=false and 400 status code', () => {
            fc.assert(
                fc.property(
                    fc.array(validationErrorArb, { minLength: 1, maxLength: 5 }),
                    (validationErrors) => {
                        const req = createMockRequest();
                        const res = createMockResponse();
                        const next = () => { };

                        const error = new ValidationAppError('Validation failed', validationErrors);
                        errorHandler(error, req, res, next);

                        // Verify response structure
                        expect(res.jsonData.success).toBe(false);
                        expect(res.statusCode).toBe(400);
                        expect(res.jsonData.error).toBe('BAD_REQUEST_ERROR');
                        expect(res.jsonData.details).toEqual(validationErrors);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('ZodError should be converted to proper validation error response', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            path: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
                            message: fc.string({ minLength: 1, maxLength: 100 }),
                        }),
                        { minLength: 1, maxLength: 3 }
                    ),
                    (issues) => {
                        const req = createMockRequest();
                        const res = createMockResponse();
                        const next = () => { };

                        // Create a ZodError with the generated issues
                        const zodIssues: ZodIssue[] = issues.map(issue => ({
                            code: ZodIssueCode.custom,
                            path: issue.path,
                            message: issue.message,
                        }));
                        const zodError = new ZodError(zodIssues);

                        errorHandler(zodError, req, res, next);

                        // Verify response structure
                        expect(res.jsonData.success).toBe(false);
                        expect(res.statusCode).toBe(400);
                        expect(res.jsonData.error).toBe('VALIDATION_ERROR');
                        expect(Array.isArray(res.jsonData.details)).toBe(true);

                        // Verify each issue is converted to field/message format
                        res.jsonData.details.forEach((detail: any, index: number) => {
                            expect(typeof detail.field).toBe('string');
                            expect(typeof detail.message).toBe('string');
                            expect(detail.message).toBe(issues[index].message);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('unauthorized errors should have success=false and 401 status code', () => {
            fc.assert(
                fc.property(errorMessageArb, (message) => {
                    const req = createMockRequest();
                    const res = createMockResponse();
                    const next = () => { };

                    const error = new UnauthorizedError(message);
                    errorHandler(error, req, res, next);

                    expect(res.jsonData.success).toBe(false);
                    expect(res.statusCode).toBe(401);
                    expect(res.jsonData.error).toBe('UNAUTHORIZED_ERROR');
                }),
                { numRuns: 100 }
            );
        });

        it('forbidden errors should have success=false and 403 status code', () => {
            fc.assert(
                fc.property(errorMessageArb, (message) => {
                    const req = createMockRequest();
                    const res = createMockResponse();
                    const next = () => { };

                    const error = new ForbiddenError(message);
                    errorHandler(error, req, res, next);

                    expect(res.jsonData.success).toBe(false);
                    expect(res.statusCode).toBe(403);
                    expect(res.jsonData.error).toBe('FORBIDDEN_ERROR');
                }),
                { numRuns: 100 }
            );
        });

        it('conflict errors should have success=false and 409 status code', () => {
            fc.assert(
                fc.property(errorMessageArb, (message) => {
                    const req = createMockRequest();
                    const res = createMockResponse();
                    const next = () => { };

                    const error = new ConflictError(message);
                    errorHandler(error, req, res, next);

                    expect(res.jsonData.success).toBe(false);
                    expect(res.statusCode).toBe(409);
                    expect(res.jsonData.error).toBe('CONFLICT_ERROR');
                }),
                { numRuns: 100 }
            );
        });
    });

    // Property 27: Resource Not Found Response
    describe('Property 27: Resource Not Found Response', () => {
        it('NotFoundError should return 404 with descriptive message', () => {
            fc.assert(
                fc.property(resourceNameArb, (resource) => {
                    const req = createMockRequest();
                    const res = createMockResponse();
                    const next = () => { };

                    const error = new NotFoundError(resource);
                    errorHandler(error, req, res, next);

                    // Verify 404 status code
                    expect(res.statusCode).toBe(404);

                    // Verify response structure
                    expect(res.jsonData.success).toBe(false);
                    expect(res.jsonData.error).toBe('NOT_FOUND_ERROR');

                    // Verify message contains resource name
                    expect(res.jsonData.message).toContain(resource);
                    expect(res.jsonData.message).toContain('not found');
                }),
                { numRuns: 100 }
            );
        });

        it('notFoundHandler should return 404 for undefined routes', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
                    fc.string({ minLength: 1, maxLength: 50 }).map(s => `/api/${s.replace(/[^a-zA-Z0-9/]/g, '')}`),
                    (method, url) => {
                        const req = createMockRequest({ method, originalUrl: url });
                        const res = createMockResponse();
                        const next = () => { };

                        notFoundHandler(req, res, next);

                        // Verify 404 status code
                        expect(res.statusCode).toBe(404);

                        // Verify response structure
                        expect(res.jsonData.success).toBe(false);
                        expect(res.jsonData.error).toBe('NOT_FOUND_ERROR');

                        // Verify message contains route info
                        expect(res.jsonData.message).toContain(method);
                        expect(res.jsonData.message).toContain(url);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('default NotFoundError should use "Resource" as default name', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = () => { };

            const error = new NotFoundError();
            errorHandler(error, req, res, next);

            expect(res.statusCode).toBe(404);
            expect(res.jsonData.message).toBe('Resource not found');
        });

        it('generic errors should not expose internal details in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            try {
                fc.assert(
                    fc.property(errorMessageArb, (message) => {
                        const req = createMockRequest();
                        const res = createMockResponse();
                        const next = () => { };

                        // Create a generic Error (not AppError)
                        const error = new Error(message);
                        errorHandler(error, req, res, next);

                        // Verify 500 status code
                        expect(res.statusCode).toBe(500);

                        // Verify response structure
                        expect(res.jsonData.success).toBe(false);
                        expect(res.jsonData.error).toBe('INTERNAL_SERVER_ERROR');

                        // In production, should NOT expose the original error message
                        expect(res.jsonData.message).toBe('An unexpected error occurred');
                    }),
                    { numRuns: 50 }
                );
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('generic errors should expose details in development', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            try {
                fc.assert(
                    fc.property(errorMessageArb, (message) => {
                        const req = createMockRequest();
                        const res = createMockResponse();
                        const next = () => { };

                        // Create a generic Error (not AppError)
                        const error = new Error(message);
                        errorHandler(error, req, res, next);

                        // Verify 500 status code
                        expect(res.statusCode).toBe(500);

                        // In development, should expose the original error message
                        expect(res.jsonData.message).toBe(message);
                    }),
                    { numRuns: 50 }
                );
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });
    });
});
