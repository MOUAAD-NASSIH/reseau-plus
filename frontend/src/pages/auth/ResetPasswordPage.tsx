import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/validation/authSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { authService } from "@/features/services/authServices";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = form;

  async function onSubmit(data: ResetPasswordSchema) {
    if (!token) {
      showErrorToast(null, "Invalid or missing reset token.");
      return;
    }

    try {
      // Only send password, not confirmPassword
      const { password } = data;

      await authService.resetPassword(token, { password });

      showSuccessToast(
        "Password updated 🔐",
        "You can now sign in with your new password."
      );

      // Redirect to login after successful reset
      navigate("/login");
    } catch (error) {
      showErrorToast(error, "Password reset failed. Please try again.");
    }
  }

  // Show error if no token is present
  if (!token) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold tracking-tight">Invalid Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            to="/forgot-password"
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-tight">Reset Password</h1>
        <p className="text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="h-12 pl-11 pr-11"
              placeholder="Enter new password"
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              className="h-12 pl-11 pr-11"
              placeholder="Confirm new password"
              aria-invalid={!!errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>

      {/* Footer */}
      <div className="flex justify-center">
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}

