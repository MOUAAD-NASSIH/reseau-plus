import { Navigate, useLocation } from "react-router";
import type { UserRole } from "@/types/auth.types";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

interface GuestGuardProps {
    children: React.ReactNode;
}

/**
 * API response structure from /auth/me endpoint:
 * - Workers: { userId, email, role: 'worker', workerId, worker: {...} }
 * - Institutions: { userId, email, role: 'institution', institutionId, institution: {...} }
 * - Admins: { userId, email, role: 'admin' }
 */
interface ApiUser {
    userId?: number;
    email?: string;
    role?: UserRole | { name: UserRole };
    workerId?: number;
    institutionId?: number;
    worker?: object;
    institution?: object;
    user?: { role?: { name: UserRole } };
}

/**
 * Extracts the user role from the authenticated user object.
 */
function getUserRole(user: ApiUser | null | undefined): UserRole | null {
    if (!user) return null;

    if (typeof user.role === "string") {
        return user.role as UserRole;
    }

    if (user.role && typeof user.role === "object" && "name" in user.role) {
        return user.role.name;
    }

    if (user.user?.role?.name) {
        return user.user.role.name;
    }

    return null;
}

/**
 * Gets the default dashboard path based on user role.
 */
function getDashboardPath(role: UserRole | null): string {
    switch (role) {
        case "worker":
            return "/worker";
        case "institution":
            return "/institution";
        case "admin":
            return "/admin";
        default:
            return "/";
    }
}

/**
 * Guard that prevents authenticated users from accessing guest-only pages (login, register).
 * Redirects authenticated users to their appropriate dashboard.
 */
export default function GuestGuard({ children }: GuestGuardProps) {
    const location = useLocation();

    // Check if token exists
    const hasToken = !!localStorage.getItem("auth_token");

    // Use RTK Query to fetch current user if we have a token
    const { data, isLoading } = useGetCurrentUserQuery(undefined, {
        skip: !hasToken,
    });

    const user = data?.data?.user;

    // Show loading state during validation
    if (hasToken && isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Check if we have a redirect location from ProtectedRoute
    const from = (location.state as { from?: Location })?.from;

    // If user is authenticated, redirect to their dashboard or the original location
    if (user) {
        const userRole = getUserRole(user);
        // If we have a saved location, redirect there (unless it's the login page)
        if (from && from.pathname !== "/login") {
            return <Navigate to={from.pathname} replace />;
        }
        const dashboardPath = getDashboardPath(userRole);
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>;
}

