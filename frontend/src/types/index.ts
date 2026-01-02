/**
 * Types Barrel Export
 * Single entry point for all frontend types
 */

// API Types
export type { ApiResponse, PaginationMeta, ValidationError, ErrorResponse } from './api.types';

// Auth Types
export type {
    UserRole,
    UserStatus,
    WorkerStatus,
    DocumentStatus,
    Role,
    User,
    Worker,
    Institution,
    Admin,
    Speciality,
    Domain,
    WorkerDocument,
    WorkerExperience,
    WorkerDomain,
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    WorkerExperienceInput,
    AuthResponse,
    MeResponse,
    AuthenticatedUser,
    DocumentType,
    UpdateWorkerInput,
    WorkerFilters,
    DocumentUploadInput,
    UpdateInstitutionInput,
    InstitutionFilters,
} from './auth.types';

export { isWorker, isInstitution, isAdmin } from './auth.types';

// Mission Types
export type { MissionStatus, Urgency, Mission, MissionDomain, CreateMissionInput, UpdateMissionInput, MissionFilters } from './mission.types';

// Application Types
export type { ApplicationStatus, MissionApplication, CreateApplicationInput, ApplicationFilters } from './application.types';

// Assignment Types
export type { AssignmentStatus, MissionAssignment, CreateAssignmentInput, UpdateAssignmentStatusInput, AssignmentFilters } from './assignment.types';

// Payment Types
export type { PaymentStatus, Payment, CreatePaymentIntentInput, PaymentFeeCalculation, PaymentFilters } from './payment.types';

// Review Types
export type { Review, CreateReviewInput, ReviewFilters, AverageRating } from './review.types';
export { RATING_MIN, RATING_MAX } from './review.types';

// Notification Types
export type { NotificationType, Notification, NotificationFilters } from './notification.types';

// Domain & Speciality Filters (from auth.types)
export type { DomainFilters, SpecialityFilters } from './auth.types';
