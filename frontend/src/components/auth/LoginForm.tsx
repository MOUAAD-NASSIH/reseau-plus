import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { motion } from "framer-motion";

import {
    loginSchema,
    type LoginSchema,
} from "@/features/validation/authSchema";
import { useLoginMutation } from "@/features/api/endpoints/authEndpoints";
import { AnimatedButton } from "@/components/ui/animated-button";
import RegisterRoleDialog from "../common/RegisterRoleDialog";
import type { AxiosBaseQueryError } from "@/features/api/baseQuery";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
    const { t } = useTranslation();
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const reduceMotion = shouldReduceMotion();
    const [showPassword, setShowPassword] = useState(false);

    // Get the redirect location from state (if coming from ProtectedRoute)
    const from = (location.state as { from?: Location })?.from;

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = form;

    const onSubmit = async (data: LoginSchema) => {
        try {
            const response = await login(data).unwrap();
            localStorage.setItem("auth_token", response.data.token);
            if (from && from.pathname !== "/login") {
                navigate(from.pathname, { replace: true });
                return;
            }
            const role = response.data.user.role;
            if (role === "admin") navigate("/admin", { replace: true });
            else if (role === "institution") navigate("/institution", { replace: true });
            else if (role === "worker") navigate("/worker", { replace: true });
            else navigate("/", { replace: true });
        } catch (error) {
            const apiError = error as AxiosBaseQueryError;
            if (apiError.data?.details) {
                apiError.data.details.forEach(({ field, message }) => {
                    setError(field as keyof LoginSchema, { type: "server", message });
                });
            } else if (apiError.message) {
                setError("email", { type: "server", message: apiError.message });
            }
        }
    };

    const isLoading = isSubmitting || isLoginLoading;

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            variants={reduceMotion ? {} : staggerContainer}
            initial="initial"
            animate="animate"
        >
            {/* Email Field */}
            <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                <Label htmlFor="email" className="mb-2 block text-sm font-medium">
                    {t('AUTH.LOGIN.EMAIL_LABEL')}
                </Label>
                <div className="relative group">
                    <Input
                        id="email"
                        type="email"
                        className={`h-11 pl-10 pr-4 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 ${errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : "focus-visible:ring-primary/20"
                            }`}
                        placeholder={t('AUTH.LOGIN.EMAIL_PLACEHOLDER')}
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

            {/* Password Field */}
            <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        {t('AUTH.LOGIN.PASSWORD_LABEL')}
                    </Label>
                    <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        {t('AUTH.LOGIN.FORGOT_PASSWORD')}
                    </Link>
                </div>
                <div className="relative group">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`h-11 pl-10 pr-10 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 ${errors.password
                            ? "border-destructive focus-visible:ring-destructive"
                            : "focus-visible:ring-primary/20"
                            }`}
                        placeholder={t('AUTH.LOGIN.PASSWORD_PLACEHOLDER')}
                        {...register("password")}
                    />
                    <Lock className={`absolute left-3 top-3 h-5 w-5 transition-colors ${errors.password ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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

            {/* Submit Button */}
            <motion.div variants={reduceMotion ? {} : fadeUpItem} className="pt-2">
                <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold h-12 text-base shadow-primary/25"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading ? t('AUTH.LOGIN.SUBMITTING_BTN') : t('AUTH.LOGIN.SUBMIT_BTN')}
                </AnimatedButton>
            </motion.div>

            {/* Footer - Register Link */}
            <motion.div
                className="text-center text-sm"
                variants={reduceMotion ? {} : fadeUpItem}
            >
                <span className="text-muted-foreground">{t('AUTH.LOGIN.NO_ACCOUNT')} </span>
                <RegisterRoleDialog />
            </motion.div>
        </motion.form>
    );
}
