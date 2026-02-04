/**
 * Review Types
 * Frontend types mirroring backend review models
 */

import type { User } from './auth.types';
import type { MissionAssignment } from './assignment.types';

// ENTITY INTERFACES


/**
 * Review entity
 */
export interface Review {
    id: number;
    missionAssignmentId: number;
    reviewerId: number;
    revieweeId: number;
    rating: number;
    comment?: string | null;
    createdAt: string;
    // Relations
    reviewer?: User;
    reviewee?: User;
    missionAssignment?: MissionAssignment;
}

// INPUT INTERFACES


/**
 * Review creation input
 * Note: revieweeId is determined automatically by the backend based on the assignment
 */
export interface CreateReviewInput {
    missionAssignmentId: number;
    rating: number;
    comment?: string;
}

// FILTER INTERFACES


/**
 * Review filter options
 */
export interface ReviewFilters {
    missionAssignmentId?: number;
    reviewerId?: number;
    revieweeId?: number;
    minRating?: number;
    maxRating?: number;
    page?: number;
    limit?: number;
}

// AGGREGATE INTERFACES


/**
 * Average rating result
 */
export interface AverageRating {
    userId: number;
    averageRating: number;
    totalReviews: number;
}

// CONSTANTS


export const RATING_MIN = 1;
export const RATING_MAX = 5;

