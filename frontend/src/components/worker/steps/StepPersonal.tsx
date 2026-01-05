import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Calendar } from "lucide-react";

import {
  workerPersonalSchema,
  type WorkerPersonalForm,
} from "../workerRegister.schema";

import { useWorkerRegisterStore } from "../workerRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CitySelect } from "@/components/common/CitySelect";

export default function StepPersonal() {
  const { data, updateData } = useWorkerRegisterStore();

  const form = useForm<WorkerPersonalForm>({
    resolver: zodResolver(workerPersonalSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      birthDate: data.birthDate,
      gender: data.gender,
      city: data.city ?? "",
      zipCode: data.zipCode ?? "",
    },
  });

  /* ================================
     Persist valid data to store
  ================================ */
  useEffect(() => {
    const sub = form.watch((values) => {
      const result = workerPersonalSchema.safeParse(values);
      if (result.success) {
        updateData(result.data);
      }
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Personal information
        </h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to complete your profile
        </p>
      </div>

      {/* First + Last name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>First name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-11 h-12"
              placeholder="e.g. Ahmed"
              {...form.register("firstName")}
            />
          </div>
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Last name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-11 h-12"
              placeholder="e.g. El Amrani"
              {...form.register("lastName")}
            />
          </div>
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Birth date */}
      <div className="space-y-2">
        <Label>Date of birth</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            className="pl-11 h-12"
            {...form.register("birthDate", {
              valueAsDate: true,
            })}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v as "MALE" | "FEMALE")}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* City + ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>City</Label>
          <Controller
            control={form.control}
            name="city"
            render={({ field }) => (
              <CitySelect
                value={field.value}
                onChange={field.onChange}
                placeholder="select city"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>ZIP code</Label>
          <Input
            className="h-12"
            placeholder="e.g. 20000"
            {...form.register("zipCode")}
          />
        </div>
      </div>
    </div>
  );
}
