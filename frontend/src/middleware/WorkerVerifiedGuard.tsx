import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import type { WorkerStatus } from "@/types/auth.types";

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
    // Legacy structure support
    status?: WorkerStatus;
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

    if (!user) {
        return <>{children}</>;
    }

    const apiUser = user as ApiWorkerUser;

    // Check if user is a worker
    const isWorkerRole = apiUser.role === "worker";

    if (isWorkerRole) {
        // Get worker status from nested worker object (API response format)
        const workerStatus = apiUser.worker?.status || apiUser.status;

        if (workerStatus === "PENDING") {
            return <Navigate to={fallbackPath} replace />;
        }
    }

    // Allow access for verified workers or non-worker users
    return <>{children}</>;
}
