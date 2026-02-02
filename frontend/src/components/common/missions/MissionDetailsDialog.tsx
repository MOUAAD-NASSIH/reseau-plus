import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Briefcase,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  CreditCard,
  FileText,
  Users,
  Award,
  X,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import type { Mission } from "@/types/mission.types";

interface MissionDetailsDialogProps {
  mission: Mission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MissionDetailsDialog({
  mission,
  open,
  onOpenChange,
}: MissionDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;

  if (!mission) return null;

  const applicantsCount = mission._count?.applications || mission.applications?.length || 0;

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: dateLocale });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl"
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header Section */}
          <div className="relative shrink-0">
            {/* Background Pattern/Gradient */}
            <div className="h-32 bg-linear-to-r from-primary/10 via-primary/5 to-background border-b border-border/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <Briefcase className="w-64 h-64 rotate-12" />
              </div>
            </div>

            {/* Mission Info Overlay */}
            <div className="px-4 sm:px-8 -mt-12 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 relative z-10 pb-6 border-b border-border/40 text-center sm:text-left">
              {/* Icon */}
              <div className="relative group shrink-0">
                <div className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                  <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 pb-1 space-y-2 sm:space-y-1 w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold font-spline text-foreground truncate max-w-[200px] sm:max-w-none">
                    {mission.title}
                  </h2>
                  <StatusBadge status={mission.status} className="h-6" />
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-muted-foreground text-sm sm:text-base">
                  {mission.institution && (
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {mission.institution.institutionName}
                    </div>
                  )}
                  <span className="hidden sm:inline text-border/60">|</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {mission.location || t("ADMIN_MISSIONS.CARD.REMOTE")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold",
                      mission.urgency === "HIGH"
                        ? "border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10"
                        : mission.urgency === "MEDIUM"
                          ? "border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                          : "border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    {t(`ADMIN_MISSIONS.FILTERS.${mission.urgency}`)}
                  </Badge>
                  {mission.requiredSpeciality && (
                    <Badge variant="secondary" className="font-semibold">
                      <Award className="h-3.5 w-3.5 mr-1.5" />
                      {mission.requiredSpeciality.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Header Actions (Dialog Close) */}
              <DialogClose className="absolute top-2 right-2 sm:top-auto sm:right-0 sm:static mb-auto sm:mb-0 p-2 bg-background/50 rounded-full sm:bg-transparent sm:p-0">
                <X className="h-5 w-5 sm:hidden" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-muted/10">
            <div className="p-4 sm:p-8 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_280px]">
              {/* Left Column (Main Content) */}
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                {/* Description Section */}
                {mission.description && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("MISSION_DETAILS.DESCRIPTION")}
                    </h3>
                    <div className="p-4 rounded-xl sm:rounded-2xl bg-background border border-border/50 shadow-sm">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line text-justify sm:text-left">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Domains Section */}
                {mission.domains && mission.domains.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("MISSION_DETAILS.DOMAINS")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mission.domains.map((d) => (
                        <Badge
                          key={d.id}
                          variant={d.isRequired ? "default" : "outline"}
                          className="px-3 py-1 text-xs font-medium rounded-full"
                        >
                          {d.domain?.name ?? t("MISSION_DETAILS.UNKNOWN")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applicants Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("ADMIN_MISSIONS.CARD.APPLICANTS")}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {applicantsCount}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {mission.applications && mission.applications.length > 0 ? (
                      mission.applications.map((app) => (
                        <div
                          key={app.id}
                          className="p-3 sm:p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-border/50">
                              <AvatarImage
                                src={app.worker.user?.profilePicture || undefined}
                                alt={`${app.worker.firstName} ${app.worker.lastName}`}
                              />
                              <AvatarFallback className="text-sm font-bold bg-muted text-muted-foreground">
                                {app.worker.firstName?.[0]}
                                {app.worker.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-foreground truncate">
                                {app.worker.firstName} {app.worker.lastName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {t("COMMON.STATUS.APPLIED_ON")}{" "}
                                {formatDate(app.appliedAt)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                app.status === "ACCEPTED"
                                  ? "default"
                                  : app.status === "REJECTED"
                                    ? "destructive"
                                    : "outline"
                              }
                              className="shrink-0"
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/60">
                        <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground font-medium text-sm">
                          {t("MISSION_DETAILS.NO_APPLICANTS")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-6 order-1 lg:order-2">
                {/* Quick Stats Card */}
                <div className="rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden p-0">
                  <div className="p-3 sm:p-4 bg-muted/30 border-b border-border/40">
                    <h4 className="font-bold text-sm">{t("MISSION_DETAILS.KEY_INFO")}</h4>
                  </div>
                  <div className="divide-y divide-border/40">
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("MISSION_DETAILS.START_DATE")}
                      </div>
                      <span className="font-medium text-sm text-foreground whitespace-nowrap">
                        {formatDate(mission.startDate)}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("MISSION_DETAILS.END_DATE")}
                      </div>
                      <span className="font-medium text-sm text-foreground whitespace-nowrap">
                        {formatDate(mission.endDate)}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                        {t("ADMIN_MISSIONS.CARD.BUDGET")}
                      </div>
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {mission.budget
                          ? formatCurrency(mission.budget)
                          : t("MISSION_DETAILS.NOT_SPECIFIED")}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("ADMIN_MISSIONS.CARD.APPLICANTS")}
                      </div>
                      <span className="font-bold text-sm text-foreground whitespace-nowrap">
                        {applicantsCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Institution Card */}
                {mission.institution && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {t("MISSION_DETAILS.INSTITUTION")}
                    </h3>
                    <div className="p-4 rounded-xl bg-background border border-border/50 shadow-sm space-y-3">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {mission.institution.institutionName}
                        </p>
                      </div>
                      {mission.institution.user?.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">
                            {mission.institution.user.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
