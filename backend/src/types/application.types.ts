/**
 * Application Types
 */

export type ApplicationStatus = 'SUBMITTED' | 'REJECTED' | 'ACCEPTED';

/**
 * Mission application entity
 */
export interface MissionApplication {
    id: number;
    missionId: number;
    workerId: number;
    status: ApplicationStatus;
    appliedAt: Date;
}

/**
 * Application creation input
 */
export interface CreateApplicationInput {
    missionId: number;
}

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

/**
 * Application with related data
 */
export interface ApplicationWithDetails extends MissionApplication {
    worker?: import('./worker.types').Worker;
    mission?: import('./mission.types').Mission;
}
