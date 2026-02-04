import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Calendar, Info } from "lucide-react";
import { motion } from "framer-motion";

import {
  institutionInfoSchema,
  type InstitutionInfoForm,
} from "../institutionRegister.schema";
import { useInstitutionRegisterStore } from "../institutionRegister.store";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/common/CitySelect";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepInstitutionInfo() {
  const { data, updateData } = useInstitutionRegisterStore();
  const reduceMotion = shouldReduceMotion();
  const { t } = useTranslation();

  const form = useForm<InstitutionInfoForm>({
    resolver: zodResolver(institutionInfoSchema),
    mode: "onBlur",
    defaultValues: {
      institutionName: data.institutionName ?? "",

      city: data.city ?? "",
      dateEstablished: data.dateEstablished ?? "",
      description: data.description ?? "",
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData(values);
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

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
          {t('AUTH.REGISTER_INSTITUTION.STEP_INFO.TITLE')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.SUBTITLE')}</p>
      </motion.div>

      {/* Form Fields */}
      <motion.div
        className="space-y-6"
        variants={reduceMotion ? {} : fadeUpItem}
      >

        {/* Institution name */}
        <div className="space-y-2">
          <Label htmlFor="institutionName" className="flex items-center gap-1">
            {t('AUTH.REGISTER_INSTITUTION.STEP_INFO.INSTITUTION_NAME_LABEL')}
            <Info className="h-3 w-3 text-muted-foreground" />
          </Label>
          <div className="relative group">
            <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Input
              id="institutionName"
              placeholder={t('AUTH.REGISTER_INSTITUTION.STEP_INFO.INSTITUTION_NAME_PLACEHOLDER')}
              className={cn(
                "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                form.formState.errors.institutionName && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("institutionName")}
            />
          </div>
          {form.formState.errors.institutionName && (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.institutionName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Established */}
          <div className="space-y-2">
            <Label htmlFor="dateEstablished">{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.DATE_ESTABLISHED_LABEL')}</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <Input
                id="dateEstablished"
                type="date"
                className={cn(
                  "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                  form.formState.errors.dateEstablished && "border-destructive focus-visible:ring-destructive"
                )}
                {...form.register("dateEstablished")}
              />
            </div>
            {form.formState.errors.dateEstablished && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.dateEstablished.message}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.CITY_LABEL')}</Label>
            <Controller
              control={form.control}
              name="city"
              render={({ field }) => (
                <CitySelect
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>



        {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.DESCRIPTION_LABEL')}</Label>
            <span className="text-xs text-muted-foreground">{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.DESCRIPTION_MAX_CHARS')}</span>
          </div>
          <Textarea
            placeholder={t('AUTH.REGISTER_INSTITUTION.STEP_INFO.DESCRIPTION_PLACEHOLDER')}
            className="min-h-[120px] resize-none placeholder:opacity-60"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-primary">{t('AUTH.REGISTER_INSTITUTION.STEP_INFO.INFO_BOX_TITLE')}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('AUTH.REGISTER_INSTITUTION.STEP_INFO.INFO_BOX_DESC')}
            </p>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

