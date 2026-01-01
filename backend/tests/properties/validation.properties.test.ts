/**
 * Property-Based Tests for Validation Schemas
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dateRangeSchema, validateDateRange } from '../../src/schemas/commonSchemas';

describe('Validation Schema Properties', () => {
    // Property 25: Date Range Validation
    describe('Property 25: Date Range Validation', () => {
        // Arbitrary for generating valid date ranges (endDate > startDate)
        const validDateRangeArb = fc.tuple(
            fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
            fc.integer({ min: 1, max: 365 * 10 }) // days to add
        ).map(([startDate, daysToAdd]) => {
            const endDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
            return { startDate, endDate };
        });

        // Arbitrary for generating invalid date ranges (endDate <= startDate)
        const invalidDateRangeArb = fc.tuple(
            fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
            fc.integer({ min: 0, max: 365 * 10 }) // days to subtract (0 = same date)
        ).map(([endDate, daysToSubtract]) => {
            const startDate = new Date(endDate.getTime() + daysToSubtract * 24 * 60 * 60 * 1000);
            return { startDate, endDate };
        });

        it('should accept all valid date ranges where endDate > startDate', () => {
            fc.assert(
                fc.property(validDateRangeArb, ({ startDate, endDate }) => {
                    const result = dateRangeSchema.safeParse({ startDate, endDate });
                    expect(result.success).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('should reject all invalid date ranges where endDate <= startDate', () => {
            fc.assert(
                fc.property(invalidDateRangeArb, ({ startDate, endDate }) => {
                    const result = dateRangeSchema.safeParse({ startDate, endDate });
                    expect(result.success).toBe(false);
                    if (!result.success && result.error && result.error.issues) {
                        const errorMessages = result.error.issues.map(e => e.message);
                        expect(errorMessages).toContain('End date must be after start date');
                    }
                }),
                { numRuns: 100 }
            );
        });

        it('should validate date range helper function correctly', () => {
            fc.assert(
                fc.property(
                    fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
                    fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
                    (date1, date2) => {
                        const isValid = validateDateRange(date1, date2);
                        expect(isValid).toBe(date2 > date1);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle string date inputs via coercion', () => {
            fc.assert(
                fc.property(validDateRangeArb, ({ startDate, endDate }) => {
                    const result = dateRangeSchema.safeParse({
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    });
                    expect(result.success).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('should reject same date for start and end', () => {
            fc.assert(
                fc.property(
                    fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
                    (date) => {
                        const result = dateRangeSchema.safeParse({
                            startDate: date,
                            endDate: date,
                        });
                        expect(result.success).toBe(false);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
