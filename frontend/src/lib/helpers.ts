import type { RegisterWorkerRequest, WorkerExperienceInput } from '@/types/auth.types';

/**
 * Helper to convert RegisterWorkerRequest to FormData for file uploads
 */
export function createWorkerRegistrationFormData(
    data: RegisterWorkerRequest,
    files?: File[]
): FormData {
    const formData = new FormData();

    // Add basic fields
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);

    // Add optional fields
    if (data.specialityId !== undefined) {
        formData.append('specialityId', data.specialityId.toString());
    }
    if (data.experienceYears !== undefined) {
        formData.append('experienceYears', data.experienceYears.toString());
    }
    if (data.bio) formData.append('bio', data.bio);
    if (data.city) formData.append('city', data.city);
    if (data.zipCode) formData.append('zipCode', data.zipCode);
    if (data.latitude !== undefined) {
        formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== undefined) {
        formData.append('longitude', data.longitude.toString());
    }
    if (data.birthDate) formData.append('birthDate', data.birthDate);
    if (data.gender) formData.append('gender', data.gender);

    // Add domain IDs as JSON string
    if (data.domainIds && data.domainIds.length > 0) {
        formData.append('domainIds', JSON.stringify(data.domainIds));
    }
    // Add experiences as JSON string
    if (data.experiences && data.experiences.length > 0) {
        formData.append('experiences', JSON.stringify(data.experiences));
    }
    // Add files with naming convention: document_TYPE
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            formData.append(`document_${index}`, file);
        });
    }
    return formData;
}

/**
 * Helper to create a worker experience object
 */
export function createWorkerExperience(
    jobTitle: string,
    organization: string,
    startDate: Date,
    endDate?: Date | null,
    description?: string
): WorkerExperienceInput {
    return {
        jobTitle,
        organization,
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        description: description || undefined,
    };
}

/**
 * Helper to format date for API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Helper to parse date from API (handles both Date and Timestamptz)
 */
export function parseDateFromAPI(dateString: string): Date {
    return new Date(dateString);
}

