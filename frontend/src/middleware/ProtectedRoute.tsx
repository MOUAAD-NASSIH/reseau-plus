import { Navigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState, AppDispatch } from "@/features/store";
import { getMe } from "@/features/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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
          // Token is invalid, will redirect to login
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
