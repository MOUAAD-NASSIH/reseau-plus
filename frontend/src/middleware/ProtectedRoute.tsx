import { Navigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { RootState, AppDispatch } from "@/features/store";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { setUser, clearAuth } from "@/features/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if token exists
  const hasToken = !!localStorage.getItem("auth_token");

  // Use RTK Query to fetch current user if we have a token
  const { data, isLoading, isError, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  // Update auth state when user data is fetched
  useEffect(() => {
    if (data?.data?.user) {
      // Dispatch action to update auth state with user data
      dispatch(setUser(data.data.user));
    }
  }, [data, dispatch]);

  // Clear auth state on error
  useEffect(() => {
    if (isError && hasToken) {
      dispatch(clearAuth());
      localStorage.removeItem("auth_token");
    }
  }, [isError, hasToken, dispatch]);

  // Show loading state during initial validation
  if (hasToken && (isLoading || (isFetching && !user))) {
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

  // Wait for user data to be available (either from Redux or RTK Query)
  if (!isAuthenticated && !data?.data?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

