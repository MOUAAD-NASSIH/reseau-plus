import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Eye, MapPin, Calendar, FileText, User, Briefcase, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Worker } from "@/types/auth.types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WorkerValidationGridProps {
  workers: Worker[];
  isLoading: boolean;
  onReview: (worker: Worker) => void;
}

export function WorkerValidationGrid({ workers, isLoading, onReview }: WorkerValidationGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-border/40 overflow-hidden rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl h-full">
            <CardContent className="p-5 flex flex-col h-full">
              {/* Header Skeleton */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4 w-full">
                  <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 pt-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-7 w-20 rounded-full shrink-0" />
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <Skeleton className="h-[68px] w-full rounded-2xl" />
                <Skeleton className="h-[68px] w-full rounded-2xl" />
              </div>

              {/* Footer Skeleton */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/40">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <Card className="w-full max-w-lg border-dashed border-2 border-border/60 bg-muted/5 dark:bg-muted/10 rounded-3xl shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-12">
            <div className="h-24 w-24 bg-muted/50 dark:bg-muted/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-background">
              <User className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">{t("ADMIN_VALIDATION.WORKERS.EMPTY_TITLE")}</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              {t("ADMIN_VALIDATION.WORKERS.EMPTY_DESC")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return {
          color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
          icon: CheckCircle2,
          label: t("COMMON.STATUS.VERIFIED")
        };
      case "REJECTED":
        return {
          color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-500/20",
          icon: XCircle,
          label: t("COMMON.STATUS.REJECTED")
        };
      default:
        return {
          color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20",
          icon: Clock,
          label: t("COMMON.STATUS.PENDING")
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {workers.map((worker) => {
        const initials = `${worker.firstName?.[0] || ""}${worker.lastName?.[0] || ""}`;
        const fullName = `${worker.firstName} ${worker.lastName}`;
        const statusConfig = getStatusConfig(worker.status);
        const StatusIcon = statusConfig.icon;

        return (
          <Card
            key={worker.id}
            className="group border-border/40 shadow-lg shadow-primary/5 bg-card/60 dark:bg-card/40 backdrop-blur-xl hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer flex flex-col"
            onClick={() => onReview(worker)}
          >
            <CardContent className="p-5 flex-1 flex flex-col">
              {/* Header: Avatar, Info & Status */}
              <div className="flex items-start justify-between mb-5 gap-3">
                <div className="flex gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Avatar className="relative h-14 w-14 border-2 border-background shadow-md ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-500 group-hover:scale-105">
                      <AvatarImage
                        src={worker.profilePicture || worker.user?.profilePicture || undefined}
                        alt={fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors truncate leading-tight" title={fullName}>
                      {fullName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1 mt-0.5" title={worker.user?.email}>
                      {worker.user?.email}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 h-7 px-2.5 rounded-full border shadow-sm backdrop-blur-sm transition-colors duration-300",
                    statusConfig.color
                  )}
                >
                  <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{statusConfig.label}</span>
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-muted/40 dark:bg-muted/20 p-3 rounded-2xl border border-border/40 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
                  <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 truncate">
                    {t("ADMIN_VALIDATION.WORKERS.SPECIALITY_LABEL")}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground truncate" title={worker.speciality?.name}>
                    <Briefcase className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">{worker.speciality?.name || "—"}</span>
                  </div>
                </div>

                <div className="bg-muted/40 dark:bg-muted/20 p-3 rounded-2xl border border-border/40 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
                  <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1 truncate">
                    {t("ADMIN_VALIDATION.WORKERS.TABLE.LOCATION")}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground truncate" title={worker.city || undefined}>
                    <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">{worker.city || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg border border-border/30">
                    <FileText className="h-3 w-3 text-primary/60" />
                    {worker.documents?.length || 0} Docs
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(worker.createdAt), "MMM d")}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-105 shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
