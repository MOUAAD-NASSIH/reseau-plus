/**
 * Assignment Types
 */

export type AssignmentStatus = 'ACTIVE' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

/**
 * Mission assignment entity
 */
export interface MissionAssignment {
    id: number;
    missionId: number;
    workerId: number;
    institutionId: number;
    status: AssignmentStatus;
    assignedAt: Date;
}

/**
 * Assignment creation input
 */
export interface CreateAssignmentInput {
    missionId: number;
    workerId: number;
    institutionId: number;
}

/**
 * Assignment status update input
 */
export interface UpdateAssignmentStatusInput {
    status: AssignmentStatus;
}

/**
 * Assignment filter options
 */
export interface AssignmentFilters {
    status?: AssignmentStatus;
    missionId?: number;
    workerId?: number;
    institutionId?: number;
    assignedAfter?: Date | string;
    assignedBefore?: Date | string;
}

/**
 * Assignment with related data
 */
export interface AssignmentWithDetails extends MissionAssignment {
    worker?: import('./worker.types').Worker;
    mission?: import('./mission.types').Mission;
    institution?: import('./institution.types').Institution;
}
