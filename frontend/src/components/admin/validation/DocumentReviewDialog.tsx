import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Download,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { WorkerDocument } from "@/types/auth.types";

interface DocumentReviewDialogProps {
    document: WorkerDocument | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (documentId: number) => void;
    onReject: (documentId: number, comment: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
}

export function DocumentReviewDialog({
    document,
    open,
    onOpenChange,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
}: DocumentReviewDialogProps) {
    const { t } = useTranslation();
    const [rejectComment, setRejectComment] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!document) return null;

    const handleReject = () => {
        if (rejectComment.trim()) {
            onReject(document.id, rejectComment);
            setRejectComment("");
            setShowRejectForm(false);
        }
    };

    const handleClose = () => {
        setShowRejectForm(false);
        setRejectComment("");
        onOpenChange(false);
    };

    const getDocumentTypeLabel = (type: string) => {
        const key = `PENDING_DOCS.TYPE_${type}`;
        const label = t(key);
        return label !== key ? label : type;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-muted/10">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                             <FileText className="h-4 w-4" />
                        </div>
                        {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.TITLE")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.SUBTITLE")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Document Info */}
                    <div className="grid gap-4 sm:grid-cols-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t("ADMIN_VALIDATION.DOCUMENTS.TYPE_FILTER")}</Label>
                            <p className="font-medium text-foreground">{getDocumentTypeLabel(document.type)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t("ADMIN_VALIDATION.WORKERS.TABLE.STATUS")}</Label>
                            <div>
                                <StatusBadge status={document.status} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {t("ADMIN_VALIDATION.DOCUMENTS.CARD.UPLOADED")}
                            </Label>
                            <p className="font-medium">
                                {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {t("ADMIN_VALIDATION.DOCUMENTS.CARD.WORKER_ID")}
                            </Label>
                            <p className="font-medium flex items-center gap-2 text-foreground">
                                {document.worker ? (
                                    <>
                                        {document.worker.firstName} {document.worker.lastName}
                                    </>
                                ) : (
                                    `#${document.workerId}`
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Document Preview/Download */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">{t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.TITLE")}</Label>
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted/70 transition-colors">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-medium text-sm text-foreground">
                                    {getDocumentTypeLabel(document.type)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")} / {t("ADMIN_VALIDATION.DOCUMENTS.CARD.DOWNLOAD")}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.fileUrl, "_blank")}
                                    className="h-8"
                                >
                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const link = window.document.createElement("a");
                                        link.href = document.fileUrl;
                                        link.download = `${document.type}_${document.id}`;
                                        link.click();
                                    }}
                                    className="h-8"
                                >
                                    <Download className="mr-2 h-3.5 w-3.5" />
                                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.DOWNLOAD")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Previous Admin Comment */}
                    {document.adminComment && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">{t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.PREVIOUS_COMMENT")}</Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
                                {document.adminComment}
                            </p>
                        </div>
                    )}

                    {/* Reject Form */}
                    {showRejectForm && (
                        <div className="space-y-2 p-4 border border-destructive/20 rounded-xl bg-destructive/5 animate-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="rejectComment" className="text-destructive font-medium">{t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.REJECT_COMMENT")}</Label>
                            <Textarea
                                id="rejectComment"
                                placeholder={t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-muted/5">
                    {showRejectForm ? (
                        <div className="flex w-full justify-end gap-2 text-right">
                             <Button
                                variant="ghost"
                                onClick={() => setShowRejectForm(false)}
                            >
                                {t("ADMIN_VALIDATION.WORKERS.DIALOG.CANCEL")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectComment.trim() || isRejecting}
                            >
                                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                                {t("ADMIN_VALIDATION.WORKERS.DIALOG.CONFIRM_REJECT")}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-between gap-4">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                            >
                                {t("COMMON.CANCEL")}
                            </Button>
                            
                            {document.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRejectForm(true)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        {t("ADMIN_VALIDATION.DOCUMENTS.CARD.REJECT")}
                                    </Button>
                                    <Button
                                        onClick={() => onApprove(document.id)}
                                        disabled={isApproving}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        {t("ADMIN_VALIDATION.DOCUMENTS.CARD.APPROVE")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
