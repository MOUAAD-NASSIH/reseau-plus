/**
 * Property-Based Tests for Payment System
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateFees, PaymentError } from '../../src/services/paymentService';

const PLATFORM_FEE_PERCENTAGE = 0.15;
const WORKER_AMOUNT_PERCENTAGE = 0.85;

describe('Payment Property Tests', () => {
    // Property 16: Payment Fee Calculation
    describe('Property 16: Payment Fee Calculation', () => {
        // Arbitrary for generating valid positive payment amounts
        // Using realistic payment ranges (0.01 to 1,000,000)
        const positiveAmountArb = fc.double({
            min: 0.01,
            max: 1000000,
            noNaN: true,
            noDefaultInfinity: true
        });

        it('platformFee should equal exactly 15% of amountTotal (rounded to 2 decimals)', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);
                    const expectedPlatformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;

                    expect(result.platformFee).toBe(expectedPlatformFee);
                }),
                { numRuns: 100 }
            );
        });

        it('workerAmount should equal exactly 85% of amountTotal (rounded to 2 decimals)', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);
                    const expectedWorkerAmount = Math.round(amount * WORKER_AMOUNT_PERCENTAGE * 100) / 100;

                    expect(result.workerAmount).toBe(expectedWorkerAmount);
                }),
                { numRuns: 100 }
            );
        });

        it('amountTotal should be preserved in the result', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);

                    expect(result.amountTotal).toBe(amount);
                }),
                { numRuns: 100 }
            );
        });

        it('platformFee + workerAmount should approximately equal amountTotal', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);
                    const sum = result.platformFee + result.workerAmount;

                    // Due to rounding, allow small tolerance (max 0.02 difference)
                    expect(Math.abs(sum - amount)).toBeLessThanOrEqual(0.02);
                }),
                { numRuns: 100 }
            );
        });

        it('platformFee should always be less than amountTotal', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);

                    expect(result.platformFee).toBeLessThan(result.amountTotal);
                }),
                { numRuns: 100 }
            );
        });

        it('workerAmount should always be greater than platformFee', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);

                    // 85% > 15%, so worker amount should always be greater
                    expect(result.workerAmount).toBeGreaterThan(result.platformFee);
                }),
                { numRuns: 100 }
            );
        });

        it('fee calculation should be deterministic (same input = same output)', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result1 = calculateFees(amount);
                    const result2 = calculateFees(amount);

                    expect(result1.platformFee).toBe(result2.platformFee);
                    expect(result1.workerAmount).toBe(result2.workerAmount);
                    expect(result1.amountTotal).toBe(result2.amountTotal);
                }),
                { numRuns: 100 }
            );
        });

        it('should throw error for zero amount', () => {
            expect(() => calculateFees(0)).toThrow(PaymentError);
        });

        it('should throw error for negative amounts', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: -1000000, max: -0.01, noNaN: true, noDefaultInfinity: true }),
                    (negativeAmount) => {
                        expect(() => calculateFees(negativeAmount)).toThrow(PaymentError);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('platformFee and workerAmount should be non-negative for positive amounts', () => {
            fc.assert(
                fc.property(positiveAmountArb, (amount) => {
                    const result = calculateFees(amount);

                    expect(result.platformFee).toBeGreaterThanOrEqual(0);
                    expect(result.workerAmount).toBeGreaterThanOrEqual(0);
                }),
                { numRuns: 100 }
            );
        });

        it('fee ratio should be consistent (platformFee/amountTotal ≈ 0.15)', () => {
            fc.assert(
                fc.property(
                    fc.double({ min: 1, max: 1000000, noNaN: true, noDefaultInfinity: true }),
                    (amount) => {
                        const result = calculateFees(amount);
                        const ratio = result.platformFee / result.amountTotal;

                        // Allow small tolerance due to rounding
                        expect(Math.abs(ratio - PLATFORM_FEE_PERCENTAGE)).toBeLessThan(0.01);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
