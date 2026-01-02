/**
 * Shared API Response Types
 * These types mirror the backend API structure for consistent data handling
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
 * Validation error detail for form validation errors
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Error response structure for API errors
 */
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: ValidationError[];
}
