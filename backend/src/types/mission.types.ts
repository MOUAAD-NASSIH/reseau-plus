/**
 * Mission Types
 */

export type MissionStatus = 'OPEN' | 'ONGOING' | 'CLOSED' | 'CANCELLED';
export type Urgency = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Mission entity
 */
export interface Mission {
    id: number;
    institutionId: number;
    title: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
    requiredSpecialityId?: number | null;
    location?: string | null;
    budget?: number | null;
    urgency: Urgency;
    status: MissionStatus;
    createdAt: Date;
}

/**
 * Mission domain association
 */
export interface MissionDomain {
    id: number;
    missionId: number;
    domainId: number;
    isRequired: boolean;
    createdAt: Date;
}

/**
 * Mission creation input
 */
export interface CreateMissionInput {
    title: string;
    description?: string;
    startDate: Date | string;
    endDate: Date | string;
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
    startDate?: Date | string;
    endDate?: Date | string;
    requiredSpecialityId?: number | null;
    location?: string | null;
    budget?: number | null;
    urgency?: Urgency;
    status?: MissionStatus;
    domainIds?: number[];
}

/**
 * Mission filter options
 */
export interface MissionFilters {
    status?: MissionStatus;
    specialityId?: number;
    domainId?: number;
    urgency?: Urgency;
    startDateFrom?: Date | string;
    startDateTo?: Date | string;
    endDateFrom?: Date | string;
    endDateTo?: Date | string;
    institutionId?: number;
    location?: string;
    minBudget?: number;
    maxBudget?: number;
}

/**
 * Speciality entity
 */
export interface Speciality {
    id: number;
    name: string;
    description?: string | null;
}

/**
 * Domain entity
 */
export interface Domain {
    id: number;
    name: string;
    description?: string | null;
}
