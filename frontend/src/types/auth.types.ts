
// ENUMS


export type UserRole = 'admin' | 'worker' | 'institution';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type WorkerStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// BASE MODELS


export interface Role {
    id: number;
    name: UserRole;
    description?: string | null;
}

// Base User
export interface User {
    id: number;
    email: string;
    role: Role;
    status: UserStatus;
    createdAt: string;
    profilePicture?: string | null;
}

// Worker Profile
export interface Worker {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
    specialityId?: number | null;
    experienceYears?: number | null;
    role: UserRole;
    bio?: string | null;
    city?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status: WorkerStatus;
    rejectionReason?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    createdAt: string;
    // Relations
    user?: User;
    speciality?: Speciality | null;
    documents?: WorkerDocument[];
    experiences?: WorkerExperience[];
    domains?: WorkerDomain[];
}

// Institution Profile
export interface Institution {
    id: number;
    userId: number;
    institutionName: string;
    logo?: string | null;
    role: UserRole;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: string;
    profilePicture?: string | null;
    // Relations
    user?: User;
}

// Admin Profile
export type Admin = User;

// RELATED MODELS


export interface Speciality {
    id: number;
    name: string;
    description?: string | null;
}

export interface Domain {
    id: number;
    name: string;
    description?: string | null;
}

export interface WorkerDocument {
    id: number;
    workerId: number;
    type: string; // DIPLOMA, CV, ID, OTHER
    fileUrl: string;
    status: DocumentStatus;
    title?: string;
    adminComment?: string | null;
    uploadedAt: string;
    reviewedAt?: string | null;
    worker?: Worker;
}

export interface WorkerExperience {
    id: number;
    workerId: number;
    jobTitle: string;
    organization: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    createdAt: string;
}

export interface WorkerDomain {
    id: number;
    workerId: number;
    domainId: number;
    createdAt: string;
    // Relations
    domain?: Domain;
}

export interface WorkerAvailability {
    id: number;
    workerId: number;
    startDate: string;
    endDate: string;
    status: 'available' | 'blocked';
    isRecurring: boolean;
    createdAt: string;
}

// API REQUEST DTOs


export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterWorkerRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialityId?: number;
    domainIds?: number[];
    experiences?: WorkerExperienceInput[];
    experienceYears?: number;
    bio?: string;
    city?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    birthDate?: string;
    gender?: string;
    // Note: File uploads handled separately via FormData
}

export interface RegisterInstitutionRequest {
    email: string;
    password: string;
    institutionName: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}

// Worker experience for registration
export interface WorkerExperienceInput {
    jobTitle: string;
    organization: string;
    startDate: string;
    endDate?: string | null;
    description?: string;
}

// API RESPONSE DTOs


// Auth response (login, register)
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            email: string;
            role: UserRole;
            status?: UserStatus;
            createdAt: string;
        };
        worker?: {
            id: number;
            firstName: string;
            lastName: string;
            status: WorkerStatus;
        };
        institution?: {
            id: number;
            institutionName: string;
        };
        token: string;
    };
}

// Full profile response (from /auth/me endpoint)
export interface MeResponse {
    success: boolean;
    message: string;
    data: {
        user: AuthenticatedUser;
    };
}

// UTILITY TYPES


// Unified type for authenticated user state
export type AuthenticatedUser = Worker | Institution | Admin;

// Type guards
export function isWorker(user: AuthenticatedUser): user is Worker {
    return 'firstName' in user && 'lastName' in user;
}
export function isInstitution(user: AuthenticatedUser): user is Institution {
    return 'institutionName' in user;
}
export function isAdmin(user: AuthenticatedUser): user is Admin {
    return !isWorker(user) && !isInstitution(user);
}

// ENHANCED WORKER TYPES


export type DocumentType = 'DIPLOMA' | 'CV' | 'ID' | 'OTHER';

/**
 * Worker profile update input
 */
export interface UpdateWorkerInput {
    firstName?: string;
    lastName?: string;
    specialityId?: number | null;
    experienceYears?: number | null;
    bio?: string | null;
    city?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    birthDate?: string | null;
    gender?: string | null;
    domainIds?: number[] | null;
}

/**
 * Worker filter options
 */
export interface WorkerFilters {
    status?: WorkerStatus;
    specialityId?: number;
    city?: string;
    domainId?: number;
    minExperience?: number;
    maxExperience?: number;
    page?: number;
    limit?: number;
}

/**
 * Document upload input
 */
export interface DocumentUploadInput {
    type: DocumentType;
    file: File;
    title?: string;
}

// ENHANCED INSTITUTION TYPES


/**
 * Institution profile update input
 */
export interface UpdateInstitutionInput {
    institutionName?: string;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * Institution filter options
 */
export interface InstitutionFilters {
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// DOMAIN & SPECIALITY FILTERS


/**
 * Domain filter options
 */
export interface DomainFilters {
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Speciality filter options
 */
export interface SpecialityFilters {
    search?: string;
    page?: number;
    limit?: number;
}
