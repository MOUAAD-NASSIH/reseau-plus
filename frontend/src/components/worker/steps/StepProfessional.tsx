import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Layers } from "lucide-react";

import {
  workerProfessionalSchema,
  type WorkerProfessionalForm,
} from "../workerRegister.schema";

import { useWorkerRegisterStore } from "../workerRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useSpecialities } from "@/features/hooks/useDomains";
import { DomainMultiSelect } from "@/components/common/DomainMultiSelect";

export default function StepProfessional() {
  const { data, updateData } = useWorkerRegisterStore();
  const { data: specialitiesData } = useSpecialities();
  const specialities = specialitiesData?.data || [];

  const form = useForm<WorkerProfessionalForm>({
    resolver: zodResolver(workerProfessionalSchema),
    mode: "onBlur",
    defaultValues: {
      specialityId: data.specialityId,
      experienceYears: data.experienceYears,
      bio: data.bio ?? "",
      domainIds: data.domainIds ?? [],
    },
  });

  /* ================================
     Persist valid data
  ================================ */
  useEffect(() => {
    const sub = form.watch((values) => {
      const result = workerProfessionalSchema.safeParse(values);
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
          Professional information
        </h2>
        <p className="text-muted-foreground">
          Help institutions understand your expertise and experience
        </p>
      </div>

      {/* Speciality */}
      {/* Speciality */}
      <div className="space-y-2">
        <Label>Primary speciality *</Label>

        <Controller
          control={form.control}
          name="specialityId"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : undefined}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              {/* ⬇️ FULL WIDTH */}
              <SelectTrigger className="h-12 w-full">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select your main speciality" />
              </SelectTrigger>

              {/* ⬇️ MATCH WIDTH */}
              <SelectContent className="w-full">
                {specialities.map((s: { id: number; name: string }) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label>Years of professional experience</Label>
        <div className="relative">
          <Layers className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            min={0}
            className="pl-11 h-12"
            placeholder="e.g. 5"
            {...form.register("experienceYears", {
              valueAsNumber: true,
            })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Approximate number of years in this field
        </p>
      </div>

      {/* Domains */}
      <div className="space-y-2">
        <Label>Domains of intervention</Label>
        <Controller
          control={form.control}
          name="domainIds"
          render={({ field }) => (
            <DomainMultiSelect
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Select all domains you are comfortable working in
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label>Professional bio</Label>
        <Textarea
          rows={5}
          placeholder="Briefly describe your professional background, key skills, and the type of missions you are looking for..."
          {...form.register("bio")}
        />
        <p className="text-xs text-muted-foreground">Max 2000 characters</p>
      </div>
    </div>
  );
}
