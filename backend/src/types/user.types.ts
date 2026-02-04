/**
 * User Types
 */

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

/**
 * Base User entity
 */
export interface User {
    id: number;
    email: string;
    password?: string;
    roleId: number;
    status: UserStatus;
    verificationToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    createdAt: Date;
    role?: Role;
}

/**
 * Role entity
 */
export interface Role {
    id: number;
    name: string;
    description?: string | null;
}

/**
 * User with related profiles
 */
export interface UserWithProfile extends User {
    worker?: import('./worker.types').Worker | null;
    institution?: import('./institution.types').Institution | null;
}

/**
 * User creation input
 */
export interface CreateUserInput {
    email: string;
    password: string;
    roleId: number;
    status?: UserStatus;
}

/**
 * User update input
 */
export interface UpdateUserInput {
    email?: string;
    password?: string;
    status?: UserStatus;
    verificationToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
}
