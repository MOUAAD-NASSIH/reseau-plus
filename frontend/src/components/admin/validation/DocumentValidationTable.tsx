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
import { Eye, FileText, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="rounded-3xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border/60 bg-muted/10 py-16 rounded-3xl">
        <CardContent className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-black text-foreground">{t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_TITLE")}</h3>
          <p className="text-muted-foreground/80 mt-1 max-w-sm text-sm">
            {t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_DESC")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/40">
            <TableHead className="w-[30%] pl-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("ADMIN_VALIDATION.DOCUMENTS.TYPE_FILTER")}
            </TableHead>
            <TableHead className="w-[25%] py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("ADMIN_VALIDATION.DOCUMENTS.CARD.WORKER_ID")}
            </TableHead>
            <TableHead className="w-[20%] py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("ADMIN_VALIDATION.DOCUMENTS.CARD.UPLOADED")}
            </TableHead>
            <TableHead className="w-[15%] py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("ADMIN_VALIDATION.WORKERS.TABLE.STATUS")}
            </TableHead>
            <TableHead className="text-right pr-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("ADMIN_VALIDATION.WORKERS.TABLE.ACTIONS")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 group cursor-pointer"
              onClick={() => onView(doc)}
            >
              <TableCell className="pl-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm">
                      {doc.title || getDocumentTypeLabel(doc.type)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {getDocumentTypeLabel(doc.type)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Avatar className="h-6 w-6 border border-border/50">
                    <AvatarImage src={doc.worker?.user?.profilePicture || undefined} alt={doc.worker?.firstName} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {doc.worker?.firstName?.[0] || "#"}
                    </AvatarFallback>
                  </Avatar>
                  {doc.worker
                    ? `${doc.worker.firstName} ${doc.worker.lastName}`
                    : `#${doc.workerId}`
                  }
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary/60" />
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-right pr-6 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
