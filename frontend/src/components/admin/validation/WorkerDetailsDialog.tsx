import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  Briefcase,
  Loader2,
  User,
  Award,
  Clock,
  X,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Worker } from "@/types/auth.types";
import { WorkerRating } from "@/components/common/WorkerRating";

interface WorkerDetailsDialogProps {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (workerId: number) => void;
  onReject: (workerId: number, reason: string) => void;
  onApproveDocument: (documentId: number) => void;
  onRejectDocument: (documentId: number, comment: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  isApprovingDocument: boolean;
  isRejectingDocument: boolean;
  processingDocumentId: number | null;
}

export function WorkerDetailsDialog(props: WorkerDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

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

  const applyDocReject = async (id: number) => {
    if (documentRejectComment.trim()) {
      await onRejectDocument(id, documentRejectComment);
      setRejectingDocumentId(null);
      setDocumentRejectComment("");
    }
  };

  const profilePic = worker.profilePicture || worker.user?.profilePicture;

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent showCloseButton={false} className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl">
        <div className="flex flex-col h-full max-h-[90vh]">

          {/* Header Section */}
          <div className="relative shrink-0">
            {/* Background Pattern/Gradient */}
            <div className="h-32 bg-linear-to-r from-primary/10 via-primary/5 to-background border-b border-border/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <User className="w-64 h-64 rotate-12" />
              </div>
            </div>

            {/* Profile Info Overlay */}
            <div className="px-4 sm:px-8 -mt-12 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 relative z-10 pb-6 border-b border-border/40 text-center sm:text-left">

              {/* Avatar */}
              <div className="relative group shrink-0">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl rounded-2xl cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage
                    src={profilePic || undefined}
                    alt={`${worker.firstName} ${worker.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground rounded-2xl">
                    {worker.firstName?.[0]}{worker.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {(worker.status === 'VERIFIED') && (
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center ring-4 ring-background shadow-lg">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground stroke-2" />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 pb-1 space-y-2 sm:space-y-1 w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold font-spline text-foreground truncate max-w-[200px] sm:max-w-none">
                    {worker.firstName} {worker.lastName}
                  </h2>
                  <StatusBadge status={worker.status as any} className="h-6" />
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-muted-foreground text-sm sm:text-base">
                  {worker.speciality && (
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {worker.speciality.name}
                    </div>
                  )}
                  <span className="hidden sm:inline text-border/60">|</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {worker.city || t("COMMON.N_A")}
                  </div>
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
            <div className="p-4 sm:p-8 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_260px]">

              {/* Left Column (Main Content) */}
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">

                {/* Bio Section */}
                {worker.bio && (
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("ADMIN_VALIDATION.WORKERS.BIO_SECTION")}
                    </h3>
                    <div className="p-4 rounded-xl sm:rounded-2xl bg-background border border-border/50 shadow-sm">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line text-justify sm:text-left">
                        {worker.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Documents & Validation Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("ADMIN_VALIDATION.WORKERS.DOCUMENTS_SECTION")}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {worker.documents?.length || 0}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {worker.documents?.map((doc) => {
                      const working = processingDocumentId === doc.id;
                      const rejecting = rejectingDocumentId === doc.id;
                      const isApproved = doc.status === "APPROVED";
                      const isRejected = doc.status === "REJECTED";

                      return (
                        <div key={doc.id} className={cn(
                          "p-3 sm:p-4 rounded-xl bg-background border shadow-sm transition-colors relative overflow-hidden",
                          isApproved ? "border-emerald-200 bg-emerald-50/20" :
                            isRejected ? "border-red-200 bg-red-50/20" :
                              "border-border/50 hover:border-primary/30"
                        )}>
                          {/* Document Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "p-2 rounded-lg transition-colors shrink-0",
                                isApproved ? "bg-emerald-100 text-emerald-600" :
                                  isRejected ? "bg-red-100 text-red-600" :
                                    "bg-primary/10 text-primary"
                              )}>
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-foreground truncate">
                                  {doc.title || doc.type} <span className="text-muted-foreground font-normal text-xs ml-1">• {new Date(doc.uploadedAt).toLocaleDateString(dateLocale.code)}</span>
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {isApproved && (
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-0 h-5 text-[10px]">
                                      <CheckCircle className="h-3 w-3 mr-1" /> {t("ADMIN_DASHBOARD.PENDING_DOCS.APPROVE")}
                                    </Badge>
                                  )}
                                  {isRejected && (
                                    <Badge variant="destructive" className="h-5 text-[10px]">
                                      <XCircle className="h-3 w-3 mr-1" /> {t("ADMIN_DASHBOARD.PENDING_DOCS.REJECT")}
                                    </Badge>
                                  )}
                                  {(!isApproved && !isRejected) && (
                                    <Badge variant="outline" className="h-5 text-[10px] bg-muted/50 text-muted-foreground border-border/50">
                                      {t("COMMON.STATUS.PENDING")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                              title={t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Action Buttons (Only if Pending) */}
                          {doc.status === "PENDING" && !rejecting && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg font-bold text-xs"
                                onClick={() => onApproveDocument(doc.id)}
                                disabled={working || isApprovingDocument}
                              >
                                {working && isApprovingDocument ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                {t("ADMIN_DASHBOARD.PENDING_DOCS.APPROVE")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9 rounded-lg font-bold text-xs"
                                onClick={() => setRejectingDocumentId(doc.id)}
                                disabled={working}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                {t("ADMIN_DASHBOARD.PENDING_DOCS.REJECT")}
                              </Button>
                            </div>
                          )}

                          {/* Rejection Form */}
                          {rejecting && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-1">
                              <Label className="text-xs font-semibold text-red-600 mb-1.5 block">
                                {t("ADMIN_VALIDATION.DOCUMENTS.DIALOG.REJECT_COMMENT")}
                              </Label>
                              <Textarea
                                className="min-h-[60px] text-sm mb-2 bg-background resize-none focus-visible:ring-red-500/20 placeholder:opacity-55"
                                placeholder={t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_REASON")}
                                value={documentRejectComment}
                                onChange={(e) => setDocumentRejectComment(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setRejectingDocumentId(null)}
                                >
                                  {t("ADMIN_VALIDATION.WORKERS.DIALOG.CANCEL")}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={!documentRejectComment.trim() || isRejectingDocument}
                                  onClick={() => applyDocReject(doc.id)}
                                >
                                  {isRejectingDocument && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                  {t("ADMIN_VALIDATION.WORKERS.DIALOG.CONFIRM_REJECT")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(!worker.documents || worker.documents.length === 0) && (
                      <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/60">
                        <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground font-medium text-sm">
                          {t("ADMIN_VALIDATION.DOCUMENTS.EMPTY_TITLE")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Section (If available) */}
                {(worker.experiences && worker.experiences.length > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      {t("MISSION_APPLICANTS.DIALOG.EXPERIENCE") || "Experiences"}
                    </h3>
                    <div className="relative border-l-2 border-border/50 ml-3.5 space-y-6 sm:space-y-8 py-2">
                      {worker.experiences.map((exp, index) => (
                        <div key={exp.id || index} className="pl-6 sm:pl-8 relative group">
                          <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors" />
                          <div className="bg-background rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-bold text-foreground text-sm sm:text-base">{exp.jobTitle}</h4>
                                <p className="text-xs sm:text-sm font-medium text-primary">{exp.organization}</p>
                              </div>
                              <div className="flex items-center text-[10px] sm:text-xs font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md h-fit whitespace-nowrap w-fit">
                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                                {format(new Date(exp.startDate), "MMM yyyy")} - {exp.endDate ? format(new Date(exp.endDate), "MMM yyyy") : t("COMMON.STATUS.ONGOING") || "Present"}
                              </div>
                            </div>
                            {exp.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border/30 border-dashed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-6 order-1 lg:order-2">
                {/* Quick Stats Card */}
                <div className="rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden p-0">
                  <div className="p-3 sm:p-4 bg-muted/30 border-b border-border/40">
                    <h4 className="font-bold text-sm">{t("MISSION_APPLICANTS.DIALOG.OVERVIEW") || "Overview"}</h4>
                  </div>
                  <div className="divide-y divide-border/40">
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("MISSION_APPLICANTS.DIALOG.EXPERIENCE") || "Experience"}
                      </div>
                      <span className="font-bold text-sm text-foreground whitespace-nowrap">
                        {t("MISSION_APPLICANTS.FILTER.YEARS_plural", { count: worker.experienceYears || 0 }) || `${worker.experienceYears || 0} years`}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("MISSION_APPLICANTS.DIALOG.SCORE") || "Score"}
                      </div>
                      <div className="whitespace-nowrap scale-90 sm:scale-100 origin-right">
                        <WorkerRating workerId={worker.id} showLabel={false} className="border-none p-0 h-auto" />
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                        {t("ADMIN_VALIDATION.WORKERS.TABLE.REGISTERED")}
                      </div>
                      <span className="font-medium text-sm text-foreground whitespace-nowrap">
                        {format(new Date(worker.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Domains */}
                {worker.domains && worker.domains.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" />
                      {t("MISSION_APPLICANTS.DIALOG.DOMAINS") || "Domains"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.domains.map((wd) => (
                        <Badge key={wd.id} variant="secondary" className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-background border border-border/60 hover:bg-muted font-medium text-[10px] sm:text-xs">
                          {wd.domain?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 p-3 sm:p-6 bg-background border-t border-border/50 flex flex-col gap-4">
            {!showRejectForm ? (
              <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 sm:gap-4">
                <Button variant="ghost" onClick={closeDialog} className="w-full sm:w-auto">
                  {t("COMMON.CANCEL")}
                </Button>
                <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                  {(worker.status === 'PENDING' || worker.status === 'VERIFIED') && (
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 sm:flex-none sm:min-w-[120px] font-bold border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50 h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
                    >
                      {t("ADMIN_VALIDATION.WORKERS.DIALOG.REJECT_BTN")}
                    </Button>
                  )}
                  {(worker.status === 'PENDING' || worker.status === 'REJECTED') && (
                    <Button
                      onClick={() => onApprove(worker.id)}
                      disabled={isApproving}
                      className="flex-1 sm:flex-none sm:min-w-[140px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
                    >
                      {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="flex items-center gap-2"><Check className="h-4 w-4" /> <span>{t("ADMIN_VALIDATION.WORKERS.DIALOG.APPROVE_BTN")}</span></div>}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label className="text-destructive font-black text-xs uppercase tracking-widest">
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
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
