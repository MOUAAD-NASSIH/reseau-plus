/**
 * Review Types
 */

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
    createdAt: Date;
}

/**
 * Review creation input
 */
export interface CreateReviewInput {
    missionAssignmentId: number;
    revieweeId: number;
    rating: number;
    comment?: string;
}

/**
 * Review filter options
 */
export interface ReviewFilters {
    missionAssignmentId?: number;
    reviewerId?: number;
    revieweeId?: number;
    minRating?: number;
    maxRating?: number;
}

/**
 * Review with related data
 */
export interface ReviewWithDetails extends Review {
    reviewer?: import('./user.types').User;
    reviewee?: import('./user.types').User;
    missionAssignment?: import('./assignment.types').MissionAssignment;
}

/**
 * Average rating result
 */
export interface AverageRating {
    userId: number;
    averageRating: number;
    totalReviews: number;
}

/**
 * Rating bounds (1-5)
 */
export const RATING_MIN = 1;
export const RATING_MAX = 5;
