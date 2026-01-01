/**
 * Institution Types
 */

/**
 * Institution profile entity
 */
export interface Institution {
    id: number;
    userId: number;
    institutionName: string;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: Date;
}

/**
 * Institution creation input
 */
export interface CreateInstitutionInput {
    userId: number;
    institutionName: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}

/**
 * Institution update input
 */
export interface UpdateInstitutionInput {
    institutionName?: string;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * Institution filter options
 */
export interface InstitutionFilters {
    city?: string;
    search?: string;
}
