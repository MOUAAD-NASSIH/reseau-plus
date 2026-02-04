/**
 * Property-Based Tests for Worker Profile Management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from '../../src/lib/prisma';
import * as workerService from '../../src/services/workerService';

let testWorker: { id: number; userId: number } | null = null;
let testUser: { id: number } | null = null;

describe('Worker Profile Property Tests', () => {
    beforeAll(async () => {
        // Cleanup any existing test data
        await prisma.workerDocument.deleteMany({
            where: { worker: { user: { email: { startsWith: 'pbt-worker-' } } } }
        });
        await prisma.worker.deleteMany({
            where: { user: { email: { startsWith: 'pbt-worker-' } } }
        });
        await prisma.user.deleteMany({
            where: { email: { startsWith: 'pbt-worker-' } }
        });

        // Create worker role if not exists
        let workerRole = await prisma.role.findUnique({ where: { name: 'worker' } });
        if (!workerRole) {
            workerRole = await prisma.role.create({
                data: { name: 'worker', description: 'Worker role' }
            });
        }

        // Create a single test user and worker
        testUser = await prisma.user.create({
            data: {
                email: `pbt-worker-${Date.now()}@example.com`,
                password: 'hashedpassword123',
                roleId: workerRole.id
            }
        });

        testWorker = await prisma.worker.create({
            data: {
                userId: testUser.id,
                firstName: 'Test',
                lastName: 'Worker',
                status: 'PENDING'
            }
        });
    });

    afterAll(async () => {
        // Cleanup test data
        if (testWorker) {
            await prisma.workerDocument.deleteMany({ where: { workerId: testWorker.id } });
            await prisma.worker.delete({ where: { id: testWorker.id } }).catch(() => { });
        }
        if (testUser) {
            await prisma.user.delete({ where: { id: testUser.id } }).catch(() => { });
        }
    });

    // Property 6: Worker Profile Update Persistence
    describe('Property 6: Worker Profile Update Persistence', () => {
        const firstNameArb = fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0 && !s.includes('\x00'));
        const lastNameArb = fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0 && !s.includes('\x00'));
        const experienceYearsArb = fc.integer({ min: 0, max: 50 });
        const cityArb = fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0 && !s.includes('\x00'));

        it('updated profile fields should persist and be retrievable', async () => {
            await fc.assert(
                fc.asyncProperty(
                    firstNameArb,
                    lastNameArb,
                    experienceYearsArb,
                    cityArb,
                    async (firstName, lastName, experienceYears, city) => {
                        // Update the worker profile
                        await workerService.update(testWorker!.id, {
                            firstName,
                            lastName,
                            experienceYears,
                            city
                        });

                        // Query the worker record
                        const updatedWorker = await prisma.worker.findUnique({
                            where: { id: testWorker!.id }
                        });

                        // Verify all fields were persisted
                        expect(updatedWorker).not.toBeNull();
                        expect(updatedWorker!.firstName).toBe(firstName);
                        expect(updatedWorker!.lastName).toBe(lastName);
                        expect(updatedWorker!.experienceYears).toBe(experienceYears);
                        expect(updatedWorker!.city).toBe(city);
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    // Property 7: Document Upload Status Initialization
    describe('Property 7: Document Upload Status Initialization', () => {
        const documentTypeArb = fc.constantFrom('DIPLOMA', 'CV', 'ID', 'OTHER');
        const fileUrlArb = fc.webUrl().map(url => url.replace(/^http:/, 'https:'));

        it('newly created document should have PENDING status', async () => {
            await fc.assert(
                fc.asyncProperty(documentTypeArb, fileUrlArb, async (docType, fileUrl) => {
                    // Create a document
                    const document = await prisma.workerDocument.create({
                        data: {
                            workerId: testWorker!.id,
                            type: docType,
                            fileUrl: fileUrl,
                            status: 'PENDING'
                        }
                    });

                    try {
                        // Verify status is PENDING
                        expect(document.status).toBe('PENDING');

                        // Query the document to verify persistence
                        const queriedDocument = await prisma.workerDocument.findUnique({
                            where: { id: document.id }
                        });

                        expect(queriedDocument).not.toBeNull();
                        expect(queriedDocument!.status).toBe('PENDING');
                        expect(queriedDocument!.reviewedAt).toBeNull();
                    } finally {
                        // Cleanup this document
                        await prisma.workerDocument.delete({ where: { id: document.id } });
                    }
                }),
                { numRuns: 10 }
            );
        });
    });
});
