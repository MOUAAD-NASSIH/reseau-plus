import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/validation/authSchema";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/ui/password-strength";
import { showErrorToast } from "@/lib/toast";
import { useResetPasswordMutation } from "@/features/api/endpoints/authEndpoints";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const reduceMotion = shouldReduceMotion();

  const [resetPassword] = useResetPasswordMutation();

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
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const passwordValue = watch("password");

  async function onSubmit(data: ResetPasswordSchema) {
    if (!token) {
      showErrorToast(null, t("AUTH.RESET_PASSWORD_PAGE.INVALID_LINK_TITLE"));
      return;
    }

    try {
      const { password } = data;
      await resetPassword({ token, password }).unwrap();
      setIsSuccess(true);
    } catch (error) {
      showErrorToast(error, t("COMMON.UNEXPECTED_ERROR"));
    }
  }

  // Invalid token state
  if (!token) {
    return (
      <AuthLayout
        title={t("AUTH.RESET_PASSWORD_PAGE.INVALID_LINK_TITLE")}
        subtitle={t("AUTH.RESET_PASSWORD_PAGE.INVALID_LINK_SUBTITLE")}
        brandingTitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_TITLE")}
        brandingSubtitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_SUBTITLE")}
      >
        <motion.div
          className="space-y-6"
          variants={reduceMotion ? {} : staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Error Icon */}
          <motion.div
            className="flex justify-center"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-500"
              initial={reduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <AlertCircle className="w-10 h-10 text-destructive" />
            </motion.div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            className="text-center space-y-2"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <p className="text-muted-foreground">
              {t("AUTH.RESET_PASSWORD_PAGE.INVALID_LINK_MESSAGE")}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-4"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <AnimatedButton
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={() => navigate("/forgot-password")}
            >
              {t("AUTH.RESET_PASSWORD_PAGE.REQUEST_NEW_LINK")}
            </AnimatedButton>

            <div className="flex justify-center">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors min-h-[44px] py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("AUTH.FORGOT_PASSWORD_PAGE.BACK_TO_LOGIN")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  // Success state with visual confirmation
  if (isSuccess) {
    return (
      <AuthLayout
        title={t("AUTH.RESET_PASSWORD_PAGE.SUCCESS_TITLE")}
        subtitle={t("AUTH.RESET_PASSWORD_PAGE.SUCCESS_SUBTITLE")}
        brandingTitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_TITLE")}
        brandingSubtitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_SUBTITLE")}
      >
        <motion.div
          className="space-y-6"
          variants={reduceMotion ? {} : staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Success Icon */}
          <motion.div
            className="flex justify-center"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500"
              initial={reduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="text-center space-y-2"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <p className="text-muted-foreground">
              {t("AUTH.RESET_PASSWORD_PAGE.SUCCESS_MESSAGE")}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-4"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <AnimatedButton
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={() => navigate("/login")}
            >
              {t("AUTH.RESET_PASSWORD_PAGE.SIGN_IN")}
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  // Password reset form
  return (
    <AuthLayout
      title={t("AUTH.RESET_PASSWORD_PAGE.TITLE")}
      subtitle={t("AUTH.RESET_PASSWORD_PAGE.SUBTITLE")}
      brandingTitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_TITLE")}
      brandingSubtitle={t("AUTH.RESET_PASSWORD_PAGE.BRANDING_SUBTITLE")}
    >
      <motion.div
        variants={reduceMotion ? {} : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password */}
          <motion.div className="space-y-2" variants={reduceMotion ? {} : fadeUpItem}>
            <Label htmlFor="password" className="mb-2 block text-sm font-medium">
              {t("AUTH.RESET_PASSWORD_PAGE.NEW_PASSWORD_LABEL")}
            </Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`h-11 pl-10 pr-10 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 ${errors.password
                  ? "border-destructive focus-visible:ring-destructive"
                  : "focus-visible:ring-primary/20"
                  }`}
                placeholder={t("AUTH.RESET_PASSWORD_PAGE.NEW_PASSWORD_PLACEHOLDER")}
                {...register("password")}
              />
              <Lock className={`absolute left-3 top-3 h-5 w-5 transition-colors ${errors.password ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-background/50"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium mt-1 text-destructive animate-in slide-in-from-top-1 fade-in-0">
                {errors.password.message}
              </p>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div className="space-y-2" variants={reduceMotion ? {} : fadeUpItem}>
            <Label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
              {t("AUTH.RESET_PASSWORD_PAGE.CONFIRM_PASSWORD_LABEL")}
            </Label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`h-11 pl-10 pr-10 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 ${errors.confirmPassword
                  ? "border-destructive focus-visible:ring-destructive"
                  : "focus-visible:ring-primary/20"
                  }`}
                placeholder={t("AUTH.RESET_PASSWORD_PAGE.CONFIRM_PASSWORD_PLACEHOLDER")}
                {...register("confirmPassword")}
              />
              <Lock className={`absolute left-3 top-3 h-5 w-5 transition-colors ${errors.confirmPassword ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-background/50"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium mt-1 text-destructive animate-in slide-in-from-top-1 fade-in-0">
                {errors.confirmPassword.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            <div className="pt-2">
              <PasswordStrength password={passwordValue || ""} />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={reduceMotion ? {} : fadeUpItem}>
            <AnimatedButton
              type="submit"
              size="lg"
              className="w-full font-bold h-12 text-base shadow-primary/25"
              isLoading={isSubmitting}
            >
              {isSubmitting ? t("AUTH.RESET_PASSWORD_PAGE.UPDATING") : t("AUTH.RESET_PASSWORD_PAGE.UPDATE_PASSWORD")}
            </AnimatedButton>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          className="flex justify-center mt-6"
          variants={reduceMotion ? {} : fadeUpItem}
        >
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors min-h-[44px] py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("AUTH.FORGOT_PASSWORD_PAGE.BACK_TO_LOGIN")}
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
