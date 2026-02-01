import { FileText, Calendar, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkerDocument } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface DocumentValidationGridProps {
  documents: WorkerDocument[];
  isLoading: boolean;
  onView: (document: WorkerDocument) => void;
}

export function DocumentValidationGrid({
  documents,
  isLoading,
  onView,
}: DocumentValidationGridProps) {
  const { t } = useTranslation();

  const getDocumentTypeLabel = (type: string) => {
    const key = `PENDING_DOCS.TYPE_${type}`;
    const label = t(key);
    return label !== key ? label : type;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
          icon: CheckCircle2,
          label: t("PENDING_DOCS.APPROVE")
        };
      case "REJECTED":
        return {
          color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-500/20",
          icon: XCircle,
          label: t("PENDING_DOCS.REJECT")
        };
      default:
        return {
          color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20",
          icon: Clock,
          label: t("COMMON.STATUS.PENDING")
        };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-border/40 overflow-hidden rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl h-full">
            <CardContent className="p-5 flex flex-col h-full space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-4 mt-auto border-t border-border/40">
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <Card className="w-full max-w-lg border-dashed border-2 border-border/60 bg-muted/5 dark:bg-muted/10 rounded-3xl shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-12">
            <div className="h-24 w-24 bg-muted/50 dark:bg-muted/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-background">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">{t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_TITLE")}</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              {t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_DESC")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {documents.map((doc) => {
        const statusConfig = getStatusConfig(doc.status);
        const StatusIcon = statusConfig.icon;

        return (
          <Card
            key={doc.id}
            className="group border-border/40 shadow-lg shadow-primary/5 bg-card/60 dark:bg-card/40 backdrop-blur-xl hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer flex flex-col"
          >
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-300 shadow-inner">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 h-6 px-2.5 rounded-full border shadow-sm backdrop-blur-sm transition-colors duration-300",
                    statusConfig.color
                  )}
                >
                  <StatusIcon className="h-3 w-3 mr-1.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{statusConfig.label}</span>
                </Badge>
              </div>

              <div className="space-y-1 mb-6 flex-1">
                <h3 className="font-bold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors" title={doc.title || getDocumentTypeLabel(doc.type)}>
                  {doc.title || getDocumentTypeLabel(doc.type)}
                </h3>

                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Avatar className="h-5 w-5 border border-border/50">
                      {/* Assuming doc.worker has profilePicture, if not we fallback. I should check Worker type but standard Avatar usage is safe. */}
                      <AvatarImage src={doc.worker?.user?.profilePicture || undefined} alt={doc.worker?.firstName} />
                      <AvatarFallback className="text-[8px] font-bold">
                        {doc.worker?.firstName?.[0] || "#"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {doc.worker
                        ? `${doc.worker.firstName} ${doc.worker.lastName}`
                        : `Worker #${doc.workerId}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground ml-1">
                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex gap-2 mt-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-all duration-300"
                  onClick={() => onView(doc)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
