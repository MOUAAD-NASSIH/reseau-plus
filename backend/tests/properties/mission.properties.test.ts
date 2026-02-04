/**
 * Property-Based Tests for Mission Management
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from '../../src/lib/prisma';
import * as missionService from '../../src/services/missionService';

// Test data holders
let testInstitution1: { id: number; userId: number } | null = null;
let testInstitution2: { id: number; userId: number } | null = null;
let testUser1: { id: number } | null = null;
let testUser2: { id: number } | null = null;
let institutionRole: { id: number } | null = null;

describe('Mission Management Property Tests', () => {
    beforeAll(async () => {
        // Cleanup any existing test data
        await prisma.missionApplication.deleteMany({
            where: { mission: { institution: { user: { email: { startsWith: 'pbt-mission-' } } } } }
        });
        await prisma.missionAssignment.deleteMany({
            where: { mission: { institution: { user: { email: { startsWith: 'pbt-mission-' } } } } }
        });
        await prisma.missionDomain.deleteMany({
            where: { mission: { institution: { user: { email: { startsWith: 'pbt-mission-' } } } } }
        });
        await prisma.mission.deleteMany({
            where: { institution: { user: { email: { startsWith: 'pbt-mission-' } } } }
        });
        await prisma.institution.deleteMany({
            where: { user: { email: { startsWith: 'pbt-mission-' } } }
        });
        await prisma.user.deleteMany({
            where: { email: { startsWith: 'pbt-mission-' } }
        });

        // Create institution role if not exists
        institutionRole = await prisma.role.findUnique({ where: { name: 'institution' } });
        if (!institutionRole) {
            institutionRole = await prisma.role.create({
                data: { name: 'institution', description: 'Institution role' }
            });
        }

        // Create two test institutions for ownership tests
        testUser1 = await prisma.user.create({
            data: {
                email: `pbt-mission-inst1-${Date.now()}@example.com`,
                password: 'hashedpassword123',
                roleId: institutionRole.id
            }
        });

        testInstitution1 = await prisma.institution.create({
            data: {
                userId: testUser1.id,
                institutionName: 'Test Institution 1'
            }
        });

        testUser2 = await prisma.user.create({
            data: {
                email: `pbt-mission-inst2-${Date.now()}@example.com`,
                password: 'hashedpassword123',
                roleId: institutionRole.id
            }
        });

        testInstitution2 = await prisma.institution.create({
            data: {
                userId: testUser2.id,
                institutionName: 'Test Institution 2'
            }
        });
    });

    afterAll(async () => {
        // Cleanup test data
        if (testInstitution1) {
            await prisma.mission.deleteMany({ where: { institutionId: testInstitution1.id } });
            await prisma.institution.delete({ where: { id: testInstitution1.id } }).catch(() => { });
        }
        if (testInstitution2) {
            await prisma.mission.deleteMany({ where: { institutionId: testInstitution2.id } });
            await prisma.institution.delete({ where: { id: testInstitution2.id } }).catch(() => { });
        }
        if (testUser1) {
            await prisma.user.delete({ where: { id: testUser1.id } }).catch(() => { });
        }
        if (testUser2) {
            await prisma.user.delete({ where: { id: testUser2.id } }).catch(() => { });
        }
    });

    // Property 10: Mission Ownership Validation
    describe('Property 10: Mission Ownership Validation', () => {
        // Arbitrary for mission title
        const titleArb = fc.string({ minLength: 3, maxLength: 100 })
            .filter(s => s.trim().length >= 3 && !s.includes('\x00'));

        it('validateOwnership returns true for mission owner', async () => {
            await fc.assert(
                fc.asyncProperty(titleArb, async (title) => {
                    // Create a mission owned by institution 1
                    const mission = await prisma.mission.create({
                        data: {
                            institutionId: testInstitution1!.id,
                            title,
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 86400000) // +1 day
                        }
                    });

                    try {
                        // Validate ownership with the correct institution
                        const isOwner = await missionService.validateOwnership(
                            mission.id,
                            testInstitution1!.id
                        );

                        expect(isOwner).toBe(true);
                    } finally {
                        // Cleanup
                        await prisma.mission.delete({ where: { id: mission.id } });
                    }
                }),
                { numRuns: 10 }
            );
        });

        it('validateOwnership returns false for non-owner institution', async () => {
            await fc.assert(
                fc.asyncProperty(titleArb, async (title) => {
                    // Create a mission owned by institution 1
                    const mission = await prisma.mission.create({
                        data: {
                            institutionId: testInstitution1!.id,
                            title,
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 86400000)
                        }
                    });

                    try {
                        // Validate ownership with a different institution
                        const isOwner = await missionService.validateOwnership(
                            mission.id,
                            testInstitution2!.id
                        );

                        expect(isOwner).toBe(false);
                    } finally {
                        // Cleanup
                        await prisma.mission.delete({ where: { id: mission.id } });
                    }
                }),
                { numRuns: 10 }
            );
        });

        it('validateOwnership returns false for non-existent mission', async () => {
            // Use a very large ID that doesn't exist
            const nonExistentId = 999999999;

            const isOwner = await missionService.validateOwnership(
                nonExistentId,
                testInstitution1!.id
            );

            expect(isOwner).toBe(false);
        });
    });

    // Property 11: Mission Cascade Deletion
    describe('Property 11: Mission Cascade Deletion', () => {
        let testWorker: { id: number; userId: number } | null = null;
        let testWorkerUser: { id: number } | null = null;

        beforeAll(async () => {
            // Create worker role if not exists
            let workerRole = await prisma.role.findUnique({ where: { name: 'worker' } });
            if (!workerRole) {
                workerRole = await prisma.role.create({
                    data: { name: 'worker', description: 'Worker role' }
                });
            }

            // Create a test worker for applications/assignments
            testWorkerUser = await prisma.user.create({
                data: {
                    email: `pbt-mission-worker-${Date.now()}@example.com`,
                    password: 'hashedpassword123',
                    roleId: workerRole.id
                }
            });

            testWorker = await prisma.worker.create({
                data: {
                    userId: testWorkerUser.id,
                    firstName: 'Test',
                    lastName: 'Worker',
                    status: 'VERIFIED'
                }
            });
        });

        afterAll(async () => {
            if (testWorker) {
                await prisma.worker.delete({ where: { id: testWorker.id } }).catch(() => { });
            }
            if (testWorkerUser) {
                await prisma.user.delete({ where: { id: testWorkerUser.id } }).catch(() => { });
            }
        });

        it('deleting a mission cascades to delete related applications', async () => {
            // Create a mission
            const mission = await prisma.mission.create({
                data: {
                    institutionId: testInstitution1!.id,
                    title: 'Cascade Test Mission - Applications',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000)
                }
            });

            // Create an application for this mission
            const application = await prisma.missionApplication.create({
                data: {
                    missionId: mission.id,
                    workerId: testWorker!.id,
                    status: 'SUBMITTED'
                }
            });

            // Verify application exists
            const appBefore = await prisma.missionApplication.findUnique({
                where: { id: application.id }
            });
            expect(appBefore).not.toBeNull();

            // Delete the mission
            await missionService.deleteMission(mission.id);

            // Verify application was cascade deleted
            const appAfter = await prisma.missionApplication.findUnique({
                where: { id: application.id }
            });
            expect(appAfter).toBeNull();

            // Verify mission was deleted
            const missionAfter = await prisma.mission.findUnique({
                where: { id: mission.id }
            });
            expect(missionAfter).toBeNull();
        });

        it('deleting a mission cascades to delete related assignments', async () => {
            // Create a mission
            const mission = await prisma.mission.create({
                data: {
                    institutionId: testInstitution1!.id,
                    title: 'Cascade Test Mission - Assignments',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000)
                }
            });

            // Create an assignment for this mission
            const assignment = await prisma.missionAssignment.create({
                data: {
                    missionId: mission.id,
                    workerId: testWorker!.id,
                    institutionId: testInstitution1!.id,
                    status: 'ACTIVE'
                }
            });

            // Verify assignment exists
            const assignmentBefore = await prisma.missionAssignment.findUnique({
                where: { id: assignment.id }
            });
            expect(assignmentBefore).not.toBeNull();

            // Delete the mission
            await missionService.deleteMission(mission.id);

            // Verify assignment was cascade deleted
            const assignmentAfter = await prisma.missionAssignment.findUnique({
                where: { id: assignment.id }
            });
            expect(assignmentAfter).toBeNull();

            // Verify mission was deleted
            const missionAfter = await prisma.mission.findUnique({
                where: { id: mission.id }
            });
            expect(missionAfter).toBeNull();
        });

        it('deleting a mission cascades to delete related domain associations', async () => {
            // First, ensure we have a domain to associate
            let testDomain = await prisma.domain.findFirst();
            if (!testDomain) {
                testDomain = await prisma.domain.create({
                    data: { name: 'Test Domain for Cascade' }
                });
            }

            // Create a mission with domain association
            const mission = await prisma.mission.create({
                data: {
                    institutionId: testInstitution1!.id,
                    title: 'Cascade Test Mission - Domains',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000),
                    domains: {
                        create: [{ domainId: testDomain.id }]
                    }
                }
            });

            // Verify domain association exists
            const domainsBefore = await prisma.missionDomain.findMany({
                where: { missionId: mission.id }
            });
            expect(domainsBefore.length).toBeGreaterThan(0);

            // Delete the mission
            await missionService.deleteMission(mission.id);

            // Verify domain associations were cascade deleted
            const domainsAfter = await prisma.missionDomain.findMany({
                where: { missionId: mission.id }
            });
            expect(domainsAfter.length).toBe(0);

            // Verify mission was deleted
            const missionAfter = await prisma.mission.findUnique({
                where: { id: mission.id }
            });
            expect(missionAfter).toBeNull();
        });

        it('deleting a mission with multiple related records cascades all deletions', async () => {
            // Ensure we have a domain
            let testDomain = await prisma.domain.findFirst();
            if (!testDomain) {
                testDomain = await prisma.domain.create({
                    data: { name: 'Test Domain for Full Cascade' }
                });
            }

            // Create a mission with all related records
            const mission = await prisma.mission.create({
                data: {
                    institutionId: testInstitution1!.id,
                    title: 'Full Cascade Test Mission',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000),
                    domains: {
                        create: [{ domainId: testDomain.id }]
                    }
                }
            });

            // Create application
            const application = await prisma.missionApplication.create({
                data: {
                    missionId: mission.id,
                    workerId: testWorker!.id,
                    status: 'ACCEPTED'
                }
            });

            // Create assignment
            const assignment = await prisma.missionAssignment.create({
                data: {
                    missionId: mission.id,
                    workerId: testWorker!.id,
                    institutionId: testInstitution1!.id,
                    status: 'ACTIVE'
                }
            });

            // Verify all records exist before deletion
            expect(await prisma.mission.findUnique({ where: { id: mission.id } })).not.toBeNull();
            expect(await prisma.missionApplication.findUnique({ where: { id: application.id } })).not.toBeNull();
            expect(await prisma.missionAssignment.findUnique({ where: { id: assignment.id } })).not.toBeNull();
            expect((await prisma.missionDomain.findMany({ where: { missionId: mission.id } })).length).toBeGreaterThan(0);

            // Delete the mission
            await missionService.deleteMission(mission.id);

            // Verify all related records were cascade deleted
            expect(await prisma.mission.findUnique({ where: { id: mission.id } })).toBeNull();
            expect(await prisma.missionApplication.findUnique({ where: { id: application.id } })).toBeNull();
            expect(await prisma.missionAssignment.findUnique({ where: { id: assignment.id } })).toBeNull();
            expect((await prisma.missionDomain.findMany({ where: { missionId: mission.id } })).length).toBe(0);
        });
    });
});
