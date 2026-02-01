import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FileText,
    Eye,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    Download,
    Loader2,
    Clock,
    ShieldCheck,
    FileCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "APPROVED":
                return {
                    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
                    icon: CheckCircle2,
                    label: t("PENDING_DOCS.APPROVE")
                };
            case "REJECTED":
                return {
                    color: "bg-red-500/10 text-red-600 border-red-200/50",
                    icon: XCircle,
                    label: t("PENDING_DOCS.REJECT")
                };
            default:
                return {
                    color: "bg-amber-500/10 text-amber-600 border-amber-200/50",
                    icon: Clock,
                    label: t("COMMON.STATUS.PENDING")
                };
        }
    };

    const statusConfig = getStatusConfig(document.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-5xl max-h-[95vh] h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col p-0 gap-0 border-0 shadow-2xl bg-background/95 backdrop-blur-xl">

                {/* Header Section */}
                <div className="shrink-0 relative overflow-hidden bg-muted/30 border-b border-border/40 p-6 flex items-center justify-between">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-4 relative z-10 w-full overflow-hidden">
                        <div className="h-14 w-14 shrink-0 rounded-2xl bg-background shadow-sm border border-border/50 flex items-center justify-center text-primary">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="text-xl font-bold tracking-tight text-foreground truncate">
                                {document.title || getDocumentTypeLabel(document.type)}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 border shadow-sm backdrop-blur-sm", statusConfig.color)}>
                                    <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{statusConfig.label}</span>
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    ID: #{document.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
                    {/* Left Panel: Preview (or placeholder) */}
                    <div className="flex-1 bg-muted/10 p-6 overflow-y-auto border-r border-border/40 relative min-h-[300px] flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="h-24 w-24 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm border border-border/50">
                                <FileCheck className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.TITLE")}</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                    {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.SUBTITLE")}
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(document.fileUrl, "_blank")}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const link = window.document.createElement("a");
                                        link.href = document.fileUrl;
                                        link.download = `${document.type}_${document.id}`;
                                        link.click();
                                    }}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    {t("ADMIN_VALIDATION.DOCUMENTS.CARD.DOWNLOAD")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Metadata & Actions */}
                    <div className="w-full md:w-[320px] bg-background flex flex-col md:border-l border-border/40">
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                {/* Worker Info */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" />
                                        {t("ADMIN_VALIDATION.DOCUMENTS.CARD.WORKER_ID")}
                                    </h4>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {document.worker ? document.worker.firstName[0] : "#"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">
                                                {document.worker
                                                    ? `${document.worker.firstName} ${document.worker.lastName}`
                                                    : `Worker #${document.workerId}`
                                                }
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {document.worker?.user?.email || "No email"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Date */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {t("ADMIN_VALIDATION.DOCUMENTS.CARD.UPLOADED")}
                                    </h4>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                        <p className="font-medium text-sm text-foreground">
                                            {new Date(document.uploadedAt).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {new Date(document.uploadedAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Previous Comment */}
                                {document.adminComment && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.PREVIOUS_COMMENT")}
                                        </h4>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-500/20 text-sm text-amber-900 dark:text-amber-200">
                                            {document.adminComment}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Sticky Footer Actions */}
                        <div className="p-6 border-t border-border/40 bg-muted/5 space-y-4">
                            {showRejectForm ? (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="rejectComment" className="text-destructive font-bold text-xs uppercase">{t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.REJECT_COMMENT")}</Label>
                                        <Textarea
                                            id="rejectComment"
                                            placeholder={t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
                                            value={rejectComment}
                                            onChange={(e) => setRejectComment(e.target.value)}
                                            className="min-h-[80px] text-sm resize-none bg-background focus:ring-destructive/20 border-destructive/30"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setShowRejectForm(false)}
                                        >
                                            {t("ADMIN_VALIDATION.WORKERS.DIALOG.CANCEL")}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleReject}
                                            disabled={!rejectComment.trim() || isRejecting}
                                            className="flex-1"
                                        >
                                            {isRejecting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
                                            {t("ADMIN_VALIDATION.WORKERS.DIALOG.CONFIRM_REJECT")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {document.status === 'PENDING' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowRejectForm(true)}
                                                className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/60 hover:text-destructive"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                {t("ADMIN_VALIDATION.DOCUMENTS.CARD.REJECT")}
                                            </Button>
                                            <Button
                                                onClick={() => onApprove(document.id)}
                                                disabled={isApproving}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                            >
                                                {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                                {t("ADMIN_VALIDATION.DOCUMENTS.CARD.APPROVE")}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={handleClose}
                                        >
                                            {t("COMMON.CLOSE")}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
