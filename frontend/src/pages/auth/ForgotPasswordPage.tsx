import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/features/validation/authSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { authService } from "@/features/services/authServices";

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = form;

  async function onSubmit(data: ForgotPasswordSchema) {
    try {
      await authService.forgotPassword(data);

      showSuccessToast(
        "Check your email 📩",
        "If an account exists, a reset link has been sent."
      );
    } catch (error) {
      showErrorToast(error, "Unable to send reset email. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-tight">
          Forgot Password
        </h1>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="h-12 pl-11"
              placeholder="name@institution.com"
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

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
