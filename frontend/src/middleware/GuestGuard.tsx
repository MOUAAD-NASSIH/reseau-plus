import { Navigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { RootState, AppDispatch } from "@/features/store";
import type { UserRole } from "@/types/auth.types";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { setUser } from "@/features/slices/authSlice";

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
function getUserRole(user: RootState["auth"]["user"]): UserRole | null {
    if (!user) return null;

    const apiUser = user as ApiUser;

    if (typeof apiUser.role === "string") {
        return apiUser.role as UserRole;
    }

    if (apiUser.role && typeof apiUser.role === "object" && "name" in apiUser.role) {
        return apiUser.role.name;
    }

    if (apiUser.user?.role?.name) {
        return apiUser.user.role.name;
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
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );

    // Check if token exists
    const hasToken = !!localStorage.getItem("auth_token");

    // Use RTK Query to fetch current user if we have a token
    const { data, isLoading } = useGetCurrentUserQuery(undefined, {
        skip: !hasToken,
    });

    // Update auth state when user data is fetched
    useEffect(() => {
        if (data?.data?.user) {
            // Dispatch action to update auth state with user data
            dispatch(setUser(data.data.user));
        }
    }, [data, dispatch]);

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
    if (isAuthenticated && user) {
        const userRole = getUserRole(user);
        // If we have a saved location, redirect there (unless it's the login page)
        if (from && from.pathname !== "/login") {
            return <Navigate to={from.pathname} replace />;
        }
        const dashboardPath = getDashboardPath(userRole);
        return <Navigate to={dashboardPath} replace />;
    }

    // Also check RTK Query data for authenticated user
    if (data?.data?.user) {
        const userRole = getUserRole(data.data.user);
        // If we have a saved location, redirect there (unless it's the login page)
        if (from && from.pathname !== "/login") {
            return <Navigate to={from.pathname} replace />;
        }
        const dashboardPath = getDashboardPath(userRole);
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>;
}

