import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Target,
  FileText,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { z } from "zod";

import {
  workerPersonalSchema,
  workerProfessionalSchema,
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
import { CitySelect } from "@/components/common/CitySelect";
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

// Combined schema for the profile step
const profileSchema = workerPersonalSchema.merge(workerProfessionalSchema);
type ProfileForm = z.infer<typeof profileSchema>;

export default function StepProfile() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<"personal" | "professional">(
    "personal"
  );

  const { data: specialitiesData, isLoading: isLoadingSpecialities } =
    useGetSpecialitiesQuery();
  const { data: domainsData, isLoading: isLoadingDomains } =
    useGetDomainsQuery();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      birthDate: data.birthDate,
      gender: data.gender,
      city: data.city ?? "",
      zipCode: data.zipCode ?? "",
      specialityId: data.specialityId,
      experienceYears: data.experienceYears ?? 0,
      bio: data.bio ?? "",
      domainIds: data.domainIds ?? [],
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData({
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate as Date | undefined,
        gender: values.gender as "MALE" | "FEMALE" | undefined,
        city: values.city,
        zipCode: values.zipCode,
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

  // Check if personal section is complete
  const personalComplete = workerPersonalSchema.safeParse({
    firstName: form.watch("firstName"),
    lastName: form.watch("lastName"),
    birthDate: form.watch("birthDate"),
    gender: form.watch("gender"),
    city: form.watch("city"),
    zipCode: form.watch("zipCode"),
  }).success;

  const professionalComplete = workerProfessionalSchema.safeParse({
    specialityId: form.watch("specialityId"),
    experienceYears: form.watch("experienceYears"),
    bio: form.watch("bio"),
    domainIds: form.watch("domainIds"),
  }).success;

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl font-semibold mb-2">
          {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.TITLE").replace(
            /Informations Personnelles|Personal Information/i,
            t("AUTH.REGISTER_WORKER.LAYOUT.STEP_PROFILE")
          )}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.SUBTITLE")}
        </p>
      </motion.div>

      {/* Personal Information Section */}
      <motion.div
        variants={reduceMotion ? {} : fadeUpItem}
        className="rounded-2xl border border-border/50 overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setOpenSection("personal")}
          className={cn(
            "w-full flex items-center justify-between p-5 text-left transition-colors",
            openSection === "personal"
              ? "bg-primary/5 border-b border-border/50"
              : "bg-secondary/5 hover:bg-secondary/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                personalComplete
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {personalComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.TITLE")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {personalComplete
                  ? `${form.watch("firstName")} ${form.watch("lastName")} — ${form.watch("city") || "..."}`
                  : t("AUTH.REGISTER_WORKER.STEP_PERSONAL.SUBTITLE")}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              openSection === "personal" && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "personal" && (
            <motion.div
              initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.FIRST_NAME_LABEL"
                      )}
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <Input
                        id="firstName"
                        placeholder={t(
                          "AUTH.REGISTER_WORKER.STEP_PERSONAL.FIRST_NAME_PLACEHOLDER"
                        )}
                        className={cn(
                          "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                          form.formState.errors.firstName &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...form.register("firstName")}
                      />
                    </div>
                    {form.formState.errors.firstName && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.LAST_NAME_LABEL"
                      )}
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <Input
                        id="lastName"
                        placeholder={t(
                          "AUTH.REGISTER_WORKER.STEP_PERSONAL.LAST_NAME_PLACEHOLDER"
                        )}
                        className={cn(
                          "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                          form.formState.errors.lastName &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...form.register("lastName")}
                      />
                    </div>
                    {form.formState.errors.lastName && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.BIRTH_DATE_LABEL"
                      )}
                    </Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <Input
                        id="birthDate"
                        type="date"
                        className={cn(
                          "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                          form.formState.errors.birthDate &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        defaultValue={
                          data.birthDate
                            ? format(new Date(data.birthDate), "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          form.setValue("birthDate", val as any, {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </div>
                    {form.formState.errors.birthDate && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.birthDate.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_LABEL"
                      )}
                    </Label>
                    <Select
                      defaultValue={data.gender}
                      onValueChange={(val) =>
                        form.setValue("gender", val as any, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        id="gender"
                        className={cn(
                          "h-11 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                          form.formState.errors.gender && "border-destructive"
                        )}
                      >
                        <SelectValue
                          placeholder={t(
                            "AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_PLACEHOLDER"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">
                          {t(
                            "AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_MALE"
                          )}
                        </SelectItem>
                        <SelectItem value="FEMALE">
                          {t(
                            "AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_FEMALE"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gender && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" required>
                      {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.CITY_LABEL")}
                    </Label>
                    <CitySelect
                      value={form.watch("city")}
                      onChange={(val) =>
                        form.setValue("city", val, { shouldValidate: true })
                      }
                      placeholder={t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.CITY_PLACEHOLDER"
                      )}
                    />
                    {form.formState.errors.city && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PERSONAL.ZIP_CODE_LABEL"
                      )}
                    </Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <Input
                        id="zipCode"
                        placeholder={t(
                          "AUTH.REGISTER_WORKER.STEP_PERSONAL.ZIP_CODE_PLACEHOLDER"
                        )}
                        className={cn(
                          "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                          form.formState.errors.zipCode &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...form.register("zipCode")}
                      />
                    </div>
                    {form.formState.errors.zipCode && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Professional Information Section */}
      <motion.div
        variants={reduceMotion ? {} : fadeUpItem}
        className="rounded-2xl border border-border/50 overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setOpenSection("professional")}
          className={cn(
            "w-full flex items-center justify-between p-5 text-left transition-colors",
            openSection === "professional"
              ? "bg-primary/5 border-b border-border/50"
              : "bg-secondary/5 hover:bg-secondary/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                professionalComplete
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {professionalComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.TITLE")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {professionalComplete
                  ? `${specialities.find((s) => s.id === form.watch("specialityId"))?.name || "..."} — ${form.watch("experienceYears") || 0} ${t("AUTH.REGISTER_WORKER.STEP_CONFIRM.YEARS")}`
                  : t("AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.SUBTITLE")}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              openSection === "professional" && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "professional" && (
            <motion.div
              initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Speciality */}
                  <div className="space-y-2">
                    <Label htmlFor="specialityId" required>
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.SPECIALITY_LABEL"
                      )}
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
                            form.formState.errors.specialityId &&
                              "border-destructive"
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
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.EXPERIENCE_LABEL"
                      )}
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
                        {...form.register("experienceYears", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    {form.formState.errors.experienceYears ? (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.experienceYears.message}
                      </p>
                    ) : (
                      <p className="text-[0.8rem] text-muted-foreground">
                        {t(
                          "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.EXPERIENCE_HELPER"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Domains of Intervention */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.DOMAINS_LABEL"
                      )}
                    </Label>
                    <span className="text-xs text-destructive">*</span>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground mb-4">
                    {t(
                      "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.DOMAINS_HELPER"
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              checked={form
                                .watch("domainIds")
                                ?.includes(d.id)}
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
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.BIO_LABEL"
                      )}
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
                      {t(
                        "AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.BIO_MAX_CHARS"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
