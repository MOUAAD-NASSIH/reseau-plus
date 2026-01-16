import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Target, Info, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import {
  workerProfessionalSchema,
  type WorkerProfessionalForm,
} from "../workerRegister.schema";
import { useWorkerRegisterStore } from "../workerRegister.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDomainsQuery,
  useGetSpecialitiesQuery,
} from "@/features/api/endpoints/domainEndpoints";
import {
  shouldReduceMotion,
  staggerContainer,
  fadeUpItem,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepProfessional() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();

  const { data: specialitiesData, isLoading: isLoadingSpecialities } =
    useGetSpecialitiesQuery();
  const { data: domainsData, isLoading: isLoadingDomains } =
    useGetDomainsQuery();

  const form = useForm<WorkerProfessionalForm>({
    resolver: zodResolver(workerProfessionalSchema),
    mode: "onChange",
    defaultValues: {
      specialityId: data.specialityId,
      experienceYears: data.experienceYears ?? 0,
      bio: data.bio ?? "",
      domainIds: data.domainIds ?? [],
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData({
        specialityId: values.specialityId,
        experienceYears: values.experienceYears,
        bio: values.bio,
        domainIds: values.domainIds?.filter(
          (id): id is number => id !== undefined
        ),
      });
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  const toggleDomain = (id: number) => {
    const current = form.getValues("domainIds") || [];
    const updated = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    form.setValue("domainIds", updated, { shouldValidate: true });
  };

  const reduceMotion = shouldReduceMotion();
  const specialities = specialitiesData?.data || [];
  const domains = domainsData?.data || [];

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl font-semibold mb-2">
          {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.TITLE")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.SUBTITLE")}
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="space-y-6"
        variants={reduceMotion ? {} : fadeUpItem}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speciality */}
          <div className="space-y-2">
            <Label htmlFor="specialityId" required>
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.SPECIALITY_LABEL")}
            </Label>
            {isLoadingSpecialities ? (
              <Skeleton className="h-11 w-full bg-secondary/20" />
            ) : (
              <Select
                defaultValue={data.specialityId?.toString()}
                onValueChange={(val) =>
                  form.setValue("specialityId", parseInt(val), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="specialityId"
                  className={cn(
                    "h-11 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                    form.formState.errors.specialityId && "border-destructive"
                  )}
                >
                  <SelectValue
                    placeholder={t(
                      "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.SPECIALITY_PLACEHOLDER"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {specialities.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.specialityId && (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.specialityId.message}
              </p>
            )}
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="experienceYears" required>
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.EXPERIENCE_LABEL")}
            </Label>
            <div className="relative group">
              <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <Input
                id="experienceYears"
                type="number"
                min="0"
                placeholder={t(
                  "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.EXPERIENCE_PLACEHOLDER"
                )}
                className={cn(
                  "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                  form.formState.errors.experienceYears &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                {...form.register("experienceYears", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.experienceYears ? (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.experienceYears.message}
              </p>
            ) : (
              <p className="text-[0.8rem] text-muted-foreground">
                {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.EXPERIENCE_HELPER")}
              </p>
            )}
          </div>
        </div>

        {/* Domains of Intervention */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.DOMAINS_LABEL")}
            </Label>
            <span className="text-xs text-destructive">*</span>
          </div>
          <p className="text-[0.8rem] text-muted-foreground mb-4">
            {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.DOMAINS_HELPER")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoadingDomains
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-12 w-full bg-secondary/20 rounded-lg"
                  />
                ))
              : domains.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => toggleDomain(d.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-all hover:bg-secondary/20",
                      form.watch("domainIds")?.includes(d.id)
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-secondary/10"
                    )}
                  >
                    <Checkbox
                      id={`domain-${d.id}`}
                      checked={form.watch("domainIds")?.includes(d.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`domain-${d.id}`}
                      className="flex-1 cursor-pointer font-medium text-sm"
                    >
                      {d.name}
                    </Label>
                  </div>
                ))}
          </div>
          {form.formState.errors.domainIds && (
            <p className="text-xs font-medium text-destructive mt-1">
              {form.formState.errors.domainIds.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" required>
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.BIO_LABEL")}
            </Label>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {form.watch("bio")?.length || 0} / 2000
            </span>
          </div>
          <div className="relative group">
            <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Textarea
              id="bio"
              placeholder={t(
                "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.BIO_PLACEHOLDER"
              )}
              rows={4}
              className={cn(
                "pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 resize-none placeholder:opacity-60",
                form.formState.errors.bio &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("bio")}
            />
          </div>
          {form.formState.errors.bio ? (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.bio.message}
            </p>
          ) : (
            <p className="text-[0.8rem] text-muted-foreground">
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.BIO_MAX_CHARS")}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-primary">
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.INFO_BOX_TITLE")}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.INFO_BOX_DESC")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
