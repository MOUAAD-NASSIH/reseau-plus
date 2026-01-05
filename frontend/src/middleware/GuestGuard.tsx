import { Navigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState, AppDispatch } from "@/features/store";
import type { UserRole } from "@/types/auth.types";
import { getMe } from "@/features/slices/authSlice";

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
    const { isAuthenticated, user, isLoading } = useSelector(
        (state: RootState) => state.auth
    );
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                setIsValidating(false);
                return;
            }

            // If we have a token but no user, validate with getMe
            if (!user) {
                try {
                    await dispatch(getMe()).unwrap();
                } catch {
                    // Token is invalid, allow access to guest pages
                }
            }

            setIsValidating(false);
        };

        validateAuth();
    }, [dispatch, user]);

    // Show loading state during validation
    if (isValidating || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user) {
        const userRole = getUserRole(user);
        const dashboardPath = getDashboardPath(userRole);
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>;
}
