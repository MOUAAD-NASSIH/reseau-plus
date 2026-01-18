/**
 * Authentication Types
 */

import { User } from './user.types';
import { Worker } from './worker.types';
import { Institution } from './institution.types';

export type RoleType = 'worker' | 'institution' | 'admin';

/**
 * JWT Token payload structure
 */
export interface TokenPayload {
    userId: number;
    email: string;
    role: RoleType;
    iat?: number;
    exp?: number;
}

/**
 * Worker registration input
 */
export interface RegisterWorkerInput {
    email: string;
    password: string;
    role: 'worker';
    firstName: string;
    lastName: string;
    specialityId: number;
}

/**
 * Institution registration input
 */
export interface RegisterInstitutionInput {
    email: string;
    password: string;
    role: 'institution';
    institutionName: string;
    address?: string;
    city?: string;
}

/**
 * Login credentials
 */
export interface LoginInput {
    email: string;
    password: string;
}

/**
 * Password reset request
 */
export interface ForgotPasswordInput {
    email: string;
}

/**
 * Password reset with token
 */
export interface ResetPasswordInput {
    token: string;
    password: string;
}

/**
 * Auth response with token
 */
export interface AuthResponse {
    user: User;
    worker?: Worker;
    institution?: Institution;
    token: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedUser {
    userId: number;
    email: string;
    role: RoleType;
    workerId?: number;
    institutionId?: number;
    profilePicture?: string | null;
}
