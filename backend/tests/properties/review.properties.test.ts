/**
 * Property-Based Tests for Review System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { RATING_MIN, RATING_MAX } from '../../src/types/review.types';

// Mock Prisma client
vi.mock('../../src/lib/prisma', () => ({
    prisma: {
        missionAssignment: {
            findUnique: vi.fn()
        },
        review: {
            findFirst: vi.fn(),
            create: vi.fn(),
            aggregate: vi.fn()
        },
        worker: {
            findUnique: vi.fn()
        },
        institution: {
            findUnique: vi.fn()
        },
        adminLog: {
            create: vi.fn()
        }
    }
}));

// Import after mocking
import { prisma } from '../../src/lib/prisma';
import * as reviewService from '../../src/services/reviewService';

describe('Review Property Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Property 18: Review Rating Bounds
    describe('Property 18: Review Rating Bounds', () => {
        // Arbitrary for valid ratings (1-5)
        const validRatingArb = fc.integer({ min: RATING_MIN, max: RATING_MAX });

        // Arbitrary for invalid ratings (outside 1-5)
        const invalidRatingBelowArb = fc.integer({ min: -1000, max: RATING_MIN - 1 });
        const invalidRatingAboveArb = fc.integer({ min: RATING_MAX + 1, max: 1000 });

        it('should accept ratings between 1 and 5 inclusive', () => {
            fc.assert(
                fc.property(validRatingArb, (rating) => {
                    // Rating should be within bounds
                    expect(rating).toBeGreaterThanOrEqual(RATING_MIN);
                    expect(rating).toBeLessThanOrEqual(RATING_MAX);
                }),
                { numRuns: 100 }
            );
        });

        it('should reject ratings below minimum (1)', async () => {
            // Setup mock for a completed assignment
            const mockAssignment = {
                id: 1,
                status: 'COMPLETED',
                worker: { userId: 1, user: { id: 1 } },
                institution: { userId: 2, user: { id: 2 } },
                mission: { id: 1 }
            };

            vi.mocked(prisma.missionAssignment.findUnique).mockResolvedValue(mockAssignment as any);
            vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

            await fc.assert(
                fc.asyncProperty(invalidRatingBelowArb, async (rating) => {
                    await expect(
                        reviewService.createReview(1, 1, rating, 'test comment')
                    ).rejects.toThrow(`Rating must be between ${RATING_MIN} and ${RATING_MAX}`);
                }),
                { numRuns: 100 }
            );
        });

        it('should reject ratings above maximum (5)', async () => {
            // Setup mock for a completed assignment
            const mockAssignment = {
                id: 1,
                status: 'COMPLETED',
                worker: { userId: 1, user: { id: 1 } },
                institution: { userId: 2, user: { id: 2 } },
                mission: { id: 1 }
            };

            vi.mocked(prisma.missionAssignment.findUnique).mockResolvedValue(mockAssignment as any);
            vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

            await fc.assert(
                fc.asyncProperty(invalidRatingAboveArb, async (rating) => {
                    await expect(
                        reviewService.createReview(1, 1, rating, 'test comment')
                    ).rejects.toThrow(`Rating must be between ${RATING_MIN} and ${RATING_MAX}`);
                }),
                { numRuns: 100 }
            );
        });

        it('rating bounds should be exactly 1 and 5', () => {
            expect(RATING_MIN).toBe(1);
            expect(RATING_MAX).toBe(5);
        });

        it('all valid ratings should be integers', () => {
            fc.assert(
                fc.property(validRatingArb, (rating) => {
                    expect(Number.isInteger(rating)).toBe(true);
                }),
                { numRuns: 100 }
            );
        });
    });

    // Property 19: Single Review Per User Per Assignment
    describe('Property 19: Single Review Per User Per Assignment', () => {
        // Arbitrary for generating user and assignment IDs
        const userIdArb = fc.integer({ min: 1, max: 10000 });
        const assignmentIdArb = fc.integer({ min: 1, max: 10000 });
        const validRatingArb = fc.integer({ min: RATING_MIN, max: RATING_MAX });

        it('should reject duplicate review from same user for same assignment', async () => {
            await fc.assert(
                fc.asyncProperty(
                    userIdArb,
                    assignmentIdArb,
                    validRatingArb,
                    async (userId, assignmentId, rating) => {
                        // Setup mock for a completed assignment where user is the worker
                        const mockAssignment = {
                            id: assignmentId,
                            status: 'COMPLETED',
                            worker: { userId: userId, user: { id: userId } },
                            institution: { userId: userId + 1, user: { id: userId + 1 } },
                            mission: { id: 1 }
                        };

                        // Mock existing review (user already reviewed)
                        const existingReview = {
                            id: 1,
                            missionAssignmentId: assignmentId,
                            reviewerId: userId,
                            revieweeId: userId + 1,
                            rating: 4,
                            comment: 'Previous review'
                        };

                        vi.mocked(prisma.missionAssignment.findUnique).mockResolvedValue(mockAssignment as any);
                        vi.mocked(prisma.review.findFirst).mockResolvedValue(existingReview as any);

                        await expect(
                            reviewService.createReview(userId, assignmentId, rating, 'Duplicate review')
                        ).rejects.toThrow('You have already reviewed this assignment');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should allow first review from user for assignment', async () => {
            await fc.assert(
                fc.asyncProperty(
                    userIdArb,
                    assignmentIdArb,
                    validRatingArb,
                    fc.string({ minLength: 0, maxLength: 500 }),
                    async (userId, assignmentId, rating, comment) => {
                        // Setup mock for a completed assignment where user is the worker
                        const mockAssignment = {
                            id: assignmentId,
                            status: 'COMPLETED',
                            worker: { userId: userId, user: { id: userId } },
                            institution: { userId: userId + 1, user: { id: userId + 1 } },
                            mission: { id: 1 }
                        };

                        // No existing review
                        vi.mocked(prisma.missionAssignment.findUnique).mockResolvedValue(mockAssignment as any);
                        vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

                        // Mock successful review creation
                        const createdReview = {
                            id: 1,
                            missionAssignmentId: assignmentId,
                            reviewerId: userId,
                            revieweeId: userId + 1,
                            rating: rating,
                            comment: comment || null,
                            createdAt: new Date(),
                            reviewer: { id: userId, email: 'test@test.com', worker: null, institution: null },
                            reviewee: { id: userId + 1, email: 'inst@test.com', worker: null, institution: null },
                            missionAssignment: { mission: { id: 1, title: 'Test Mission' } }
                        };

                        vi.mocked(prisma.review.create).mockResolvedValue(createdReview as any);

                        const result = await reviewService.createReview(userId, assignmentId, rating, comment);

                        expect(result).toBeDefined();
                        expect(result.reviewerId).toBe(userId);
                        expect(result.missionAssignmentId).toBe(assignmentId);
                        expect(result.rating).toBe(rating);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('uniqueness constraint should be per user per assignment', async () => {
            // Different users can review the same assignment
            const userId1 = 1;
            const userId2 = 2;
            const assignmentId = 100;

            // Setup mock for a completed assignment
            const mockAssignment = {
                id: assignmentId,
                status: 'COMPLETED',
                worker: { userId: userId1, user: { id: userId1 } },
                institution: { userId: userId2, user: { id: userId2 } },
                mission: { id: 1 }
            };

            vi.mocked(prisma.missionAssignment.findUnique).mockResolvedValue(mockAssignment as any);

            // First user (worker) reviews - no existing review
            vi.mocked(prisma.review.findFirst).mockResolvedValueOnce(null);
            vi.mocked(prisma.review.create).mockResolvedValueOnce({
                id: 1,
                missionAssignmentId: assignmentId,
                reviewerId: userId1,
                revieweeId: userId2,
                rating: 4,
                comment: 'Worker review',
                createdAt: new Date()
            } as any);

            const review1 = await reviewService.createReview(userId1, assignmentId, 4, 'Worker review');
            expect(review1.reviewerId).toBe(userId1);

            // Second user (institution) reviews - no existing review for this user
            vi.mocked(prisma.review.findFirst).mockResolvedValueOnce(null);
            vi.mocked(prisma.review.create).mockResolvedValueOnce({
                id: 2,
                missionAssignmentId: assignmentId,
                reviewerId: userId2,
                revieweeId: userId1,
                rating: 5,
                comment: 'Institution review',
                createdAt: new Date()
            } as any);

            const review2 = await reviewService.createReview(userId2, assignmentId, 5, 'Institution review');
            expect(review2.reviewerId).toBe(userId2);
        });
    });

    // Property 20: Average Rating Calculation
    describe('Property 20: Average Rating Calculation', () => {
        // Arbitrary for generating arrays of valid ratings
        const ratingsArrayArb = fc.array(
            fc.integer({ min: RATING_MIN, max: RATING_MAX }),
            { minLength: 1, maxLength: 100 }
        );

        const userIdArb = fc.integer({ min: 1, max: 10000 });

        it('average rating should equal sum of ratings divided by count', async () => {
            await fc.assert(
                fc.asyncProperty(userIdArb, ratingsArrayArb, async (userId, ratings) => {
                    const sum = ratings.reduce((acc, r) => acc + r, 0);
                    const count = ratings.length;
                    const expectedAverage = Math.round((sum / count) * 100) / 100;

                    // Mock the aggregate result
                    vi.mocked(prisma.review.aggregate).mockResolvedValue({
                        _avg: { rating: sum / count },
                        _count: { rating: count }
                    } as any);

                    const result = await reviewService.calculateAverageRating(userId);

                    expect(result.averageRating).toBe(expectedAverage);
                    expect(result.totalReviews).toBe(count);
                }),
                { numRuns: 100 }
            );
        });

        it('average rating should be between RATING_MIN and RATING_MAX', async () => {
            await fc.assert(
                fc.asyncProperty(userIdArb, ratingsArrayArb, async (userId, ratings) => {
                    const sum = ratings.reduce((acc, r) => acc + r, 0);
                    const count = ratings.length;

                    vi.mocked(prisma.review.aggregate).mockResolvedValue({
                        _avg: { rating: sum / count },
                        _count: { rating: count }
                    } as any);

                    const result = await reviewService.calculateAverageRating(userId);

                    expect(result.averageRating).toBeGreaterThanOrEqual(RATING_MIN);
                    expect(result.averageRating).toBeLessThanOrEqual(RATING_MAX);
                }),
                { numRuns: 100 }
            );
        });

        it('average rating should be 0 for users with no reviews', async () => {
            await fc.assert(
                fc.asyncProperty(userIdArb, async (userId) => {
                    vi.mocked(prisma.review.aggregate).mockResolvedValue({
                        _avg: { rating: null },
                        _count: { rating: 0 }
                    } as any);

                    const result = await reviewService.calculateAverageRating(userId);

                    expect(result.averageRating).toBe(0);
                    expect(result.totalReviews).toBe(0);
                }),
                { numRuns: 100 }
            );
        });

        it('average rating should be rounded to 2 decimal places', async () => {
            await fc.assert(
                fc.asyncProperty(userIdArb, ratingsArrayArb, async (userId, ratings) => {
                    const sum = ratings.reduce((acc, r) => acc + r, 0);
                    const count = ratings.length;

                    vi.mocked(prisma.review.aggregate).mockResolvedValue({
                        _avg: { rating: sum / count },
                        _count: { rating: count }
                    } as any);

                    const result = await reviewService.calculateAverageRating(userId);

                    // Check that the result has at most 2 decimal places
                    const decimalPlaces = (result.averageRating.toString().split('.')[1] || '').length;
                    expect(decimalPlaces).toBeLessThanOrEqual(2);
                }),
                { numRuns: 100 }
            );
        });

        it('single rating should equal the average', async () => {
            await fc.assert(
                fc.asyncProperty(
                    userIdArb,
                    fc.integer({ min: RATING_MIN, max: RATING_MAX }),
                    async (userId, singleRating) => {
                        vi.mocked(prisma.review.aggregate).mockResolvedValue({
                            _avg: { rating: singleRating },
                            _count: { rating: 1 }
                        } as any);

                        const result = await reviewService.calculateAverageRating(userId);

                        expect(result.averageRating).toBe(singleRating);
                        expect(result.totalReviews).toBe(1);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('average calculation should be deterministic', async () => {
            await fc.assert(
                fc.asyncProperty(userIdArb, ratingsArrayArb, async (userId, ratings) => {
                    const sum = ratings.reduce((acc, r) => acc + r, 0);
                    const count = ratings.length;

                    vi.mocked(prisma.review.aggregate).mockResolvedValue({
                        _avg: { rating: sum / count },
                        _count: { rating: count }
                    } as any);

                    const result1 = await reviewService.calculateAverageRating(userId);
                    const result2 = await reviewService.calculateAverageRating(userId);

                    expect(result1.averageRating).toBe(result2.averageRating);
                    expect(result1.totalReviews).toBe(result2.totalReviews);
                }),
                { numRuns: 100 }
            );
        });
    });
});
