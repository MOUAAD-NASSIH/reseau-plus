import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Calendar, MapPin, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

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
import {
  shouldReduceMotion,
  staggerContainer,
  fadeUpItem,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepPersonal() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();

  const form = useForm<WorkerPersonalForm>({
    resolver: zodResolver(workerPersonalSchema),
    mode: "onChange",
    defaultValues: {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      birthDate: data.birthDate,
      gender: data.gender,
      city: data.city ?? "",
      zipCode: data.zipCode ?? "",
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData(values as any);
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  const reduceMotion = shouldReduceMotion();

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
          {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.TITLE")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.SUBTITLE")}
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="space-y-6"
        variants={reduceMotion ? {} : fadeUpItem}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" required>
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.FIRST_NAME_LABEL")}
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
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.LAST_NAME_LABEL")}
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
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.BIRTH_DATE_LABEL")}
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
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_LABEL")}
            </Label>
            <Select
              defaultValue={data.gender}
              onValueChange={(val) =>
                form.setValue("gender", val as any, { shouldValidate: true })
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
                  {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_MALE")}
                </SelectItem>
                <SelectItem value="FEMALE">
                  {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.GENDER_FEMALE")}
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
            <div className="relative group">
              <CitySelect
                value={form.watch("city")}
                onChange={(val) =>
                  form.setValue("city", val, { shouldValidate: true })
                }
                placeholder={t(
                  "AUTH.REGISTER_WORKER.STEP_PERSONAL.CITY_PLACEHOLDER"
                )}
              />
            </div>
            {form.formState.errors.city && (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.city.message}
              </p>
            )}
          </div>

          {/* ZIP Code */}
          <div className="space-y-2">
            <Label htmlFor="zipCode" required>
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.ZIP_CODE_LABEL")}
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

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-primary">
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.INFO_BOX_TITLE")}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("AUTH.REGISTER_WORKER.STEP_PERSONAL.INFO_BOX_DESC")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
