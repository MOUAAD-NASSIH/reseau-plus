import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

import {
  institutionAccountSchema,
  type InstitutionAccountForm,
} from "../institutionRegister.schema";
import { useInstitutionRegisterStore } from "../institutionRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepAccount() {
  const { data, updateData } = useInstitutionRegisterStore();
  const reduceMotion = shouldReduceMotion();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<InstitutionAccountForm>({
    resolver: zodResolver(institutionAccountSchema),
    mode: "onChange",
    defaultValues: {
      email: data.email ?? "",
      password: data.password ?? "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  useEffect(() => {
    // Simple password strength calc
    let score = 0;
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    setPasswordStrength(score);
  }, [passwordValue]);

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  const strengthColor = [
    "bg-muted",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl font-semibold mb-2">{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.TITLE')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.SUBTITLE')}
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="space-y-6"
        variants={reduceMotion ? {} : fadeUpItem}
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" required>{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.EMAIL_LABEL')}</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Input
              id="email"
              placeholder={t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.EMAIL_PLACEHOLDER')}
              type="email"
              className={cn(
                "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                form.formState.errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
          ) : (
            <p className="text-[0.8rem] text-muted-foreground">{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.EMAIL_HELPER')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" required>{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.PASSWORD_LABEL')}</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <Input
                id="password"
                placeholder={t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.PASSWORD_PLACEHOLDER')}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "h-11 pl-9 pr-10 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                  form.formState.errors.password && "border-destructive focus-visible:ring-destructive"
                )}
                {...form.register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" required>{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.CONFIRM_PASSWORD_LABEL')}</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <Input
                id="confirmPassword"
                placeholder={t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.CONFIRM_PASSWORD_PLACEHOLDER')}
                type={showConfirmPassword ? "text" : "password"}
                className={cn(
                  "h-11 pl-9 pr-10 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                  form.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Password Strength */}
        {passwordValue && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-muted-foreground uppercase tracking-wider">{t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.PASSWORD_STRENGTH')}</span>
              <span className={cn("font-bold", strengthColor[passwordStrength].replace("bg-", "text-"))}>
                {t(`AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.STRENGTH_${strengthLabel[passwordStrength].toUpperCase()}`)}
              </span>
            </div>
            <div className="flex gap-1 h-1.5 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors duration-300",
                    i <= passwordStrength ? strengthColor[passwordStrength] : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                {passwordValue.length >= 8 ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                {t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.REQUIREMENT_LENGTH')}
              </div>
              <div className="flex items-center gap-2">
                {/[A-Z]/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                {t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.REQUIREMENT_UPPERCASE')}
              </div>
              <div className="flex items-center gap-2">
                {/[0-9]/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                {t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.REQUIREMENT_NUMBER')}
              </div>
              <div className="flex items-center gap-2">
                {/[^A-Za-z0-9]/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                {t('AUTH.REGISTER_INSTITUTION.STEP_ACCOUNT.REQUIREMENT_SPECIAL')}
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}

