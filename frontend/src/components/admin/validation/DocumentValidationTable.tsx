import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileText, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import type { WorkerDocument } from "@/types/auth.types";

interface DocumentValidationTableProps {
  documents: WorkerDocument[];
  isLoading: boolean;
  onView: (document: WorkerDocument) => void;
}

export function DocumentValidationTable({
  documents,
  isLoading,
  onView,
}: DocumentValidationTableProps) {
  const { t } = useTranslation();

   const getDocumentTypeLabel = (type: string) => {
      const key = `PENDING_DOCS.TYPE_${type}`;
      const label = t(key);
      return label !== key ? label : type;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
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
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[200px]">{t("ADMIN_VALIDATION.DOCUMENTS.TYPE_FILTER")}</TableHead>
            <TableHead>{t("ADMIN_VALIDATION.DOCUMENTS.CARD.WORKER_ID")}</TableHead>
            <TableHead>{t("ADMIN_VALIDATION.DOCUMENTS.CARD.UPLOADED")}</TableHead>
            <TableHead>{t("ADMIN_VALIDATION.WORKERS.TABLE.STATUS")}</TableHead>
            <TableHead className="text-right">{t("ADMIN_VALIDATION.WORKERS.TABLE.ACTIONS")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="h-4 w-4" />
                      </div>
                      {getDocumentTypeLabel(doc.type)}
                  </div>
              </TableCell>
              <TableCell>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {doc.worker 
                          ? `${doc.worker.firstName} ${doc.worker.lastName}`
                          : `#${doc.workerId}`
                      }
                  </div>
              </TableCell>
              <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(doc)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
