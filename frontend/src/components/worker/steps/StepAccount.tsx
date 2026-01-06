import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import {
  workerAccountSchema,
  type WorkerAccountForm,
} from "../workerRegister.schema";

import { useWorkerRegisterStore } from "../workerRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function StepAccount() {
  const { data, updateData } = useWorkerRegisterStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<WorkerAccountForm>({
    resolver: zodResolver(workerAccountSchema),
    mode: "onBlur",
    defaultValues: {
      email: data.email ?? "",
      password: data.password ?? "",
      confirmPassword: "",
    },
  });

  /* ================================
     Persist ONLY valid store data
  ================================ */
  useEffect(() => {
    const sub = form.watch((values) => {
      const result = workerAccountSchema.safeParse(values);
      if (result.success) {
        updateData({
          email: result.data.email,
          password: result.data.password,
        });
      }
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="text-muted-foreground">
          Set up your secure login credentials
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            className="pl-11 h-12"
            placeholder="name@example.com"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label>Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            className="pl-11 pr-11 h-12"
            placeholder="••••••••"
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label>Confirm password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            className="pl-11 pr-11 h-12"
            placeholder="••••••••"
            {...form.register("confirmPassword")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </Button>
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

