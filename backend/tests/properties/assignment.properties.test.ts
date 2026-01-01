/**
 * Property-Based Tests for Assignment Management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { AssignmentStatus, PaymentStatus } from '../../src/types';

// Mock types for testing without database
interface MockMission {
    id: number;
    institutionId: number;
    title: string;
    budget: number | null;
    status: 'OPEN' | 'ONGOING' | 'CLOSED' | 'CANCELLED';
}

interface MockAssignment {
    id: number;
    missionId: number;
    workerId: number;
    institutionId: number;
    status: AssignmentStatus;
    assignedAt: Date;
}

interface MockPayment {
    id: number;
    missionAssignmentId: number;
    institutionId: number;
    workerId: number;
    amountTotal: number;
    platformFee: number;
    workerAmount: number;
    status: PaymentStatus;
    paidAt: Date | null;
    createdAt: Date;
}

const PLATFORM_FEE_PERCENTAGE = 0.15;

/**
 * Valid status transitions
 * ACTIVE → ONGOING → COMPLETED
 * ACTIVE → CANCELLED
 * ONGOING → CANCELLED
 */
const VALID_STATUS_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
    ACTIVE: ['ONGOING', 'CANCELLED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: []  // Terminal state
};

// In-memory store for testing
class AssignmentStore {
    private missions: Map<number, MockMission> = new Map();
    private assignments: Map<number, MockAssignment> = new Map();
    private payments: Map<number, MockPayment> = new Map();
    private paymentIdCounter = 1;

    reset() {
        this.missions.clear();
        this.assignments.clear();
        this.payments.clear();
        this.paymentIdCounter = 1;
    }

    addMission(mission: MockMission) {
        this.missions.set(mission.id, mission);
    }

    addAssignment(assignment: MockAssignment) {
        this.assignments.set(assignment.id, assignment);
    }

    getMission(id: number): MockMission | undefined {
        return this.missions.get(id);
    }

    getAssignment(id: number): MockAssignment | undefined {
        return this.assignments.get(id);
    }

    getPaymentByAssignment(assignmentId: number): MockPayment | undefined {
        for (const payment of this.payments.values()) {
            if (payment.missionAssignmentId === assignmentId) {
                return payment;
            }
        }
        return undefined;
    }

    getAllPayments(): MockPayment[] {
        return Array.from(this.payments.values());
    }

    // Validate status transition
    isValidStatusTransition(currentStatus: AssignmentStatus, newStatus: AssignmentStatus): boolean {
        return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
    }

    // Calculate payment fees
    calculatePaymentFees(amount: number): { platformFee: number; workerAmount: number } {
        const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
        const workerAmount = Math.round((amount - platformFee) * 100) / 100;
        return { platformFee, workerAmount };
    }

    // Update assignment status with transition validation - Property 17
    updateAssignmentStatus(
        assignmentId: number,
        newStatus: AssignmentStatus,
        userId: number,
        userRole: 'institution' | 'admin'
    ): { success: boolean; statusCode: number; assignment?: MockAssignment; payment?: MockPayment; message?: string } {
        const assignment = this.assignments.get(assignmentId);
        if (!assignment) {
            return { success: false, statusCode: 404, message: 'Assignment not found' };
        }

        const mission = this.missions.get(assignment.missionId);
        if (!mission) {
            return { success: false, statusCode: 404, message: 'Mission not found' };
        }

        // Validate authorization (simplified - in real code would check userId matches institution)
        if (userRole !== 'institution' && userRole !== 'admin') {
            return { success: false, statusCode: 403, message: 'Unauthorized to update assignment' };
        }

        // Validate status transition
        if (!this.isValidStatusTransition(assignment.status, newStatus)) {
            return {
                success: false,
                statusCode: 400,
                message: `Invalid status transition from ${assignment.status} to ${newStatus}`
            };
        }

        // Update assignment status
        assignment.status = newStatus;

        let payment: MockPayment | undefined;

        // Handle status-specific actions
        if (newStatus === 'COMPLETED') {
            // Update mission status to CLOSED
            mission.status = 'CLOSED';

            // Property 17: Create payment record on completion
            const amount = mission.budget ?? 0;

            if (amount > 0) {
                const { platformFee, workerAmount } = this.calculatePaymentFees(amount);

                payment = {
                    id: this.paymentIdCounter++,
                    missionAssignmentId: assignment.id,
                    institutionId: assignment.institutionId,
                    workerId: assignment.workerId,
                    amountTotal: amount,
                    platformFee,
                    workerAmount,
                    status: 'PENDING',
                    paidAt: null,
                    createdAt: new Date()
                };
                this.payments.set(payment.id, payment);
            }
        } else if (newStatus === 'CANCELLED') {
            mission.status = 'CANCELLED';
        } else if (newStatus === 'ONGOING') {
            mission.status = 'ONGOING';
        }

        return { success: true, statusCode: 200, assignment, payment };
    }
}

describe('Assignment Management Property Tests', () => {
    let store: AssignmentStore;

    beforeEach(() => {
        store = new AssignmentStore();
    });

    afterEach(() => {
        store.reset();
    });

    // Arbitraries for generating test data
    const assignmentIdArb = fc.integer({ min: 1, max: 10000 });
    const missionIdArb = fc.integer({ min: 1, max: 10000 });
    const workerIdArb = fc.integer({ min: 1, max: 10000 });
    const institutionIdArb = fc.integer({ min: 1, max: 10000 });
    const userIdArb = fc.integer({ min: 1, max: 10000 });
    const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
    const budgetArb = fc.float({ min: 1, max: 100000, noNaN: true }).map(n => Math.round(n * 100) / 100);

    // Property 17: Assignment Completion Triggers Payment
    describe('Property 17: Assignment Completion Triggers Payment', () => {
        it('completing assignment with budget should create payment with PENDING status', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        // Setup: Create mission with budget and ONGOING assignment
                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING', // Must be ONGOING to transition to COMPLETED
                            assignedAt: new Date()
                        });

                        // Act: Complete the assignment
                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'COMPLETED',
                            userId,
                            'institution'
                        );

                        // Assert: Payment created with PENDING status
                        expect(result.success).toBe(true);
                        expect(result.statusCode).toBe(200);
                        expect(result.payment).toBeDefined();
                        expect(result.payment!.status).toBe('PENDING');
                        expect(result.payment!.missionAssignmentId).toBe(assignmentId);
                        expect(result.payment!.workerId).toBe(workerId);
                        expect(result.payment!.institutionId).toBe(institutionId);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('payment amount should match mission budget', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING',
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'COMPLETED',
                            userId,
                            'institution'
                        );

                        // Assert: Payment amount matches budget
                        expect(result.payment).toBeDefined();
                        expect(result.payment!.amountTotal).toBe(budget);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('payment fees should be calculated correctly (15% platform, 85% worker)', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING',
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'COMPLETED',
                            userId,
                            'institution'
                        );

                        // Assert: Fee calculation is correct
                        expect(result.payment).toBeDefined();
                        const expectedPlatformFee = Math.round(budget * 0.15 * 100) / 100;
                        const expectedWorkerAmount = Math.round((budget - expectedPlatformFee) * 100) / 100;

                        expect(result.payment!.platformFee).toBe(expectedPlatformFee);
                        expect(result.payment!.workerAmount).toBe(expectedWorkerAmount);

                        // Verify total equals sum of parts
                        expect(result.payment!.platformFee + result.payment!.workerAmount).toBeCloseTo(budget, 2);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('completing assignment should update mission status to CLOSED', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING',
                            assignedAt: new Date()
                        });

                        // Before completion
                        expect(store.getMission(missionId)!.status).toBe('ONGOING');

                        // Complete assignment
                        store.updateAssignmentStatus(assignmentId, 'COMPLETED', userId, 'institution');

                        // After completion
                        expect(store.getMission(missionId)!.status).toBe('CLOSED');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('completing assignment without budget should not create payment', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title) => {
                        store.reset();

                        // Mission with no budget
                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget: null,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING',
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'COMPLETED',
                            userId,
                            'institution'
                        );

                        // Assignment should complete but no payment created
                        expect(result.success).toBe(true);
                        expect(result.assignment!.status).toBe('COMPLETED');
                        expect(result.payment).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('payment should be retrievable after assignment completion', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ONGOING',
                            assignedAt: new Date()
                        });

                        store.updateAssignmentStatus(assignmentId, 'COMPLETED', userId, 'institution');

                        // Verify payment can be retrieved
                        const payment = store.getPaymentByAssignment(assignmentId);
                        expect(payment).toBeDefined();
                        expect(payment!.status).toBe('PENDING');
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Additional tests for status transition validation
    describe('Assignment Status Transitions', () => {
        it('ACTIVE assignment can transition to ONGOING', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ACTIVE',
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'ONGOING',
                            userId,
                            'institution'
                        );

                        expect(result.success).toBe(true);
                        expect(result.assignment!.status).toBe('ONGOING');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('ACTIVE assignment can transition to CANCELLED', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ACTIVE',
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'CANCELLED',
                            userId,
                            'institution'
                        );

                        expect(result.success).toBe(true);
                        expect(result.assignment!.status).toBe('CANCELLED');
                        expect(store.getMission(missionId)!.status).toBe('CANCELLED');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('ACTIVE assignment cannot directly transition to COMPLETED', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'ONGOING'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'ACTIVE', // Cannot go directly to COMPLETED
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            'COMPLETED',
                            userId,
                            'institution'
                        );

                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(400);
                        expect(result.message).toContain('Invalid status transition');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('COMPLETED assignment cannot transition to any other status', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    fc.constantFrom<AssignmentStatus>('ACTIVE', 'ONGOING', 'CANCELLED'),
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget, targetStatus) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'CLOSED'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'COMPLETED', // Terminal state
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            targetStatus,
                            userId,
                            'institution'
                        );

                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(400);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('CANCELLED assignment cannot transition to any other status', () => {
            fc.assert(
                fc.property(
                    assignmentIdArb,
                    missionIdArb,
                    workerIdArb,
                    institutionIdArb,
                    userIdArb,
                    titleArb,
                    budgetArb,
                    fc.constantFrom<AssignmentStatus>('ACTIVE', 'ONGOING', 'COMPLETED'),
                    (assignmentId, missionId, workerId, institutionId, userId, title, budget, targetStatus) => {
                        store.reset();

                        store.addMission({
                            id: missionId,
                            institutionId,
                            title,
                            budget,
                            status: 'CANCELLED'
                        });

                        store.addAssignment({
                            id: assignmentId,
                            missionId,
                            workerId,
                            institutionId,
                            status: 'CANCELLED', // Terminal state
                            assignedAt: new Date()
                        });

                        const result = store.updateAssignmentStatus(
                            assignmentId,
                            targetStatus,
                            userId,
                            'institution'
                        );

                        expect(result.success).toBe(false);
                        expect(result.statusCode).toBe(400);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
