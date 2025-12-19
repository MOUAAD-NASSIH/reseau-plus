type roleType = 'worker' | 'institution' | 'admin';

export interface User {
    id?: number;
    email: string;
    password: string;
    role: roleType;
    createdAt?: Date;
}

export interface Worker extends User {
    id?: number;
    userId: number;
    firstName: string;
    lastName: string;
    speciality: string;
    experienceYears: number;
    bio?: string;
    location?: string;
    isApproved?: boolean;
    createdAt?: Date;
}

export interface Institution extends User {
    id?: number;
    userId: number;
    institutionName: string;
    address: string;
    createdAt?: Date;
}

export type AuthUser = User | Worker | Institution;