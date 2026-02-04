/**
 * Assignment Types
 * Frontend types mirroring backend assignment models
 */

import type { Worker, Institution } from './auth.types';
import type { Mission } from './mission.types';
import type { Review } from './review.types';
import type { Payment } from './payment.types';

// ENUMS / STATUS TYPES


export type AssignmentStatus = 'ACTIVE' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

// ENTITY INTERFACES


/**
 * Mission assignment entity
 */
export interface MissionAssignment {
    id: number;
    missionId: number;
    workerId: number;
    institutionId: number;
    status: AssignmentStatus;
    assignedAt: string;
    // Relations
    mission?: Mission;
    worker?: Worker;
    institution?: Institution;
    reviews?: Review[];
    payments?: Payment[];
}

// INPUT INTERFACES


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

// FILTER INTERFACES


/**
 * Assignment filter options
 */
export interface AssignmentFilters {
    status?: AssignmentStatus;
    missionId?: number;
    workerId?: number;
    institutionId?: number;
    assignedAfter?: string;
    assignedBefore?: string;
    page?: number;
    limit?: number;
}

