import type { Notification } from "@/types/notification.types";

/**
 * Get the redirect URL based on notification type, user role, and entity metadata.
 * Provides deep linking to specific resources when possible.
 */
export const getNotificationRedirectUrl = (notification: Notification, role: string): string | null => {
    const { type, entityId, entityType } = notification;

    // Helper for assignment URLs
    const getAssignmentUrl = (id?: number) => {
        if (!id) return role === "worker" ? "/worker/assignments" : "/institution/assignments";
        return role === "worker" ? `/worker/assignments/${id}` : `/institution/assignments/${id}`;
    };

    switch (type) {
        // --- Assignment Related ---
        case "ASSIGNMENT_CREATED":
        case "ASSIGNMENT_ACTIVE":
        case "ASSIGNMENT_ONGOING":
        case "ASSIGNMENT_COMPLETED":
        case "ASSIGNMENT_CANCELLED":
        case "APPLICATION_ACCEPTED": // Turns into an assignment
            // If entityType is explicit 'ASSIGNMENT' or default ID usage
            return getAssignmentUrl(entityId);

        // --- Application Related ---
        case "APPLICATION_SUBMITTED":
            if (role === "institution") {
                // If we have entityId as APPLICATION ID, ideally go to application details
                // Or if it's MISSION ID, go to mission applications
                // Currently applicationService sends APPLICATION entityType
                if (entityType === 'APPLICATION' && entityId) {
                    // We don't have a direct "application details" page for institutions usually, 
                    // they view it in context of mission. 
                    // But assuming we might want to go to mission applications
                    // For now, let's keep generic or mission-based if we can derive mission ID.
                    // The notification service sends application.id.
                    // The frontend might not know mission ID from just application ID without query.
                    // Let's fallback to missions list or specific route if it exists.
                    return "/institution/missions";
                }
                return "/institution/missions";
            }
            return "/worker/applications";

        case "APPLICATION_REJECTED":
            // For worker: go to applications list vs specific mission?
            // Notification sends MISSION entity type and mission ID.
            if (role === "worker") {
                // Could link to mission details to see status, or applications list
                return "/worker/applications";
            }
            return null;

        // --- Payment Related ---
        case "PAYMENT_RECEIVED":
            if (role === "worker") {
                // If linked to assignment, go to assignment details
                if (entityType === 'ASSIGNMENT' && entityId) {
                    return getAssignmentUrl(entityId);
                }
                return "/worker/assignments";
            }
            return "/institution/payments";

        case "PAYMENT_FAILED":
        case "PAYMENT_COMPLETED": // Institution side
            if (role === "institution") {
                if (entityType === 'ASSIGNMENT' && entityId) {
                    return getAssignmentUrl(entityId);
                }
                return "/institution/payments/history";
            }
            return null;

        // --- Review Related ---
        case "REVIEW_RECEIVED":
            if (role === "worker") {
                // Could highlight specific review if we had a query param, but reviews list is fine
                return "/worker/reviews";
            }
            return "/institution/reviews";

        // --- Document/Verification Related ---
        case "WORKER_VERIFIED":
        case "WORKER_REJECTED":
            return role === "worker" ? "/worker/profile" : null;

        case "DOCUMENT_APPROVED":
        case "DOCUMENT_REJECTED":
            return role === "worker" ? "/worker/documents" : null;

        default:
            return null;
    }
};
