import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

import {
  institutionAccountSchema,
  type InstitutionAccountForm,
} from "../institutionRegister.schema";
import { useInstitutionRegisterStore } from "../institutionRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepAccount() {
  const { data, updateData } = useInstitutionRegisterStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<InstitutionAccountForm>({
    resolver: zodResolver(institutionAccountSchema),
    mode: "onBlur",
    defaultValues: {
      email: data.email ?? "",
      password: data.password ?? "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      const parsed = institutionAccountSchema.safeParse(values);
      if (parsed.success) {
        updateData({
          email: values.email,
          password: values.password,
        });
      }
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Create institution account
        </h2>
        <p className="text-muted-foreground">
          Secure access for your organization
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="contact@institution.org"
            className="pl-11 h-12"
            {...form.register("email")}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label>Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-11 pr-11 h-12"
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label>Confirm password</Label>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            className="pl-11 pr-11 h-12"
            {...form.register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  );
}

