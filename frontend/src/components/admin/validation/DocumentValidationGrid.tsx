import { FileText, User, Calendar, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import type { WorkerDocument } from "@/types/auth.types";

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex justify-between">
               <Skeleton className="h-12 w-12 rounded-lg" />
               <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_TITLE")}
        description={t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_DESC")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
        <div
            key={doc.id}
            className="group relative flex flex-col p-5 bg-card border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                    <FileText className="h-6 w-6" />
                </div>
                <StatusBadge status={doc.status} />
            </div>

            <div className="space-y-1 mb-6 flex-1">
                <h3 className="font-semibold text-foreground line-clamp-1">
                    {getDocumentTypeLabel(doc.type)}
                </h3>
                
                <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate">
                            {doc.worker 
                                ? `${doc.worker.firstName} ${doc.worker.lastName}`
                                : `Worker #${doc.workerId}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground group-hover:border-primary/40"
                    onClick={() => onView(doc)}
                >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                </Button>
            </div>
        </div>
      ))}
    </div>
  );
}
