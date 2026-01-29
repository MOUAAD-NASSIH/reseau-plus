import { Navigate } from "react-router";
import type { UserRole } from "@/types/auth.types";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}



/**
 * Extracts the user role from the authenticated user object.
 */
function getUserRole(user: any): UserRole | null {
  if (!user) return null;
  // Handle both direct role string and nested role object
  if (typeof user.role === 'string') return user.role as UserRole;
  if (user.role?.name) return user.role.name as UserRole;
  return null;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallbackPath = "/",
}: RoleGuardProps) {
  const hasToken = !!localStorage.getItem("auth_token");

  // Get user data from RTK Query (single source of truth)
  const { data: currentUserData, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  const user = currentUserData?.data?.user;
  const userRole = getUserRole(user);

  // Show loading state while fetching user data (if we have a token but no role yet)
  // This prevents premature redirect to unauthorized page
  if (hasToken && !userRole && isLoading) {
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

