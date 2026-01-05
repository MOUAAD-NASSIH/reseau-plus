import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import axios from "axios";

import {
    loginSchema,
    type LoginSchema,
} from "@/features/validation/authSchema";
import { useLogin } from "@/features/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import RegisterRoleDialog from "../common/RegisterRoleDialog";

export default function LoginForm() {
    const loginMutation = useLogin();

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
            await loginMutation.mutateAsync(data);
            // Navigation is handled by useLogin hook based on role
        } catch (error) {
            // Handle backend validation errors
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                Object.entries(backendErrors).forEach(([field, message]) => {
                    setError(field as keyof LoginSchema, {
                        type: "server",
                        message: message as string,
                    });
                });
            } else if (axios.isAxiosError(error) && error.response?.data?.message) {
                // Set general error on email field for display
                setError("email", {
                    type: "server",
                    message: error.response.data.message,
                });
            }
        }
    };

    const isLoading = isSubmitting || loginMutation.isPending;

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
