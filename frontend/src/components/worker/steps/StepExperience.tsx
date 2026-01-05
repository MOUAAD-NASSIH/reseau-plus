import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, Briefcase, Calendar } from "lucide-react";

import {
  workerExperienceSchema,
  type WorkerExperienceForm,
} from "../workerRegister.schema";

import { useWorkerRegisterStore } from "../workerRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function StepExperience() {
  const { data, updateData } = useWorkerRegisterStore();

  const form = useForm<WorkerExperienceForm>({
    resolver: zodResolver(workerExperienceSchema),
    mode: "onBlur",
    defaultValues: {
      experiences: data.experiences ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  /* ================================
     Persist valid data
  ================================ */
  useEffect(() => {
    const sub = form.watch((values) => {
      const result = workerExperienceSchema.safeParse(values);
      if (result.success) {
        updateData(result.data);
      }
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Professional experience
        </h2>
        <p className="text-muted-foreground">
          Add your previous roles and missions (optional but recommended)
        </p>
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No experience added yet.
          </p>
          <Button
            type="button"
            onClick={() =>
              append({
                jobTitle: "",
                organization: "",
                startDate: new Date(),
                endDate: null,
                description: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add your first experience
          </Button>
        </div>
      )}

      {/* Experience cards */}
      {/* Experience cards */}
      <div className="space-y-8">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-border bg-card p-6"
          >
            {/* Inline header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold">Experience {index + 1}</h4>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Job + Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      className="pl-11 h-12"
                      placeholder="e.g. Social Worker"
                      {...form.register(`experiences.${index}.jobTitle`)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    className="h-12"
                    placeholder="e.g. Red Crescent Association"
                    {...form.register(`experiences.${index}.organization`)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-11 h-12"
                      {...form.register(`experiences.${index}.startDate`, {
                        valueAsDate: true,
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    className="h-12"
                    {...form.register(`experiences.${index}.endDate`, {
                      valueAsDate: true,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if this is your current role
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  placeholder="Briefly describe your responsibilities, achievements, or mission scope…"
                  {...form.register(`experiences.${index}.description`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button (when not empty) */}
      {fields.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              jobTitle: "",
              organization: "",
              startDate: new Date(),
              endDate: null,
              description: "",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add another experience
        </Button>
      )}
    </div>
  );
}
