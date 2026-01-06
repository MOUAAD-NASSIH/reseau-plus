import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

import {
    loginSchema,
    type LoginSchema,
} from "@/features/validation/authSchema";
import { useLoginMutation } from "@/features/api/endpoints/authEndpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import RegisterRoleDialog from "../common/RegisterRoleDialog";
import type { AxiosBaseQueryError } from "@/features/api/baseQuery";

export default function LoginForm() {
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect location from state (if coming from ProtectedRoute)
    const from = (location.state as { from?: Location })?.from;

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur",
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

            // Store token
            localStorage.setItem("auth_token", response.data.token);

            // If we have a saved location, redirect there
            if (from && from.pathname !== "/login") {
                navigate(from.pathname, { replace: true });
                return;
            }

            // Otherwise, navigate based on role
            const role = response.data.user.role;
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "institution") {
                navigate("/institution", { replace: true });
            } else if (role === "worker") {
                navigate("/worker", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            // Handle RTK Query error format
            const apiError = error as AxiosBaseQueryError;
            if (apiError.data?.details) {
                apiError.data.details.forEach(({ field, message }) => {
                    setError(field as keyof LoginSchema, {
                        type: "server",
                        message: message,
                    });
                });
            } else if (apiError.message) {
                // Set general error on email field for display
                setError("email", {
                    type: "server",
                    message: apiError.message,
                });
            }
        }
    };

    const isLoading = isSubmitting || isLoginLoading;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-[32px] font-bold tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground">
                    Please enter your details to sign in.
                </p>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="password"
                        {...register("password")}
                        type="password"
                        className="h-12 pl-11"
                        placeholder="Enter your password"
                        aria-invalid={!!errors.password}
                    />
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>
            <div className="flex justify-end">
                <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
                disabled={isLoading}
            >
                {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
                Don't have an account? <RegisterRoleDialog />
            </p>
        </form>
    );
}

