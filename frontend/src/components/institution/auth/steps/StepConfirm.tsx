import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { useInstitutionRegisterStore } from "../institutionRegister.store";
import { institutionTermsSchema, type InstitutionTermsForm } from "../institutionRegister.schema";
import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation, Trans } from "react-i18next";

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function StepConfirm() {
  const { data, updateData } = useInstitutionRegisterStore();
  const reduceMotion = shouldReduceMotion();
  const { t } = useTranslation();

  const form = useForm<InstitutionTermsForm>({
    resolver: zodResolver(institutionTermsSchema),
    defaultValues: {
      termsAccepted: data.termsAccepted ?? false,
    },
    mode: "onChange"
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      const parsed = institutionTermsSchema.safeParse(values);
      if (parsed.success) {
        updateData({ termsAccepted: parsed.data.termsAccepted });
      } else if (values.termsAccepted === false) {
        updateData({ termsAccepted: false });
      }
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
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl font-semibold mb-2">{t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.TITLE')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.SUBTITLE')}
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        className="rounded-xl border border-border/50 bg-muted/20 p-6 space-y-6"
        variants={reduceMotion ? {} : fadeUpItem}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Item icon={Building2} label={t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.NAME_LABEL')} value={data.institutionName} />
          <Item icon={Mail} label={t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.EMAIL_LABEL')} value={data.email} />
          <Item icon={MapPin} label={t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.CITY_LABEL')} value={data.city} />
          <Item icon={Calendar} label={t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.DATE_ESTABLISHED_LABEL')} value={data.dateEstablished} />
        </div>

        {data.description && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.DESCRIPTION_LABEL')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Terms Checkbox */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <div className="flex items-start space-x-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <Checkbox
            id="terms"
            checked={form.watch("termsAccepted")}
            onCheckedChange={(c) => {
              form.setValue("termsAccepted", c as boolean, { shouldValidate: true });
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.TERMS_LABEL')}
            </Label>
            <p className="text-xs text-muted-foreground">
              <Trans i18nKey="AUTH.REGISTER_INSTITUTION.STEP_CONFIRM.TERMS_AGREEMENT">
                By clicking continue, you agree to our <a href="#" className="underline text-primary hover:text-primary/80">Terms of Service</a> and <a href="#" className="underline text-primary hover:text-primary/80">Privacy Policy</a>.
              </Trans>
            </p>
            {form.formState.errors.termsAccepted && (
              <p className="text-xs font-medium text-destructive mt-1">
                {t(form.formState.errors.termsAccepted.message as string)}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}