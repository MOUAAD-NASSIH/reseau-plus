import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Eye, MapPin, Calendar, FileText, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Worker } from "@/types/auth.types";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkerValidationGridProps {
  workers: Worker[];
  isLoading: boolean;
  onReview: (worker: Worker) => void;
}

export function WorkerValidationGrid({ workers, isLoading, onReview }: WorkerValidationGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-border/40 overflow-hidden rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border/60 bg-muted/10 py-20 rounded-3xl">
        <CardContent className="flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mb-6 shadow-inner">
             <User className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-black text-foreground">{t("ADMIN_VALIDATION.WORKERS.EMPTY_TITLE")}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            {t("ADMIN_VALIDATION.WORKERS.EMPTY_DESC")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {workers.map((worker) => (
        <Card
          key={worker.id}
          className="group border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer flex flex-col"
          onClick={() => onReview(worker)}
        >
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-lg border border-primary/20 shadow-md group-hover:scale-105 transition-transform duration-500">
                    {(worker.firstName?.[0] || "") + (worker.lastName?.[0] || "")}
                  </div>
                  <div className="absolute -bottom-1 -right-1 ring-4 ring-card rounded-full overflow-hidden">
                     <StatusBadge status={worker.status as any} className="h-5 w-5 p-0 flex items-center justify-center border-none" hideText />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-foreground text-lg group-hover:text-primary transition-colors truncate" title={`${worker.firstName} ${worker.lastName}`}>
                    {worker.firstName} {worker.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 opacity-70 truncate" title={worker.user?.email}>
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{worker.user?.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 group-hover:bg-primary/5 transition-colors overflow-hidden">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60 truncate">
                   {t("ADMIN_VALIDATION.WORKERS.SPECIALITY_LABEL")}
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-foreground truncate" title={worker.speciality?.name}>
                   <Briefcase className="h-3 w-3 text-primary/60 flex-shrink-0" />
                   <span className="truncate">{worker.speciality?.name || "—"}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 group-hover:bg-primary/5 transition-colors overflow-hidden">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60 truncate">
                   {t("ADMIN_VALIDATION.WORKERS.TABLE.LOCATION")}
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-foreground truncate" title={worker.city || undefined}>
                   <MapPin className="h-3 w-3 text-primary/60 flex-shrink-0" />
                   <span className="truncate">{worker.city || "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
               <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/40 rounded-xl border border-border/40 text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                     <FileText className="h-3 w-3 text-primary/60 flex-shrink-0" />
                     {worker.documents?.length || 0}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/40 rounded-xl border border-border/40 text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                     <Calendar className="h-3 w-3 text-primary/60 flex-shrink-0" />
                     {format(new Date(worker.createdAt), "MMM d, yyyy")}
                  </div>
               </div>

               <Button
                 variant="ghost"
                 size="sm"
                 className="h-10 w-10 rounded-2xl bg-primary/10 text-primary hover:bg-primary transition-all duration-500 group-hover:scale-110 shadow-lg shadow-primary/10 flex-shrink-0"
               >
                 <Eye className="h-5 w-5" />
               </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
