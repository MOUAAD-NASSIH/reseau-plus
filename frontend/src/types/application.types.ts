/**
 * Application Types
 * Frontend types mirroring backend application models
 */

import type { Worker } from './auth.types';
import type { Mission } from './mission.types';

// ENUMS / STATUS TYPES


export type ApplicationStatus = 'SUBMITTED' | 'REJECTED' | 'ACCEPTED';

// ENTITY INTERFACES


/**
 * Mission application entity
 */
export interface MissionApplication {
    id: number;
    missionId: number;
    workerId: number;
    status: ApplicationStatus;
    appliedAt: string;
    // Relations
    mission?: Mission;
    worker?: Worker;
}

// INPUT INTERFACES


/**
 * Application creation input
 */
export interface CreateApplicationInput {
    missionId: number;
}

// FILTER INTERFACES


/**
 * Application filter options
 */
export interface ApplicationFilters {
    status?: ApplicationStatus;
    missionId?: number;
    workerId?: number;
    specialityId?: number;
    domainId?: number;
    minExperience?: number;
    page?: number;
    limit?: number;
}

