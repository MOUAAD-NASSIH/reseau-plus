/**
 * Property-Based Tests for Application System
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { WorkerStatus, ApplicationStatus, MissionStatus } from '../../src/types';

// Mock types for testing without database
interface MockWorker {
    id: number;
    userId: number;
    status: WorkerStatus;
    firstName: string;
    lastName: string;
}

interface MockMission {
    id: number;
    institutionId: number;
    title: string;
    status: MissionStatus;
}

interface MockApplication {
    id: number;
    missionId: number;
    workerId: number;
    status: ApplicationStatus;
    appliedAt: Date;
}

interface MockAssignment {
    id: number;
    missionId: number;
    workerId: number;
    institutionId: number;
    status: 'ACTIVE' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

// In-memory store for testing
class ApplicationStore {
    private workers: Map<number, MockWorker> = new Map();
    private missions: Map<number, MockMission> = new Map();
    private applications: Map<number, MockApplication> = new Map();
    private assignments: Map<number, MockAssignment> = new Map();
    private applicationIdCounter = 1;
    private assignmentIdCounter = 1;

    reset() {
        this.workers.clear();
        this.missions.clear();
        this.applications.clear();
        this.assignments.clear();
        this.applicationIdCounter = 1;
        this.assignmentIdCounter = 1;
    }

    addWorker(worker: MockWorker) {
        this.workers.set(worker.id, worker);
    }

    addMission(mission: MockMission) {
        this.missions.set(mission.id, mission);
    }

    getWorker(id: number): MockWorker | undefined {
        return this.workers.get(id);
    }

    getMission(id: number): MockMission | undefined {
        return this.missions.get(id);
    }

    getApplication(id: number): MockApplication | undefined {
        return this.applications.get(id);
    }

    getAssignment(id: number): MockAssignment | undefined {
        return this.assignments.get(id);
    }

    findApplicationByWorkerAndMission(workerId: number, missionId: number): MockApplication | undefined {
        for (const app of this.applications.values()) {
            if (app.workerId === workerId && app.missionId === missionId) {
                return app;
            }
        }
        return undefined;
    }

    findAssignmentByMission(missionId: number): MockAssignment | undefined {
        for (const assignment of this.assignments.values()) {
            if (assignment.missionId === missionId) {
                return assignment;
            }
        }
        return undefined;
    }

    // Apply to mission - Properties 12-14
    applyToMission(workerId: number, missionId: number): { success: boolean; statusCode: number; application?: MockApplication; message?: string } {
        const worker = this.workers.get(workerId);
        if (!worker) {
            return { success: false, statusCode: 404, message: 'Worker not found' };
        }

        // Property 13: Non-Verified Worker Application Rejection
        if (worker.status !== 'VERIFIED') {
            return { success: false, statusCode: 403, message: 'Only verified workers can apply to missions' };
        }

        const mission = this.missions.get(missionId);
        if (!mission) {
            return { success: false, statusCode: 404, message: 'Mission not found' };
        }

        if (mission.status !== 'OPEN') {
            return { success: false, statusCode: 400, message: 'Mission is not open for applications' };
        }

        // Property 14: Duplicate Application Prevention
        const existingApplication = this.findApplicationByWorkerAndMission(workerId, missionId);
        if (existingApplication) {
            return { success: false, statusCode: 409, message: 'Already applied to this mission' };
        }

        // Property 12: Create application with SUBMITTED status
        const application: MockApplication = {
            id: this.applicationIdCounter++,
            missionId,
            workerId,
            status: 'SUBMITTED',
            appliedAt: new Date()
        };
        this.applications.set(application.id, application);

        return { success: true, statusCode: 201, application };
    }

    // Accept application - Property 15
    acceptApplication(institutionId: number, applicationId: number): { success: boolean; statusCode: number; assignment?: MockAssignment; message?: string } {
        const application = this.applications.get(applicationId);
        if (!application) {
            return { success: false, statusCode: 404, message: 'Application not found' };
        }

        const mission = this.missions.get(application.missionId);
        if (!mission) {
            return { success: false, statusCode: 404, message: 'Mission not found' };
        }

        if (mission.institutionId !== institutionId) {
            return { success: false, statusCode: 403, message: 'Not authorized to accept this application' };
        }

        if (application.status !== 'SUBMITTED') {
            return { success: false, statusCode: 400, message: 'Application has already been processed' };
        }

        // Update application status
        application.status = 'ACCEPTED';

        // Update mission status
        mission.status = 'ONGOING';

        // Property 15: Create assignment with ACTIVE status
        const assignment: MockAssignment = {
            id: this.assignmentIdCounter++,
            missionId: application.missionId,
            workerId: application.workerId,
            institutionId,
            status: 'ACTIVE'
        };
        this.assignments.set(assignment.id, assignment);

        return { success: true, statusCode: 200, assignment };
    }
}

describe('Application System Property Tests', () => {
    let store: ApplicationStore;

    beforeEach(() => {
        store = new ApplicationStore();
    });

    afterEach(() => {
        store.reset();
    });

    // Arbitraries for generating test data
    const workerIdArb = fc.integer({ min: 1, max: 10000 });
    const missionIdArb = fc.integer({ min: 1, max: 10000 });
    const institutionIdArb = fc.integer({ min: 1, max: 10000 });
    const userIdArb = fc.integer({ min: 1, max: 10000 });
    const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
    const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
    const workerStatusArb = fc.constantFrom<WorkerStatus>('PENDING', 'VERIFIED', 'REJECTED');

    // Property 12: Verified Worker Application Creation
    describe('Property 12: Verified Worker Application Creation', () => {
        it('verified worker applying to open mission should create application with SUBMITTED status', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        // Setup: Create verified worker and open mission
                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // Act: Apply to mission
                        const result = store.applyToMission(workerId, missionId);

                        // Assert: Application created with SUBMITTED status
                        expect(result.success).toBe(true);
                        expect(result.statusCode).toBe(201);
                        expect(result.application).toBeDefined();
                        expect(result.application!.status).toBe('SUBMITTED');
                        expect(result.application!.workerId).toBe(workerId);
                        expect(result.application!.missionId).toBe(missionId);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('application should be retrievable after creation', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const result = store.applyToMission(workerId, missionId);
                        expect(result.success).toBe(true);

                        // Verify application can be retrieved
                        const retrieved = store.getApplication(result.application!.id);
                        expect(retrieved).toBeDefined();
                        expect(retrieved!.status).toBe('SUBMITTED');
                    }
                ),
                { numRuns: 100 }
            );
        });
    });


    // Property 13: Non-Verified Worker Application Rejection
    describe('Property 13: Non-Verified Worker Application Rejection', () => {
        it('PENDING worker should receive 403 when applying', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        // Setup: Create PENDING worker
                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'PENDING',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // Act: Try to apply
                        const result = store.applyToMission(workerId, missionId);

                        // Assert: Should be rejected with 403
                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(403);
                        expect(result.application).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('REJECTED worker should receive 403 when applying', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        // Setup: Create REJECTED worker
                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'REJECTED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // Act: Try to apply
                        const result = store.applyToMission(workerId, missionId);

                        // Assert: Should be rejected with 403
                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(403);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('non-verified workers should never create applications', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    fc.constantFrom<WorkerStatus>('PENDING', 'REJECTED'),
                    (workerId, userId, missionId, institutionId, firstName, lastName, title, status) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status,
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const result = store.applyToMission(workerId, missionId);

                        // No application should exist
                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(403);
                        const app = store.findApplicationByWorkerAndMission(workerId, missionId);
                        expect(app).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Property 14: Duplicate Application Prevention
    describe('Property 14: Duplicate Application Prevention', () => {
        it('second application to same mission should return 409', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // First application should succeed
                        const firstResult = store.applyToMission(workerId, missionId);
                        expect(firstResult.success).toBe(true);

                        // Second application should fail with 409
                        const secondResult = store.applyToMission(workerId, missionId);
                        expect(secondResult.success).toBe(false);
                        expect(secondResult.statusCode).toBe(409);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('multiple applications should not create duplicate records', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    fc.integer({ min: 2, max: 10 }),
                    (workerId, userId, missionId, institutionId, firstName, lastName, title, attempts) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // Try to apply multiple times
                        let successCount = 0;
                        for (let i = 0; i < attempts; i++) {
                            const result = store.applyToMission(workerId, missionId);
                            if (result.success) successCount++;
                        }

                        // Only one application should succeed
                        expect(successCount).toBe(1);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('worker can apply to different missions', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 2, maxLength: 5 }),
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionIds, institutionId, firstName, lastName, title) => {
                        store.reset();

                        // Ensure unique mission IDs
                        const uniqueMissionIds = [...new Set(missionIds)];
                        fc.pre(uniqueMissionIds.length >= 2);

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        // Create multiple missions
                        uniqueMissionIds.forEach((missionId, index) => {
                            store.addMission({
                                id: missionId,
                                institutionId,
                                title: `${title} ${index}`,
                                status: 'OPEN'
                            });
                        });

                        // Apply to all missions - all should succeed
                        uniqueMissionIds.forEach(missionId => {
                            const result = store.applyToMission(workerId, missionId);
                            expect(result.success).toBe(true);
                            expect(result.statusCode).toBe(201);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });
    });


    // Property 15: Application Acceptance Creates Assignment
    describe('Property 15: Application Acceptance Creates Assignment', () => {
        it('accepting application should create assignment with ACTIVE status', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        // Apply to mission
                        const applyResult = store.applyToMission(workerId, missionId);
                        expect(applyResult.success).toBe(true);

                        // Accept application
                        const acceptResult = store.acceptApplication(institutionId, applyResult.application!.id);

                        // Assert: Assignment created with ACTIVE status
                        expect(acceptResult.success).toBe(true);
                        expect(acceptResult.assignment).toBeDefined();
                        expect(acceptResult.assignment!.status).toBe('ACTIVE');
                        expect(acceptResult.assignment!.workerId).toBe(workerId);
                        expect(acceptResult.assignment!.missionId).toBe(missionId);
                        expect(acceptResult.assignment!.institutionId).toBe(institutionId);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('accepting application should update application status to ACCEPTED', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const applyResult = store.applyToMission(workerId, missionId);
                        const applicationId = applyResult.application!.id;

                        // Before acceptance
                        expect(store.getApplication(applicationId)!.status).toBe('SUBMITTED');

                        // Accept
                        store.acceptApplication(institutionId, applicationId);

                        // After acceptance
                        expect(store.getApplication(applicationId)!.status).toBe('ACCEPTED');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('accepting application should update mission status to ONGOING', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const applyResult = store.applyToMission(workerId, missionId);

                        // Before acceptance
                        expect(store.getMission(missionId)!.status).toBe('OPEN');

                        // Accept
                        store.acceptApplication(institutionId, applyResult.application!.id);

                        // After acceptance
                        expect(store.getMission(missionId)!.status).toBe('ONGOING');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('only institution that owns mission can accept application', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    fc.integer({ min: 1, max: 10000 }),
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, ownerInstitutionId, otherInstitutionId, firstName, lastName, title) => {
                        // Ensure different institution IDs
                        fc.pre(ownerInstitutionId !== otherInstitutionId);
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId: ownerInstitutionId,
                            title,
                            status: 'OPEN'
                        });

                        const applyResult = store.applyToMission(workerId, missionId);

                        // Try to accept with wrong institution
                        const acceptResult = store.acceptApplication(otherInstitutionId, applyResult.application!.id);

                        expect(acceptResult.success).toBe(false);
                        expect(acceptResult.statusCode).toBe(403);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('cannot accept already processed application', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const applyResult = store.applyToMission(workerId, missionId);
                        const applicationId = applyResult.application!.id;

                        // First acceptance should succeed
                        const firstAccept = store.acceptApplication(institutionId, applicationId);
                        expect(firstAccept.success).toBe(true);

                        // Second acceptance should fail
                        const secondAccept = store.acceptApplication(institutionId, applicationId);
                        expect(secondAccept.success).toBe(false);
                        expect(secondAccept.statusCode).toBe(400);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('assignment should be retrievable after creation', () => {
            fc.assert(
                fc.property(
                    workerIdArb,
                    userIdArb,
                    missionIdArb,
                    institutionIdArb,
                    nameArb,
                    nameArb,
                    titleArb,
                    (workerId, userId, missionId, institutionId, firstName, lastName, title) => {
                        store.reset();

                        store.addWorker({
                            id: workerId,
                            userId,
                            status: 'VERIFIED',
                            firstName,
                            lastName
                        });

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            status: 'OPEN'
                        });

                        const applyResult = store.applyToMission(workerId, missionId);
                        const acceptResult = store.acceptApplication(institutionId, applyResult.application!.id);

                        // Verify assignment can be retrieved
                        const retrieved = store.getAssignment(acceptResult.assignment!.id);
                        expect(retrieved).toBeDefined();
                        expect(retrieved!.status).toBe('ACTIVE');
                        expect(retrieved!.workerId).toBe(workerId);
                        expect(retrieved!.missionId).toBe(missionId);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
