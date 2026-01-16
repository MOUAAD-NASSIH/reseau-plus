/**
 * Mission Types
 * Frontend types mirroring backend mission models
 */

import type { Institution, Speciality, Domain } from './auth.types';

// ENUMS / STATUS TYPES


export type MissionStatus = 'OPEN' | 'ONGOING' | 'CLOSED' | 'CANCELLED';
export type Urgency = 'HIGH' | 'MEDIUM' | 'LOW';

// ENTITY INTERFACES


/**
 * Mission entity
 */
export interface Mission {
    id: number;
    institutionId: number;
    title: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    requiredSpecialityId?: number | null;
    location?: string | null;
    budget?: number | null;
    urgency: Urgency;
    status: MissionStatus;
    createdAt: string;
    // Relations
    institution?: Institution;
    speciality?: Speciality | null;
    domains?: MissionDomain[];
    _count?: {
        applications: number;
        assignments: number;
    };
}

/**
 * Mission domain association
 */
export interface MissionDomain {
    id: number;
    missionId: number;
    domainId: number;
    isRequired: boolean;
    createdAt: string;
    // Relations
    domain?: Domain;
}

// INPUT INTERFACES


/**
 * Mission creation input
 */
export interface CreateMissionInput {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    requiredSpecialityId?: number;
    location?: string;
    budget?: number;
    urgency?: Urgency;
    domainIds?: number[];
}

/**
 * Mission update input
 */
export interface UpdateMissionInput {
    title?: string;
    description?: string | null;
    startDate?: string;
    endDate?: string;
    requiredSpecialityId?: number | null;
    location?: string | null;
    budget?: number | null;
    urgency?: Urgency;
    status?: MissionStatus;
    domainIds?: number[];
}

// FILTER INTERFACES


/**
 * Mission filter options
 */
export interface MissionFilters {
    status?: MissionStatus;
    specialityId?: number;
    domainId?: number;
    urgency?: Urgency;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    institutionId?: number;
    location?: string;
    minBudget?: number;
    maxBudget?: number;
    page?: number;
    limit?: number;
}

