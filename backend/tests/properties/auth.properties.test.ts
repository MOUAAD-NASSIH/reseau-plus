/**
 * Property-Based Tests for Authentication
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import jwt from 'jsonwebtoken';
import {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
} from '../../src/services/authServices';
import { TokenPayload, RoleType } from '../../src/types/auth.types';
import {
    registerWorkerSchema,
    registerInstitutionSchema
} from '../../src/schemas/authSchemas';

const TEST_JWT_SECRET = 'test-secret-key-for-property-tests';
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe('Authentication Property Tests', () => {
    // Property 1: Password Hashing Integrity
    describe('Property 1: Password Hashing Integrity', () => {
        const passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const validPasswordArb = fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => [...s].every(c => passwordChars.includes(c)) && s.length >= 8);

        it('hashed password should never equal plaintext password', async () => {
            await fc.assert(
                fc.asyncProperty(validPasswordArb, async (password) => {
                    const hash = await hashPassword(password);
                    expect(hash).not.toBe(password);
                }),
                { numRuns: 100 }
            );
        });

        it('comparing plaintext with its hash should return true', async () => {
            await fc.assert(
                fc.asyncProperty(validPasswordArb, async (password) => {
                    const hash = await hashPassword(password);
                    const isMatch = await comparePassword(password, hash);
                    expect(isMatch).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('comparing different password with hash should return false', async () => {
            await fc.assert(
                fc.asyncProperty(
                    validPasswordArb,
                    validPasswordArb.filter(p => p.length >= 8),
                    async (password1, password2) => {
                        fc.pre(password1 !== password2);
                        const hash = await hashPassword(password1);
                        const isMatch = await comparePassword(password2, hash);
                        expect(isMatch).toBe(false);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('same password should produce different hashes (salt)', async () => {
            await fc.assert(
                fc.asyncProperty(validPasswordArb, async (password) => {
                    const hash1 = await hashPassword(password);
                    const hash2 = await hashPassword(password);
                    expect(hash1).not.toBe(hash2);
                    expect(await comparePassword(password, hash1)).toBe(true);
                    expect(await comparePassword(password, hash2)).toBe(true);
                }),
                { numRuns: 50 }
            );
        });
    });

    // Property 2: JWT Token Claims Consistency
    describe('Property 2: JWT Token Claims Consistency', () => {
        const userIdArb = fc.integer({ min: 1, max: 1000000 });
        const emailArb = fc.emailAddress();
        const roleArb = fc.constantFrom<RoleType>('worker', 'institution', 'admin');

        it('decoded token should contain exact userId, email, and role', () => {
            fc.assert(
                fc.property(userIdArb, emailArb, roleArb, (userId, email, role) => {
                    const payload: TokenPayload = { userId, email, role };
                    const token = generateToken(payload);
                    const decoded = verifyToken(token);

                    expect(decoded).not.toBeNull();
                    expect(decoded!.userId).toBe(userId);
                    expect(decoded!.email).toBe(email);
                    expect(decoded!.role).toBe(role);
                }),
                { numRuns: 100 }
            );
        });

        it('token should be a valid JWT string', () => {
            fc.assert(
                fc.property(userIdArb, emailArb, roleArb, (userId, email, role) => {
                    const payload: TokenPayload = { userId, email, role };
                    const token = generateToken(payload);
                    const parts = token.split('.');
                    expect(parts.length).toBe(3);
                    parts.forEach(part => expect(part.length).toBeGreaterThan(0));
                }),
                { numRuns: 100 }
            );
        });

        it('verifying invalid token should return null', () => {
            fc.assert(
                fc.property(fc.string({ minLength: 10, maxLength: 200 }), (invalidToken) => {
                    fc.pre(!invalidToken.includes('.') || invalidToken.split('.').length !== 3);
                    const decoded = verifyToken(invalidToken);
                    expect(decoded).toBeNull();
                }),
                { numRuns: 100 }
            );
        });

        it('token claims should be preserved through encode/decode cycle', () => {
            fc.assert(
                fc.property(userIdArb, emailArb, roleArb, (userId, email, role) => {
                    const originalPayload: TokenPayload = { userId, email, role };
                    const token = generateToken(originalPayload);
                    const decoded = verifyToken(token);

                    expect(decoded).not.toBeNull();
                    expect(decoded!.userId).toBe(originalPayload.userId);
                    expect(decoded!.email).toBe(originalPayload.email);
                    expect(decoded!.role).toBe(originalPayload.role);
                }),
                { numRuns: 100 }
            );
        });
    });

    // Property 3: Role-Specific Registration Validation
    describe('Property 3: Role-Specific Registration Validation', () => {
        const alphanumChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const alphaChars = 'abcdefghijklmnopqrstuvwxyz';
        const passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const nameChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const emailArb = fc.tuple(
            fc.string({ minLength: 3, maxLength: 10 }).filter(s => [...s].every(c => alphanumChars.includes(c))),
            fc.string({ minLength: 2, maxLength: 6 }).filter(s => [...s].every(c => alphaChars.includes(c))),
            fc.constantFrom('com', 'org', 'net', 'io')
        ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

        const passwordArb = fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => [...s].every(c => passwordChars.includes(c)) && s.length >= 8);

        const nameArb = fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => [...s].every(c => nameChars.includes(c)) && s.length >= 1);

        const specialityIdArb = fc.integer({ min: 1, max: 100 });

        it('worker registration without firstName should fail validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, nameArb, specialityIdArb, (email, password, lastName, specialityId) => {
                    const result = registerWorkerSchema.safeParse({
                        body: { email, password, lastName, specialityId }
                    });
                    expect(result.success).toBe(false);
                }),
                { numRuns: 100 }
            );
        });

        it('worker registration without lastName should fail validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, nameArb, specialityIdArb, (email, password, firstName, specialityId) => {
                    const result = registerWorkerSchema.safeParse({
                        body: { email, password, firstName, specialityId }
                    });
                    expect(result.success).toBe(false);
                }),
                { numRuns: 100 }
            );
        });

        it('worker registration without specialityId should fail validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, nameArb, nameArb, (email, password, firstName, lastName) => {
                    const result = registerWorkerSchema.safeParse({
                        body: { email, password, firstName, lastName }
                    });
                    expect(result.success).toBe(false);
                }),
                { numRuns: 100 }
            );
        });

        it('worker registration with all required fields should pass validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, nameArb, nameArb, specialityIdArb, (email, password, firstName, lastName, specialityId) => {
                    const result = registerWorkerSchema.safeParse({
                        body: { email, password, firstName, lastName, specialityId }
                    });
                    expect(result.success).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('institution registration without institutionName should fail validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, (email, password) => {
                    const result = registerInstitutionSchema.safeParse({
                        body: { email, password }
                    });
                    expect(result.success).toBe(false);
                }),
                { numRuns: 100 }
            );
        });

        it('institution registration with institutionName should pass validation', () => {
            fc.assert(
                fc.property(emailArb, passwordArb, nameArb, (email, password, institutionName) => {
                    const result = registerInstitutionSchema.safeParse({
                        body: { email, password, institutionName }
                    });
                    expect(result.success).toBe(true);
                }),
                { numRuns: 100 }
            );
        });
    });

    // Property 4: Authentication Enforcement
    describe('Property 4: Authentication Enforcement', () => {
        it('verifyToken should return null for empty string', () => {
            const decoded = verifyToken('');
            expect(decoded).toBeNull();
        });

        it('verifyToken should return null for malformed tokens', () => {
            fc.assert(
                fc.property(fc.string({ minLength: 1, maxLength: 500 }), (randomString) => {
                    const parts = randomString.split('.');
                    fc.pre(parts.length !== 3 || parts.some(p => p.length === 0));
                    const decoded = verifyToken(randomString);
                    expect(decoded).toBeNull();
                }),
                { numRuns: 100 }
            );
        });

        it('verifyToken should return null for tokens with wrong secret', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000000 }),
                    fc.emailAddress(),
                    fc.constantFrom<RoleType>('worker', 'institution', 'admin'),
                    (userId, email, role) => {
                        const wrongSecretToken = jwt.sign(
                            { userId, email, role },
                            'wrong-secret-key',
                            { expiresIn: '24h' }
                        );
                        const decoded = verifyToken(wrongSecretToken);
                        expect(decoded).toBeNull();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('verifyToken should return valid payload for correctly signed tokens', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000000 }),
                    fc.emailAddress(),
                    fc.constantFrom<RoleType>('worker', 'institution', 'admin'),
                    (userId, email, role) => {
                        const payload: TokenPayload = { userId, email, role };
                        const token = generateToken(payload);
                        const decoded = verifyToken(token);

                        expect(decoded).not.toBeNull();
                        expect(decoded!.userId).toBe(userId);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Property 5: Role-Based Access Control
    describe('Property 5: Role-Based Access Control', () => {
        const checkRoleAccess = (userRole: RoleType, allowedRoles: RoleType[]): boolean => {
            return allowedRoles.includes(userRole);
        };

        it('user with allowed role should have access', () => {
            fc.assert(
                fc.property(fc.constantFrom<RoleType>('worker', 'institution', 'admin'), (role) => {
                    const hasAccess = checkRoleAccess(role, [role]);
                    expect(hasAccess).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('user with different role should not have access to single-role routes', () => {
            const rolePairs: [RoleType, RoleType][] = [
                ['worker', 'admin'], ['worker', 'institution'],
                ['institution', 'admin'], ['institution', 'worker'],
                ['admin', 'worker'], ['admin', 'institution']
            ];

            fc.assert(
                fc.property(fc.constantFrom(...rolePairs), ([userRole, allowedRole]) => {
                    const hasAccess = checkRoleAccess(userRole, [allowedRole]);
                    expect(hasAccess).toBe(false);
                }),
                { numRuns: 100 }
            );
        });

        it('admin should have access to admin-only routes', () => {
            fc.assert(
                fc.property(fc.constantFrom<RoleType>('worker', 'institution', 'admin'), (role) => {
                    const hasAccess = checkRoleAccess(role, ['admin']);
                    expect(hasAccess).toBe(role === 'admin');
                }),
                { numRuns: 100 }
            );
        });

        it('worker or institution should have access to workerOrInstitution routes', () => {
            fc.assert(
                fc.property(fc.constantFrom<RoleType>('worker', 'institution', 'admin'), (role) => {
                    const hasAccess = checkRoleAccess(role, ['worker', 'institution']);
                    expect(hasAccess).toBe(role === 'worker' || role === 'institution');
                }),
                { numRuns: 100 }
            );
        });

        it('any role should have access when all roles are allowed', () => {
            fc.assert(
                fc.property(fc.constantFrom<RoleType>('worker', 'institution', 'admin'), (role) => {
                    const hasAccess = checkRoleAccess(role, ['worker', 'institution', 'admin']);
                    expect(hasAccess).toBe(true);
                }),
                { numRuns: 100 }
            );
        });

        it('token role should match user role for access control', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000000 }),
                    fc.emailAddress(),
                    fc.constantFrom<RoleType>('worker', 'institution', 'admin'),
                    fc.constantFrom<RoleType>('worker', 'institution', 'admin'),
                    (userId, email, tokenRole, requiredRole) => {
                        const payload: TokenPayload = { userId, email, role: tokenRole };
                        const token = generateToken(payload);
                        const decoded = verifyToken(token);

                        expect(decoded).not.toBeNull();
                        const hasAccess = checkRoleAccess(decoded!.role, [requiredRole]);
                        expect(hasAccess).toBe(tokenRole === requiredRole);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
