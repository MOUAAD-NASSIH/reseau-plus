import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { UserRole } from "@/types/auth.types";
import type { RootState } from "@/features/store";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackPath?: string;
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
  // Legacy structure support
  user?: { role?: { name: UserRole } };
}

/**
 * Extracts the user role from the authenticated user object.
 * Handles both API response format (role as string) and legacy format (role as object).
 */
function getUserRole(user: RootState["auth"]["user"]): UserRole | null {
  if (!user) return null;

  const apiUser = user as ApiUser;

  // Handle API response format where role is a string directly
  if (typeof apiUser.role === "string") {
    return apiUser.role as UserRole;
  }

  // Handle format where role is an object with name property
  if (apiUser.role && typeof apiUser.role === "object" && "name" in apiUser.role) {
    return apiUser.role.name;
  }

  // Handle legacy nested user.role.name structure
  if (apiUser.user?.role?.name) {
    return apiUser.user.role.name;
  }

  return null;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallbackPath = "/",
}: RoleGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const hasToken = !!localStorage.getItem("auth_token");

  // Also check RTK Query data in case Redux state hasn't been updated yet
  const { data: currentUserData, isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  // Try to get role from Redux state first, then from RTK Query data
  let userRole = getUserRole(user);

  // If no role from Redux, try RTK Query data
  if (!userRole && currentUserData?.data?.user) {
    userRole = getUserRole(currentUserData.data.user);
  }

  // Show loading state while fetching user data (if we have a token but no role yet)
  // This prevents premature redirect to unauthorized page
  if (hasToken && !userRole && (isLoading || isFetching)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Check if user's role is in the allowed roles array
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

