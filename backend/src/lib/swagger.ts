/**
 * Swagger Configuration
 * API Documentation for Social Workers Network Backend
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Social Workers Network API',
            version: '1.0.0',
            description: 'Backend API for the Social Workers Network platform - connecting social care establishments with qualified independent social workers.\n\n## Authentication\nMost endpoints require JWT authentication. Include the token in the Authorization header:\n```\nAuthorization: Bearer <your_jwt_token>\n```\n\n## User Roles\n- **Worker**: Independent social workers who can apply to missions\n- **Institution**: Social care establishments that post missions\n- **Admin**: Platform administrators who manage verifications and oversight\n\n## Response Format\nAll responses follow a consistent structure:\n```json\n{\n  "success": true|false,\n  "data": {...},\n  "message": "...",\n  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }\n}\n```',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' },
                    },
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: {} },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' },
                            },
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                    },
                },
                RegisterWorkerRequest: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName', 'specialityId'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        specialityId: { type: 'integer' },
                        phone: { type: 'string' },
                    },
                },
                RegisterInstitutionRequest: {
                    type: 'object',
                    required: ['email', 'password', 'institutionName'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        institutionName: { type: 'string' },
                        phone: { type: 'string' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        zipCode: { type: 'string' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                token: { type: 'string' },
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['worker', 'institution', 'admin'] },
                        status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Worker: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        specialityId: { type: 'integer' },
                        experienceYears: { type: 'integer' },
                        bio: { type: 'string' },
                        city: { type: 'string' },
                        zipCode: { type: 'string' },
                        status: { type: 'string', enum: ['PENDING', 'VERIFIED', 'REJECTED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                UpdateWorkerRequest: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        specialityId: { type: 'integer' },
                        experienceYears: { type: 'integer' },
                        bio: { type: 'string' },
                        city: { type: 'string' },
                        zipCode: { type: 'string' },
                        latitude: { type: 'number' },
                        longitude: { type: 'number' },
                        birthDate: { type: 'string', format: 'date' },
                        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                    },
                },
                Institution: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        name: { type: 'string' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        zipCode: { type: 'string' },
                        phone: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Mission: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        institutionId: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        budget: { type: 'number' },
                        status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                        urgency: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                        requiredSpecialityId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateMissionRequest: {
                    type: 'object',
                    required: ['title', 'startDate', 'endDate'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        budget: { type: 'number' },
                        urgency: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                        requiredSpecialityId: { type: 'integer' },
                        location: { type: 'string' },
                        domainIds: { type: 'array', items: { type: 'integer' } },
                    },
                },
                Application: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        workerId: { type: 'integer' },
                        missionId: { type: 'integer' },
                        status: { type: 'string', enum: ['SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Assignment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        workerId: { type: 'integer' },
                        missionId: { type: 'integer' },
                        status: { type: 'string', enum: ['ACTIVE', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        assignmentId: { type: 'integer' },
                        amountTotal: { type: 'number' },
                        platformFee: { type: 'number' },
                        workerAmount: { type: 'number' },
                        status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED'] },
                        stripePaymentId: { type: 'string' },
                        paidAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        missionAssignmentId: { type: 'integer' },
                        reviewerId: { type: 'integer' },
                        revieweeId: { type: 'integer' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateReviewRequest: {
                    type: 'object',
                    required: ['missionAssignmentId', 'rating'],
                    properties: {
                        missionAssignmentId: { type: 'integer' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        type: { type: 'string' },
                        message: { type: 'string' },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Domain: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
                Speciality: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
                DashboardStats: {
                    type: 'object',
                    properties: {
                        totalWorkers: { type: 'integer' },
                        pendingWorkers: { type: 'integer' },
                        verifiedWorkers: { type: 'integer' },
                        totalInstitutions: { type: 'integer' },
                        totalMissions: { type: 'integer' },
                        activeMissions: { type: 'integer' },
                        completedMissions: { type: 'integer' },
                        totalPayments: { type: 'number' },
                        pendingDocuments: { type: 'integer' },
                    },
                },
                WorkerDocument: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        workerId: { type: 'integer' },
                        type: { type: 'string' },
                        url: { type: 'string' },
                        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
                        adminComment: { type: 'string' },
                        reviewedAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                WorkerExperience: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        workerId: { type: 'integer' },
                        jobTitle: { type: 'string' },
                        organization: { type: 'string' },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                        description: { type: 'string' },
                    },
                },
                WorkerAvailability: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        workerId: { type: 'integer' },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                        isRecurring: { type: 'boolean' },
                    },
                },
            },
        },
        tags: [
            { name: 'Health', description: 'Health check endpoint' },
            { name: 'Auth', description: 'Authentication and authorization' },
            { name: 'Workers', description: 'Worker profile management' },
            { name: 'Institutions', description: 'Institution profile management' },
            { name: 'Missions', description: 'Mission management' },
            { name: 'Applications', description: 'Mission application system' },
            { name: 'Assignments', description: 'Mission assignment management' },
            { name: 'Payments', description: 'Payment processing' },
            { name: 'Reviews', description: 'Review system' },
            { name: 'Notifications', description: 'Notification system' },
            { name: 'Domains', description: 'Domain management' },
            { name: 'Specialities', description: 'Speciality management' },
            { name: 'Admin', description: 'Admin dashboard and management' },
        ],
    },
    apis: ['./src/docs/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application): void {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Social Workers Network API Docs',
    }));

    app.get('/api/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

export default swaggerSpec;
