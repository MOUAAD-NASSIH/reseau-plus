type roleType = 'worker' | 'institution' | 'admin';

export interface User {
    id?: number;
    email: string;
    password: string;
    role: roleType;
    status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    createdAt?: Date;
}

export interface Worker {
    id?: number;
    userId: number;
    firstName: string;
    lastName: string;
    specialityId?: number | null;
    experienceYears?: number | null;
    bio?: string | null;
    city?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string | null;
    birthDate?: Date | null;
    gender?: string | null;
    createdAt?: Date;
}

export interface Institution {
    id?: number;
    userId: number;
    institutionName: string;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    createdAt?: Date;
}

export type AuthUser = User | Worker | Institution;