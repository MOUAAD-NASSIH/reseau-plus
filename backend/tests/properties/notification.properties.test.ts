/**
 * Property-Based Tests for Notification System
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from '../../src/lib/prisma';
import * as notificationService from '../../src/services/notificationService';
import { NotificationType } from '../../src/types/notification.types';

// Test user ID - we'll create a test user for all tests
let testUserId: number;
let testRoleId: number;

// Arbitrary for generating valid notification types
const notificationTypeArb = fc.constantFrom<NotificationType>(
    'APPLICATION_SUBMITTED',
    'APPLICATION_ACCEPTED',
    'APPLICATION_REJECTED',
    'ASSIGNMENT_CREATED',
    'ASSIGNMENT_COMPLETED',
    'GENERAL'
);

// Arbitrary for generating valid notification messages
const messageArb = fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => s.trim().length > 0);

describe('Notification Property Tests', () => {
    beforeAll(async () => {
        // Create or get test role
        const role = await prisma.role.upsert({
            where: { name: 'worker' },
            update: {},
            create: { name: 'worker', description: 'Test worker role' }
        });
        testRoleId = role.id;

        // Create test user
        const user = await prisma.user.create({
            data: {
                email: `test-notification-${Date.now()}@test.com`,
                password: 'hashedpassword',
                roleId: testRoleId,
            }
        });
        testUserId = user.id;
    });

    afterAll(async () => {
        // Clean up notifications for test user
        await prisma.notification.deleteMany({
            where: { userId: testUserId }
        });
        // Clean up test user
        await prisma.user.delete({
            where: { id: testUserId }
        }).catch(() => { /* ignore if already deleted */ });
    });

    afterEach(async () => {
        // Clean up notifications after each test
        await prisma.notification.deleteMany({
            where: { userId: testUserId }
        });
    });

    // Property 21: Notification Default Read Status
    describe('Property 21: Notification Default Read Status', () => {
        it('newly created notification should have isRead = false', async () => {
            await fc.assert(
                fc.asyncProperty(notificationTypeArb, messageArb, async (type, message) => {
                    // Create notification
                    const notification = await notificationService.createNotification(
                        testUserId,
                        type,
                        message
                    );

                    // Verify isRead is false
                    expect(notification.isRead).toBe(false);

                    // Also verify by fetching from database
                    const fetched = await notificationService.getNotificationById(notification.id);
                    expect(fetched).not.toBeNull();
                    expect(fetched!.isRead).toBe(false);
                }),
                { numRuns: 50 }
            );
        });

        it('multiple notifications created should all have isRead = false', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.tuple(notificationTypeArb, messageArb), { minLength: 2, maxLength: 3 }),
                    async (notificationData) => {
                        // Create multiple notifications
                        for (const [type, message] of notificationData) {
                            const notification = await notificationService.createNotification(
                                testUserId,
                                type,
                                message
                            );
                            expect(notification.isRead).toBe(false);
                        }

                        // Verify all have isRead = false
                        const result = await notificationService.getNotifications(testUserId, 1, 100);
                        for (const notification of result.notifications) {
                            expect(notification.isRead).toBe(false);
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    // Property 22: Notification Read Status Update
    describe('Property 22: Notification Read Status Update', () => {
        it('marking notification as read should set isRead to true', async () => {
            await fc.assert(
                fc.asyncProperty(notificationTypeArb, messageArb, async (type, message) => {
                    // Create notification (isRead = false by default)
                    const notification = await notificationService.createNotification(
                        testUserId,
                        type,
                        message
                    );
                    expect(notification.isRead).toBe(false);

                    // Mark as read
                    const updated = await notificationService.markAsRead(notification.id, testUserId);
                    expect(updated.isRead).toBe(true);

                    // Verify by fetching from database
                    const fetched = await notificationService.getNotificationById(notification.id);
                    expect(fetched).not.toBeNull();
                    expect(fetched!.isRead).toBe(true);
                }),
                { numRuns: 50 }
            );
        });

        it('marking already read notification as read should keep isRead true (idempotent)', async () => {
            await fc.assert(
                fc.asyncProperty(notificationTypeArb, messageArb, async (type, message) => {
                    // Create and mark as read
                    const notification = await notificationService.createNotification(
                        testUserId,
                        type,
                        message
                    );
                    await notificationService.markAsRead(notification.id, testUserId);

                    // Mark as read again
                    const updated = await notificationService.markAsRead(notification.id, testUserId);
                    expect(updated.isRead).toBe(true);
                }),
                { numRuns: 30 }
            );
        });

        it('markAllAsRead should set all notifications to isRead = true', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.tuple(notificationTypeArb, messageArb), { minLength: 2, maxLength: 4 }),
                    async (notificationData) => {
                        // Create multiple notifications
                        for (const [type, message] of notificationData) {
                            await notificationService.createNotification(
                                testUserId,
                                type,
                                message
                            );
                        }

                        // Mark all as read
                        await notificationService.markAllAsRead(testUserId);

                        // Verify all are read
                        const result = await notificationService.getNotifications(testUserId, 1, 100);
                        for (const notification of result.notifications) {
                            expect(notification.isRead).toBe(true);
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    // Property 23: Notification Pagination and Sorting
    describe('Property 23: Notification Pagination and Sorting', () => {
        it('notifications should be sorted by createdAt descending', async () => {
            // Create notifications with small delays to ensure different timestamps
            for (let i = 0; i < 5; i++) {
                await notificationService.createNotification(
                    testUserId,
                    'GENERAL',
                    `Test message ${i}`
                );
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Get notifications
            const result = await notificationService.getNotifications(testUserId, 1, 100);

            // Verify descending order by createdAt
            for (let i = 1; i < result.notifications.length; i++) {
                const prev = new Date(result.notifications[i - 1].createdAt).getTime();
                const curr = new Date(result.notifications[i].createdAt).getTime();
                expect(prev).toBeGreaterThanOrEqual(curr);
            }
        });

        it('pagination metadata should include page, limit, total, and totalPages', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 3 }),  // page
                    fc.integer({ min: 1, max: 10 }), // limit
                    fc.integer({ min: 1, max: 8 }),  // count of notifications
                    async (page, limit, count) => {
                        // Create notifications
                        for (let i = 0; i < count; i++) {
                            await notificationService.createNotification(
                                testUserId,
                                'GENERAL',
                                `Test message ${i}`
                            );
                        }

                        // Get paginated notifications
                        const result = await notificationService.getNotifications(testUserId, page, limit);

                        // Verify pagination metadata exists and is correct
                        expect(result.page).toBe(page);
                        expect(result.limit).toBe(limit);
                        expect(typeof result.total).toBe('number');
                        expect(result.total).toBeGreaterThanOrEqual(0);
                        expect(typeof result.totalPages).toBe('number');
                        expect(result.totalPages).toBe(Math.ceil(result.total / limit));

                        // Verify notifications array exists
                        expect(Array.isArray(result.notifications)).toBe(true);

                        // Verify returned count doesn't exceed limit
                        expect(result.notifications.length).toBeLessThanOrEqual(limit);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it('totalPages should be calculated correctly based on total and limit', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 5 }), // limit
                    fc.integer({ min: 0, max: 12 }), // number of notifications to create
                    async (limit, count) => {
                        // Create specified number of notifications
                        for (let i = 0; i < count; i++) {
                            await notificationService.createNotification(
                                testUserId,
                                'GENERAL',
                                `Test message ${i}`
                            );
                        }

                        // Get paginated notifications
                        const result = await notificationService.getNotifications(testUserId, 1, limit);

                        // Verify totalPages calculation
                        const expectedTotalPages = Math.ceil(result.total / limit);
                        expect(result.totalPages).toBe(expectedTotalPages);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it('page beyond totalPages should return empty notifications array', async () => {
            // Create a few notifications
            for (let i = 0; i < 3; i++) {
                await notificationService.createNotification(
                    testUserId,
                    'GENERAL',
                    `Test message ${i}`
                );
            }

            // Request page way beyond what exists
            const result = await notificationService.getNotifications(testUserId, 1000, 10);

            // Should return empty array but valid metadata
            expect(result.notifications.length).toBe(0);
            expect(result.page).toBe(1000);
            expect(result.limit).toBe(10);
            expect(typeof result.total).toBe('number');
            expect(typeof result.totalPages).toBe('number');
        });
    });
});
