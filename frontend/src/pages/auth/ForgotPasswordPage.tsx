import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/features/validation/authSchema";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showErrorToast } from "@/lib/toast";
import { authService } from "@/features/services/authServices";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const reduceMotion = shouldReduceMotion();

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
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      showErrorToast(error, t("COMMON.UNEXPECTED_ERROR"));
    }
  }

  // Success state with visual confirmation
  if (isSuccess) {
    return (
      <AuthLayout
        title={t("AUTH.FORGOT_PASSWORD_PAGE.SUCCESS_TITLE")}
        subtitle={t("AUTH.FORGOT_PASSWORD_PAGE.SUCCESS_SUBTITLE")}
        brandingTitle={t("AUTH.FORGOT_PASSWORD_PAGE.BRANDING_TITLE")}
        brandingSubtitle={t("AUTH.FORGOT_PASSWORD_PAGE.BRANDING_SUBTITLE")}
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
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-500"
              initial={reduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="text-center space-y-2"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <p className="text-muted-foreground">
              <Trans
                i18nKey="AUTH.FORGOT_PASSWORD_PAGE.SUCCESS_MESSAGE"
                values={{ email: submittedEmail }}
                components={{ 1: <span className="font-medium text-foreground" /> }}
              />
            </p>
            <p className="text-sm text-muted-foreground">
              {t("AUTH.FORGOT_PASSWORD_PAGE.SPAM_NOTE")}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-4"
            variants={reduceMotion ? {} : fadeUpItem}
          >
            <AnimatedButton
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                setSubmittedEmail("");
                form.reset();
              }}
            >
              {t("AUTH.FORGOT_PASSWORD_PAGE.TRY_DIFFERENT_EMAIL")}
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

  return (
    <AuthLayout
      title={t("AUTH.FORGOT_PASSWORD_PAGE.TITLE")}
      subtitle={t("AUTH.FORGOT_PASSWORD_PAGE.SUBTITLE")}
      brandingTitle={t("AUTH.FORGOT_PASSWORD_PAGE.BRANDING_TITLE")}
      brandingSubtitle={t("AUTH.FORGOT_PASSWORD_PAGE.BRANDING_SUBTITLE")}
    >
      <motion.div
        variants={reduceMotion ? {} : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <motion.div variants={reduceMotion ? {} : fadeUpItem}>
            <Label htmlFor="email" className="mb-2 block text-sm font-medium">
              {t("AUTH.FORGOT_PASSWORD_PAGE.EMAIL_LABEL")}
            </Label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                className={`h-11 pl-10 pr-4 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 ${errors.email
                  ? "border-destructive focus-visible:ring-destructive"
                  : "focus-visible:ring-primary/20"
                  }`}
                placeholder={t("AUTH.FORGOT_PASSWORD_PAGE.EMAIL_PLACEHOLDER")}
                {...register("email")}
              />
              <Mail className={`absolute left-3 top-3 h-5 w-5 transition-colors ${errors.email ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`} />
            </div>
            {errors.email && (
              <p className="text-xs font-medium mt-1 text-destructive animate-in slide-in-from-top-1 fade-in-0">
                {errors.email.message}
              </p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={reduceMotion ? {} : fadeUpItem}>
            <AnimatedButton
              type="submit"
              size="lg"
              className="w-full font-bold h-12 text-base shadow-primary/25"
              isLoading={isSubmitting}
            >
              {isSubmitting ? t("AUTH.FORGOT_PASSWORD_PAGE.SENDING") : t("AUTH.FORGOT_PASSWORD_PAGE.SEND_LINK")}
            </AnimatedButton>
          </motion.div>
        </form>

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
