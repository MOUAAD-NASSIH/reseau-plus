import { User, Check, Briefcase, MapPin, Calendar, X, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkerRating } from "@/components/common/WorkerRating";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { MissionApplication } from "@/types/application.types";

interface ApplicantProfileDialogProps {
    application: MissionApplication | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isAccepting: boolean;
    isRejecting: boolean;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
}

export function ApplicantProfileDialog({
    application,
    open,
    onOpenChange,
    isAccepting,
    isRejecting,
    onAccept,
    onReject
}: ApplicantProfileDialogProps) {
    const { t } = useTranslation();

    if (!application || !application.worker) return null;

    const worker = application.worker;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-none shadow-2xl p-0">
                <div className="space-y-0">
                    {/* Dialog Header with Pattern */}
                    <div className="relative p-8 bg-muted/20 border-b border-border/50">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                <User className="w-32 h-32 text-primary rotate-12" />
                        </div>
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 ring-4 ring-background shadow-lg">
                                    <User className="h-12 w-12 text-primary" />
                                </div>
                                {worker.status === "VERIFIED" && (
                                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-background shadow-lg">
                                        <Check className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {worker.firstName} {worker.lastName}
                                    </h3>
                                    <StatusBadge status={worker.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                        <WorkerRating workerId={worker.id} showLabel={true} />
                                    {worker.speciality && (
                                        <div className="flex items-center text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md">
                                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                            {worker.speciality.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Details Grid */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 opacity-60" />
                                    {t("MISSION_APPLICANTS.DIALOG.EXPERIENCE")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {worker.experienceYears || "0"} Years
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 opacity-60" />
                                    {t("MISSION_APPLICANTS.DIALOG.LOCATION")}
                                </p>
                                <p className="text-lg font-bold text-foreground truncate">{worker.city || "N/A"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                    {t("MISSION_APPLICANTS.DIALOG.APPLIED")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {format(new Date(application.appliedAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>

                        {/* Bio */}
                        {worker.bio && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                                    {t("MISSION_APPLICANTS.DIALOG.BIO")}
                                </p>
                                <p className="text-sm text-foreground/80 leading-relaxed font-normal">{worker.bio}</p>
                            </div>
                        )}

                        {/* Domains */}
                        {worker.domains && worker.domains.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                                    {t("MISSION_APPLICANTS.DIALOG.DOMAINS")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {worker.domains.map((wd: { id: number; domain?: { name: string } }) => (
                                        <Badge key={wd.id} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none text-xs font-medium">
                                            {wd.domain?.name || "Domain"}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions Footer */}
                    {application.status === "SUBMITTED" && (
                        <div className="flex flex-col sm:flex-row justify-end gap-3 p-8 border-t border-border/50 bg-muted/10">
                            <Button
                                variant="ghost"
                                onClick={() => onReject(application.id)}
                                disabled={isRejecting}
                                className="w-full sm:w-auto text-destructive hover:bg-destructive/10 font-bold"
                            >
                                {isRejecting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4 mr-2" />
                                )}
                                {t("MISSION_APPLICANTS.DIALOG.REJECT_APPLICATION")}
                            </Button>
                            <Button
                                onClick={() => onAccept(application.id)}
                                disabled={isAccepting}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold px-8 rounded-lg"
                            >
                                {isAccepting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                {t("MISSION_APPLICANTS.DIALOG.ACCEPT_APPLICATION")}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
