export type UserRole = "ADMIN" | "WORKER" | "INSTITUTION";

export interface Role {
  id: number;
  name: UserRole;
  description?: string;
}

// base user
export interface User {
  id: number;
  email: string;
  role: Role;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  created_at: string;
}

// Worker Profile
export interface Worker extends User {
  first_name: string;
  last_name: string;
  speciality: string;
  experience_years?: number;
  bio?: string;
  location?: string;
  is_approved: boolean;
}

// Institution Profile
export interface Institution extends User {
  institution_name: string;
  address: string;
}

// Admin Profile
export interface Admin extends User {}

// --------------------
// API REQUEST TYPES
// --------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterWorkerRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  bio?: string;
  speciality: string;
  experience_years: number;
  location: string;
}

export interface RegisterInstitutionRequest {
  email: string;
  password: string;
  institution_name: string;
  address: string;
}

// --------------------
// API RESPONSE TYPES
// --------------------

export interface AuthResponse {
  token: string;
  message: string;
  user: Worker | Institution | Admin;
}

// Unified type for the state
export type AuthenticatedUser = Worker | Institution | Admin;
