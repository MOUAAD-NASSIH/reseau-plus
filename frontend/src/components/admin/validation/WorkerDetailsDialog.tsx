import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Worker } from "@/types/auth.types";

interface WorkerDetailsDialogProps {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (workerId: number) => void;
  onReject: (workerId: number, reason: string) => void;
  onApproveDocument: (documentId: number) => void;
  onRejectDocument: (documentId: number, comment: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isApprovingDocument: boolean;
  isRejectingDocument: boolean;
  processingDocumentId: number | null;
}

export function WorkerDetailsDialog(props: WorkerDetailsDialogProps) {
  const { t } = useTranslation();
  const {
    worker,
    open,
    onOpenChange,
    onApprove,
    onReject,
    onApproveDocument,
    onRejectDocument,
    isApproving,
    isRejecting,
    isApprovingDocument,
    isRejectingDocument,
    processingDocumentId,
  } = props;

  const [rejectReason, setRejectReason] = useState("");
  const [documentRejectComment, setDocumentRejectComment] = useState("");
  const [rejectingDocumentId, setRejectingDocumentId] = useState<number | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!worker) return null;

  const closeDialog = () => {
    setRejectReason("");
    setDocumentRejectComment("");
    setRejectingDocumentId(null);
    setShowRejectForm(false);
    onOpenChange(false);
  };

  const applyReject = () => {
    if (rejectReason.trim()) onReject(worker.id, rejectReason);
  };

  const applyDocReject = (id: number) => {
    if (documentRejectComment.trim()) onRejectDocument(id, documentRejectComment);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <span className="font-bold text-lg">
                  {(worker.firstName?.[0] || "")}{(worker.lastName?.[0] || "")}
                </span>
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold">
                  {worker.firstName} {worker.lastName}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{worker.user?.email}</span>
                  <StatusBadge status={worker.status as any} className="h-5 text-[10px]" />
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("ADMIN_VALIDATION.WORKERS.SPECIALITY_LABEL")}
              </Label>
              <div className="flex items-center gap-2 font-medium">
                <Briefcase className="h-4 w-4 text-primary" />
                {worker.speciality?.name || "—"}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("ADMIN_VALIDATION.WORKERS.TABLE.LOCATION")}
              </Label>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                {worker.city || "—"}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("ADMIN_VALIDATION.WORKERS.TABLE.REGISTERED")}
              </Label>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(worker.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("ADMIN_VALIDATION.WORKERS.STATS.TOTAL")}
              </Label>
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-primary" />
                {worker.documents?.length || 0} {t("ADMIN_VALIDATION.WORKERS.TABLE.DOCS")}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio Section */}
          {worker.bio && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("ADMIN_VALIDATION.WORKERS.BIO_SECTION")}
              </Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {worker.bio}
              </p>
            </div>
          )}

          {worker.bio && <Separator />}

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {t("ADMIN_VALIDATION.WORKERS.DOCUMENTS_SECTION")}
              </Label>
              <Badge variant="outline" className="ml-2">
                {worker.documents?.length || 0}
              </Badge>
            </div>

            <div className="grid gap-3">
              {worker.documents?.map((doc) => {
                const working = processingDocumentId === doc.id;
                const rejecting = rejectingDocumentId === doc.id;
                const isApproved = doc.status === "APPROVED";
                const isRejected = doc.status === "REJECTED";

                return (
                  <Card key={doc.id} className="overflow-hidden border-border/60 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isApproved && (
                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("ADMIN_DASHBOARD.PENDING_DOCS.APPROVE")}
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("ADMIN_DASHBOARD.PENDING_DOCS.REJECT")}
                            </Badge>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                            title={t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Action Buttons for Pending Docs */}
                      {doc.status === "PENDING" && !rejecting && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                            onClick={() => onApproveDocument(doc.id)}
                            disabled={working || isApprovingDocument}
                          >
                            {working && isApprovingDocument ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <CheckCircle className="h-3.5 w-3.5 mr-2" />}
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.APPROVE")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                            onClick={() => setRejectingDocumentId(doc.id)}
                            disabled={working}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-2" />
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.REJECT")}
                          </Button>
                        </div>
                      )}

                      {/* Rejection Form */}
                      {rejecting && (
                        <div className="mt-4 space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                          <Label className="text-xs font-semibold text-red-600">
                            {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.REJECT_COMMENT")}
                          </Label>
                          <Textarea
                            className="min-h-[60px] text-sm bg-background resize-none focus-visible:ring-red-500/20"
                            placeholder={t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
                            value={documentRejectComment}
                            onChange={(e) => setDocumentRejectComment(e.target.value)}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setRejectingDocumentId(null)}
                            >
                              {t("ADMIN_VALIDATION.WORKERS.DIALOG.CANCEL")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={!documentRejectComment.trim() || isRejectingDocument}
                              onClick={() => applyDocReject(doc.id)}
                            >
                              {isRejectingDocument && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                              {t("ADMIN_VALIDATION.WORKERS.DIALOG.CONFIRM_REJECT")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {(!worker.documents || worker.documents.length === 0) && (
                <div className="py-8 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  <FileText className="h-8 w-8 mx-auto opacity-20 mb-2" />
                  <p className="text-sm">{t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_TITLE")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/5">
          {!showRejectForm ? (
            <div className="flex w-full justify-between gap-4">
              <Button
                variant="ghost"
                onClick={closeDialog}
              >
                {t("COMMON.CANCEL")}
              </Button>
              <div className="flex gap-2">
                {(worker.status === 'PENDING' || worker.status === 'VERIFIED') && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectForm(true)}
                  >
                    {t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_BTN")}
                  </Button>
                )}
                {(worker.status === 'PENDING' || worker.status === 'REJECTED') && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onApprove(worker.id)}
                    disabled={isApproving}
                  >
                    {isApproving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t("ADMIN_VALIDATION.WORKERS.DIALOG.APPROVE_BTN")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <Label className="text-destructive font-medium">
                {t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
              </Label>
              <Textarea
                className="min-h-[100px] resize-none"
                placeholder={t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowRejectForm(false)}
                >
                  {t("ADMIN_VALIDATION.WORKERS.DIALOG.CANCEL")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={!rejectReason.trim() || isRejecting}
                  onClick={applyReject}
                >
                  {isRejecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t("ADMIN_VALIDATION.WORKERS.DIALOG.CONFIRM_REJECT")}
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
