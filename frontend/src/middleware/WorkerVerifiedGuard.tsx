import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";
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
    const user = useSelector((state: RootState) => state.auth.user);
    const hasToken = !!localStorage.getItem("auth_token");

    // Also check RTK Query data in case Redux state hasn't been updated yet
    const { data: currentUserData, isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
        skip: !hasToken,
    });

    // Use Redux user or RTK Query user
    const effectiveUser = user || currentUserData?.data?.user;

    // Show loading state while fetching user data (if we have a token but no user yet)
    if (hasToken && !effectiveUser && (isLoading || isFetching)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!effectiveUser) {
        return <>{children}</>;
    }

    const apiUser = effectiveUser as ApiWorkerUser;

    // Check if user is a worker with PENDING status
    if (apiUser.role === "worker" && apiUser.worker?.status === "PENDING") {
        return <Navigate to={fallbackPath} replace />;
    }

    // Allow access for verified workers or non-worker users
    return <>{children}</>;
}

