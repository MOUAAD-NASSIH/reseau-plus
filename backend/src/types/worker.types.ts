/**
 * Worker Types
 */

export type WorkerStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'DIPLOMA' | 'CV' | 'ID' | 'OTHER';

/**
 * Worker profile entity
 */
export interface Worker {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    specialityId?: number | null;
    experienceYears?: number | null;
    bio?: string | null;
    city?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status: WorkerStatus;
    rejectionReason?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    createdAt: Date;
}

/**
 * Worker document entity
 */
export interface WorkerDocument {
    id: number;
    workerId: number;
    type: string;
    fileUrl: string;
    status: DocumentStatus;
    adminComment?: string | null;
    uploadedAt: Date;
    reviewedAt?: Date | null;
}

/**
 * Worker experience entity
 */
export interface WorkerExperience {
    id: number;
    workerId: number;
    jobTitle: string;
    organization: string;
    startDate: Date;
    endDate?: Date | null;
    description?: string | null;
    createdAt: Date;
}

/**
 * Worker availability entity
 */
export interface WorkerAvailability {
    id: number;
    workerId: number;
    startDate: Date;
    endDate: Date;
    isRecurring: boolean;
    createdAt: Date;
}

/**
 * Worker domain association
 */
export interface WorkerDomain {
    id: number;
    workerId: number;
    domainId: number;
    createdAt: Date;
}

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
    birthDate?: Date | string | null;
    gender?: string | null;
}

/**
 * Worker experience input
 */
export interface ExperienceInput {
    jobTitle: string;
    organization: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    description?: string | null;
}

/**
 * Worker availability input
 */
export interface AvailabilityInput {
    startDate: Date | string;
    endDate: Date | string;
    isRecurring?: boolean;
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
}

/**
 * Document upload input
 */
export interface DocumentUploadInput {
    type: DocumentType;
    file: Express.Multer.File;
}
