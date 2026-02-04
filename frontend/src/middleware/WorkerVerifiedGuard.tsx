import { Navigate } from "react-router";
import type { WorkerStatus } from "@/types/auth.types";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

interface WorkerVerifiedGuardProps {
    children: React.ReactNode;
    fallbackPath?: string;
}

/**
 * API response structure for workers from /auth/me endpoint:
 * { userId, email, role: 'worker', workerId, worker: { id, firstName, lastName, status, ... } }
 */
interface ApiWorkerUser {
    role?: string;
    worker?: {
        status?: WorkerStatus;
    };
}

/**
 * Guard that restricts access for workers with PENDING status.
 * PENDING workers are redirected to the pending approval page.
 * VERIFIED workers can proceed.
 * Non-worker users pass through (they should be handled by RoleGuard).
 */
export default function WorkerVerifiedGuard({
    children,
    fallbackPath = "/worker/pending-approval",
}: WorkerVerifiedGuardProps) {
    const hasToken = !!localStorage.getItem("auth_token");

    // Get user data from RTK Query
    const { data: currentUserData, isLoading } = useGetCurrentUserQuery(undefined, {
        skip: !hasToken,
    });

    const user = currentUserData?.data?.user;

    // Show loading state while fetching user data (if we have a token but no user yet)
    if (hasToken && !user && isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return <>{children}</>;
    }

    const apiUser = user as ApiWorkerUser;

    // Check if user is a worker with PENDING status
    if (apiUser.role === "worker" && apiUser.worker?.status === "PENDING") {
        return <Navigate to={fallbackPath} replace />;
    }

    // Allow access for verified workers or non-worker users
    return <>{children}</>;
}

