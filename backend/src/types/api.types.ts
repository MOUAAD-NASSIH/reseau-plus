/**
 * API Response Types
 */

/**
 * Standard API response wrapper
 * All API responses follow this structure for consistency
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: PaginationMeta;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Validation error detail
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: ValidationError[];
}

/**
 * Paginated query parameters
 */
// export interface PaginationParams {
//     page?: number;
//     limit?: number;
// }

/**
 * Date range filter
 */
// export interface DateRangeFilter {
//     startDate?: Date | string;
//     endDate?: Date | string;
// }

/**
 * Sort options
 */
// export interface SortOptions {
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
// }
