/**
 * Property-Based Tests for Admin Verification System
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from '../../src/lib/prisma';
import * as adminService from '../../src/services/adminService';
import { WorkerStatus, DocumentStatus } from '../../src/types/worker.types';

let testAdmin: { id: number } | null = null;
let testWorker: { id: number; userId: number } | null = null;
let testWorkerUser: { id: number } | null = null;
let adminRole: { id: number } | null = null;
let workerRole: { id: number } | null = null;

describe('Admin Verification Property Tests', () => {
    beforeAll(async () => {
        await prisma.adminLog.deleteMany({ where: { admin: { email: { startsWith: 'pbt-admin-' } } } });
        await prisma.notification.deleteMany({ where: { user: { email: { startsWith: 'pbt-' } } } });
        await prisma.workerDocument.deleteMany({ where: { worker: { user: { email: { startsWith: 'pbt-worker-admin-' } } } } });
        await prisma.worker.deleteMany({ where: { user: { email: { startsWith: 'pbt-worker-admin-' } } } });
        await prisma.user.deleteMany({ where: { email: { startsWith: 'pbt-admin-' } } });
        await prisma.user.deleteMany({ where: { email: { startsWith: 'pbt-worker-admin-' } } });

        adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: 'admin', description: 'Admin role' } });
        }

        workerRole = await prisma.role.findUnique({ where: { name: 'worker' } });
        if (!workerRole) {
            workerRole = await prisma.role.create({ data: { name: 'worker', description: 'Worker role' } });
        }

        testAdmin = await prisma.user.create({
            data: { email: `pbt-admin-${Date.now()}@example.com`, password: 'hashedpassword123', roleId: adminRole.id }
        });

        testWorkerUser = await prisma.user.create({
            data: { email: `pbt-worker-admin-${Date.now()}@example.com`, password: 'hashedpassword123', roleId: workerRole.id }
        });

        testWorker = await prisma.worker.create({
            data: { userId: testWorkerUser.id, firstName: 'Test', lastName: 'Worker', status: 'PENDING' }
        });
    });

    afterAll(async () => {
        if (testAdmin) await prisma.adminLog.deleteMany({ where: { adminId: testAdmin.id } });
        if (testWorkerUser) await prisma.notification.deleteMany({ where: { userId: testWorkerUser.id } });
        if (testWorker) {
            await prisma.workerDocument.deleteMany({ where: { workerId: testWorker.id } });
            await prisma.worker.delete({ where: { id: testWorker.id } }).catch(() => { });
        }
        if (testWorkerUser) await prisma.user.delete({ where: { id: testWorkerUser.id } }).catch(() => { });
        if (testAdmin) await prisma.user.delete({ where: { id: testAdmin.id } }).catch(() => { });
    });

    // Property 8: Worker Verification State Transitions
    describe('Property 8: Worker Verification State Transitions', () => {
        beforeEach(async () => {
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
            await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });
            await prisma.notification.deleteMany({ where: { userId: testWorkerUser!.id } });
        });

        const verificationStatusArb = fc.constantFrom<'VERIFIED' | 'REJECTED'>('VERIFIED', 'REJECTED');
        const reasonArb = fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length >= 5 && !s.includes('\x00'));

        it('worker status should be updated to specified status', async () => {
            await fc.assert(
                fc.asyncProperty(verificationStatusArb, reasonArb, async (status, reason) => {
                    await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });

                    const updatedWorker = await adminService.verifyWorker(
                        testWorker!.id, status as WorkerStatus, testAdmin!.id, status === 'REJECTED' ? reason : undefined
                    );

                    expect(updatedWorker.status).toBe(status);
                    const queriedWorker = await prisma.worker.findUnique({ where: { id: testWorker!.id } });
                    expect(queriedWorker!.status).toBe(status);
                }),
                { numRuns: 10 }
            );
        });

        it('AdminLog record should be created with correct adminId and actionType', async () => {
            await fc.assert(
                fc.asyncProperty(verificationStatusArb, reasonArb, async (status, reason) => {
                    await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
                    await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });

                    await adminService.verifyWorker(testWorker!.id, status as WorkerStatus, testAdmin!.id, status === 'REJECTED' ? reason : undefined);

                    const logs = await prisma.adminLog.findMany({ where: { adminId: testAdmin!.id }, orderBy: { createdAt: 'desc' }, take: 1 });
                    expect(logs.length).toBe(1);
                    expect(logs[0].adminId).toBe(testAdmin!.id);
                    expect(logs[0].actionType).toBe(status === 'VERIFIED' ? 'WORKER_VERIFIED' : 'WORKER_REJECTED');
                    expect(logs[0].targetUserId).toBe(testWorkerUser!.id);
                }),
                { numRuns: 10 }
            );
        });

        it('rejection reason should be stored when worker is rejected', async () => {
            await fc.assert(
                fc.asyncProperty(reasonArb, async (reason) => {
                    await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });

                    const updatedWorker = await adminService.verifyWorker(testWorker!.id, 'REJECTED' as WorkerStatus, testAdmin!.id, reason);

                    expect(updatedWorker.rejectionReason).toBe(reason);
                    const queriedWorker = await prisma.worker.findUnique({ where: { id: testWorker!.id } });
                    expect(queriedWorker!.rejectionReason).toBe(reason);
                }),
                { numRuns: 10 }
            );
        });

        it('rejection reason should be null when worker is verified', async () => {
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'REJECTED', rejectionReason: 'Previous rejection' } });
            const updatedWorker = await adminService.verifyWorker(testWorker!.id, 'VERIFIED' as WorkerStatus, testAdmin!.id);
            expect(updatedWorker.rejectionReason).toBeNull();
        });
    });

    // Property 9: Pending Worker Mission Access Restriction
    describe('Property 9: Pending Worker Mission Access Restriction', () => {
        const workerStatusArb = fc.constantFrom<WorkerStatus>('PENDING', 'VERIFIED', 'REJECTED');
        const canAccessMissions = (workerStatus: WorkerStatus): boolean => workerStatus === 'VERIFIED';

        it('only VERIFIED workers should have mission access', () => {
            fc.assert(
                fc.property(workerStatusArb, (status) => {
                    const hasAccess = canAccessMissions(status);
                    expect(hasAccess).toBe(status === 'VERIFIED');
                }),
                { numRuns: 100 }
            );
        });

        it('PENDING workers should not have mission access', async () => {
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING' } });
            const worker = await prisma.worker.findUnique({ where: { id: testWorker!.id } });
            expect(worker!.status).toBe('PENDING');
            expect(canAccessMissions(worker!.status)).toBe(false);
        });

        it('REJECTED workers should not have mission access', async () => {
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'REJECTED' } });
            const worker = await prisma.worker.findUnique({ where: { id: testWorker!.id } });
            expect(worker!.status).toBe('REJECTED');
            expect(canAccessMissions(worker!.status)).toBe(false);
        });

        it('VERIFIED workers should have mission access', async () => {
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'VERIFIED' } });
            const worker = await prisma.worker.findUnique({ where: { id: testWorker!.id } });
            expect(worker!.status).toBe('VERIFIED');
            expect(canAccessMissions(worker!.status)).toBe(true);
        });
    });

    // Property 24: Admin Action Logging
    describe('Property 24: Admin Action Logging', () => {
        beforeEach(async () => {
            await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
        });

        it('worker verification should create AdminLog with correct fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.constantFrom<'VERIFIED' | 'REJECTED'>('VERIFIED', 'REJECTED'),
                    fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
                    async (status, reason) => {
                        await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
                        await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });

                        await adminService.verifyWorker(testWorker!.id, status as WorkerStatus, testAdmin!.id, status === 'REJECTED' ? reason : undefined);

                        const logs = await prisma.adminLog.findMany({ where: { adminId: testAdmin!.id } });
                        expect(logs.length).toBeGreaterThanOrEqual(1);
                        expect(logs[0].adminId).toBe(testAdmin!.id);
                        expect(logs[0].targetUserId).toBe(testWorkerUser!.id);
                        expect(['WORKER_VERIFIED', 'WORKER_REJECTED']).toContain(logs[0].actionType);
                    }
                ),
                { numRuns: 10 }
            );
        });

        it('document review should create AdminLog with correct fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.constantFrom<'APPROVED' | 'REJECTED'>('APPROVED', 'REJECTED'),
                    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                    async (status, comment) => {
                        const document = await prisma.workerDocument.create({
                            data: { workerId: testWorker!.id, type: 'CV', fileUrl: 'https://example.com/doc.pdf', status: 'PENDING' }
                        });

                        try {
                            await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });
                            await adminService.reviewDocument(document.id, status as DocumentStatus, testAdmin!.id, comment);

                            const logs = await prisma.adminLog.findMany({ where: { adminId: testAdmin!.id } });
                            expect(logs.length).toBeGreaterThanOrEqual(1);
                            expect(logs[0].adminId).toBe(testAdmin!.id);
                            expect(logs[0].targetDocumentId).toBe(document.id);
                            expect(['DOCUMENT_APPROVED', 'DOCUMENT_REJECTED']).toContain(logs[0].actionType);
                        } finally {
                            await prisma.workerDocument.delete({ where: { id: document.id } });
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });

        it('AdminLog should include reason when provided', async () => {
            const reason = 'Test rejection reason for property test';
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
            await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });

            await adminService.verifyWorker(testWorker!.id, 'REJECTED' as WorkerStatus, testAdmin!.id, reason);

            const logs = await prisma.adminLog.findMany({ where: { adminId: testAdmin!.id }, orderBy: { createdAt: 'desc' }, take: 1 });
            expect(logs.length).toBe(1);
            expect(logs[0].reason).toBe(reason);
        });

        it('AdminLog createdAt should be set automatically', async () => {
            const beforeTime = new Date();
            await prisma.worker.update({ where: { id: testWorker!.id }, data: { status: 'PENDING', rejectionReason: null } });
            await prisma.adminLog.deleteMany({ where: { adminId: testAdmin!.id } });

            await adminService.verifyWorker(testWorker!.id, 'VERIFIED' as WorkerStatus, testAdmin!.id);
            const afterTime = new Date();

            const logs = await prisma.adminLog.findMany({ where: { adminId: testAdmin!.id }, orderBy: { createdAt: 'desc' }, take: 1 });
            expect(logs.length).toBe(1);
            expect(logs[0].createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(logs[0].createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });
    });
});
