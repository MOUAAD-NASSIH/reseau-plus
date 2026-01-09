import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  MapPin,
  User,
  Briefcase,
  Calendar,
  FileText,
  Building2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { format } from "date-fns";

import {
  workerTermsSchema,
  type WorkerTermsForm,
} from "../workerRegister.schema";
import { useWorkerRegisterStore } from "../workerRegister.store";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetDomainsQuery, useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepConfirm() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();

  const { data: specialitiesData } = useGetSpecialitiesQuery();
  const { data: domainsData } = useGetDomainsQuery();

  const form = useForm<WorkerTermsForm>({
    resolver: zodResolver(workerTermsSchema),
    mode: "onChange",
    defaultValues: {
      termsAccepted: data.termsAccepted ?? false,
    },
  });

  useEffect(() => {
    const sub = form.watch((values) => {
      updateData(values);
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  const reduceMotion = shouldReduceMotion();

  const specialityName = specialitiesData?.data?.find(s => s.id === data.specialityId)?.name || "Not selected";
  const selectedDomains = domainsData?.data?.filter(d => data.domainIds?.includes(d.id)).map(d => d.name) || [];

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl font-semibold mb-2">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.TITLE')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.SUBTITLE')}
        </p>
      </motion.div>

      {/* Summary Content */}
      <motion.div
        variants={reduceMotion ? {} : fadeUpItem}
        className="space-y-6"
      >
        {/* Personal & Account Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard
            icon={User}
            title={t('AUTH.REGISTER_WORKER.STEP_CONFIRM.NAME_LABEL')}
            content={`${data.firstName} ${data.lastName}`}
          />
          <SectionCard
            icon={FileText}
            title={t('AUTH.REGISTER_WORKER.STEP_CONFIRM.EMAIL_LABEL')}
            content={data.email || "—"}
          />
          <SectionCard
            icon={MapPin}
            title={t('AUTH.REGISTER_WORKER.STEP_CONFIRM.CITY_LABEL')}
            content={data.city || "—"}
          />
          <SectionCard
            icon={Calendar}
            title={t('AUTH.REGISTER_WORKER.STEP_CONFIRM.BIRTH_DATE_LABEL')}
            content={data.birthDate ? format(new Date(data.birthDate), "PPP") : "—"}
          />
        </div>

        {/* Professional Section */}
        <div className="bg-secondary/10 border border-border/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm tracking-tight font-spline text-foreground">{t('AUTH.REGISTER_WORKER.STEP_PROFESSIONAL.TITLE')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest leading-none bg-secondary/50 px-1.5 py-0.5 rounded-sm">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.SPECIALITY_LABEL')}</Label>
              <p className="text-sm font-semibold">{specialityName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest leading-none bg-secondary/50 px-1.5 py-0.5 rounded-sm">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.EXPERIENCE_LABEL')}</Label>
              <p className="text-sm font-semibold">{data.experienceYears} {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.YEARS')}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest leading-none bg-secondary/50 px-1.5 py-0.5 rounded-sm">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.DOMAINS_LABEL')}</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedDomains.map((d, i) => (
                  <span key={i} className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full ring-1 ring-primary/20">{d}</span>
                ))}
              </div>
            </div>
            {data.bio && (
              <div className="md:col-span-2 space-y-1 pt-2 border-t border-border/30">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest leading-none">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.BIO_LABEL')}</Label>
                <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3">"{data.bio}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Experience & Documents Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary/10 border border-border/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-spline">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.EXPERIENCES_LABEL')}</h4>
              <p className="text-sm font-bold text-foreground">{(data.experiences || []).length} {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.EXPERIENCES_COUNT')}</p>
            </div>
            <CheckCircle2 className={cn("h-5 w-5", (data.experiences || []).length > 0 ? "text-emerald-500" : "text-muted-foreground/30")} />
          </div>

          <div className="bg-secondary/10 border border-border/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-spline">{t('AUTH.REGISTER_WORKER.STEP_CONFIRM.DOCUMENTS_LABEL')}</h4>
              <p className="text-sm font-bold text-foreground">{(data.documents || []).length} {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.DOCUMENTS_COUNT')}</p>
            </div>
            <CheckCircle2 className={cn("h-5 w-5", (data.documents || []).length >= 2 ? "text-emerald-500" : "text-destructive")} />
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className={cn(
            "flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300",
            form.watch("termsAccepted")
              ? "bg-emerald-500/3 border-emerald-500/30 ring-1 ring-emerald-500/10"
              : "bg-secondary/10 border-border/50 hover:bg-secondary/20"
          )}>
            <div className="pt-0.5">
              <Checkbox
                id="termsAccepted"
                checked={form.watch("termsAccepted")}
                onCheckedChange={(checked) => form.setValue("termsAccepted", !!checked, { shouldValidate: true })}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-5 w-5"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="termsAccepted" className="text-sm font-bold cursor-pointer leading-tight block">
                {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.TERMS_LABEL')}
              </Label>
              <p className="text-xs text-muted-foreground pr-4">
                <Trans
                  i18nKey="AUTH.REGISTER_WORKER.STEP_CONFIRM.TERMS_AGREEMENT"
                  components={{
                    1: <a key="tos" href="#" className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" />,
                    2: <a key="privacy" href="#" className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" />
                  }}
                />
              </p>
            </div>
          </div>
          {form.formState.errors.termsAccepted && (
            <p className="text-xs font-bold text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 ml-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {t('AUTH.REGISTER_WORKER.STEP_CONFIRM.TERMS_ERROR')}
            </p>
          )}
        </div>
      </motion.div>

      {/* Completion Banner */}
      {form.watch("termsAccepted") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Ready to join?</h4>
              <p className="text-[11px] opacity-80 font-medium">Click the button below to complete your registration.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
}

function SectionCard({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="bg-secondary/10 border border-border/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-spline">{title}</h4>
        <p className="text-sm font-bold text-foreground truncate font-sans">{content}</p>
      </div>
    </div>
  );
}

function AlertCircle(props: any) {
  return <ShieldCheck {...props} className={cn(props.className, "text-destructive")} />;
}

function BadgeCheck(props: any) {
  return <CheckCircle2 {...props} />;
}
