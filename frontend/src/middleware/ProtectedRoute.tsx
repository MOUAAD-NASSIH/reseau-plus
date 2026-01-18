import { Navigate, useLocation } from "react-router";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // Check if token exists
  const hasToken = !!localStorage.getItem("auth_token");

  // Use RTK Query as single source of truth for user data
  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  // Show loading state during initial validation
  if (hasToken && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if no token or error fetching user
  if (!hasToken || isError) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for user data to be available
  if (!data?.data?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

