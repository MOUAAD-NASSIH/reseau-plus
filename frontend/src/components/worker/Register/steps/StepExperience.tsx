import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Briefcase,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  ChevronRight,
  ClipboardList,
  Lightbulb,
  PlusCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import {
  workerExperienceItemSchema,
  type WorkerExperienceItemForm,
} from "../workerRegister.schema";
import { useWorkerRegisterStore } from "../workerRegister.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  shouldReduceMotion,
  staggerContainer,
  fadeUpItem,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function StepExperience() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const experiences = data.experiences || [];

  const form = useForm<WorkerExperienceItemForm>({
    resolver: zodResolver(workerExperienceItemSchema),
    mode: "onChange",
    defaultValues: {
      jobTitle: "",
      organization: "",
      startDate: undefined,
      endDate: undefined,
      description: "",
      isCurrent: false,
    },
  });

  const onSubmit = (values: WorkerExperienceItemForm) => {
    const updated = [...experiences];
    if (editingIndex !== null) {
      updated[editingIndex] = values;
    } else {
      updated.push(values);
    }
    updateData({ experiences: updated });
    setIsAdding(false);
    setEditingIndex(null);
    form.reset();
  };

  const handleEdit = (index: number) => {
    const exp = experiences[index];
    form.reset({
      jobTitle: exp.jobTitle,
      organization: exp.organization,
      startDate: exp.startDate ? new Date(exp.startDate) : undefined,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      description: exp.description || "",
      isCurrent: exp.isCurrent || false,
    });
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleDelete = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    updateData({ experiences: updated });
  };

  const reduceMotion = shouldReduceMotion();

  const isCurrent = form.watch("isCurrent");

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
          {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.TITLE")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.SUBTITLE")}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Experience List */}
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 py-16 border-2 border-dashed border-border/50 rounded-2xl bg-secondary/5 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center text-muted-foreground">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <p className="text-sm font-medium text-foreground">
                      {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.EMPTY_STATE")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 group border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => setIsAdding(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.ADD_NEW")}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative flex gap-4 p-5 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <h4 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                          {exp.jobTitle}
                        </h4>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {exp.organization}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/70">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                            {exp.isCurrent
                              ? "Present"
                              : exp.endDate
                              ? format(new Date(exp.endDate), "MMM yyyy")
                              : "?"}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleEdit(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full h-14 border border-dashed border-border/50 rounded-xl hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group"
                    onClick={() => {
                      form.reset();
                      setEditingIndex(null);
                      setIsAdding(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.ADD_NEW")}
                  </Button>
                </div>
              )}
            </div>

            {/* Tips for experiences */}
            <div className="p-5 rounded-2xl bg-primary/3 border border-primary/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-primary">
                  {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.TIPS_TITLE")}
                </h4>
              </div>
              <ul className="">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-primary/40 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {t(`AUTH.REGISTER_WORKER.STEP_EXPERIENCE.TIP_${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 rounded-2xl border border-border/50 bg-secondary/5 shadow-inner"
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  {editingIndex !== null
                    ? "Edit Experience"
                    : "Add New Experience"}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsAdding(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" required>
                    {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.JOB_TITLE_LABEL")}
                  </Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Input
                      id="jobTitle"
                      placeholder={t(
                        "AUTH.REGISTER_WORKER.STEP_EXPERIENCE.JOB_TITLE_PLACEHOLDER"
                      )}
                      className={cn(
                        "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                        form.formState.errors.jobTitle &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      {...form.register("jobTitle")}
                    />
                  </div>
                  {form.formState.errors.jobTitle && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.jobTitle.message}
                    </p>
                  )}
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label htmlFor="organization" required>
                    {t(
                      "AUTH.REGISTER_WORKER.STEP_EXPERIENCE.ORGANIZATION_LABEL"
                    )}
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Input
                      id="organization"
                      placeholder={t(
                        "AUTH.REGISTER_WORKER.STEP_EXPERIENCE.ORGANIZATION_PLACEHOLDER"
                      )}
                      className={cn(
                        "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                        form.formState.errors.organization &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      {...form.register("organization")}
                    />
                  </div>
                  {form.formState.errors.organization && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.organization.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" required>
                    {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.START_DATE_LABEL")}
                  </Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Input
                      id="startDate"
                      type="date"
                      className={cn(
                        "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50",
                        form.formState.errors.startDate &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      onChange={(e) => {
                        if (e.target.value) {
                          form.setValue("startDate", new Date(e.target.value), {
                            shouldValidate: true,
                          });
                        }
                      }}
                      defaultValue={
                        form.getValues("startDate")
                          ? format(form.getValues("startDate")!, "yyyy-MM-dd")
                          : ""
                      }
                    />
                  </div>
                  {form.formState.errors.startDate && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.END_DATE_LABEL")}
                  </Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Input
                      id="endDate"
                      type="date"
                      disabled={isCurrent}
                      className={cn(
                        "h-11 pl-9 bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 disabled:opacity-30 disabled:hover:bg-secondary/20",
                        form.formState.errors.endDate &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      onChange={(e) => {
                        const val = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        form.setValue("endDate", val, { shouldValidate: true });
                      }}
                      defaultValue={
                        form.getValues("endDate")
                          ? format(form.getValues("endDate")!, "yyyy-MM-dd")
                          : ""
                      }
                    />
                  </div>
                  {form.formState.errors.endDate && (
                    <p className="text-xs font-medium text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Is Current */}
              <div className="flex items-center space-x-2 bg-secondary/10 p-3 rounded-lg border border-border/50">
                <Checkbox
                  id="isCurrent"
                  checked={isCurrent}
                  onCheckedChange={(checked) => {
                    form.setValue("isCurrent", !!checked);
                    if (checked) form.setValue("endDate", undefined);
                  }}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="isCurrent"
                  className="text-sm font-semibold cursor-pointer"
                >
                  {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.CURRENT_WORK_LABEL")}
                </Label>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.DESCRIPTION_LABEL")}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t(
                    "AUTH.REGISTER_WORKER.STEP_EXPERIENCE.DESCRIPTION_PLACEHOLDER"
                  )}
                  rows={4}
                  className={cn(
                    "bg-secondary/20 hover:bg-secondary/30 transition-all border-border/50 focus:border-primary/50 resize-none",
                    form.formState.errors.description &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs font-medium text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl px-6 font-semibold hover:bg-secondary/20"
                  onClick={() => setIsAdding(false)}
                >
                  {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.CANCEL")}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl px-10 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {t("AUTH.REGISTER_WORKER.STEP_EXPERIENCE.SAVE")}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
