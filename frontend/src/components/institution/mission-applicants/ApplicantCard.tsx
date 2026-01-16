import { User, Check, Briefcase, Star, MapPin, Clock, Eye, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkerRating } from "@/components/common/WorkerRating";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { MissionApplication } from "@/types/application.types";

interface ApplicantCardProps {
    application: MissionApplication;
    isProcessing: boolean;
    onViewProfile: (app: MissionApplication) => void;
    onReject: (id: number) => void;
    onAccept: (id: number) => void;
}

export function ApplicantCard({ application, isProcessing, onViewProfile, onReject, onAccept }: ApplicantCardProps) {
    const { t } = useTranslation();
    const worker = application.worker;
    const canProcess = application.status === "SUBMITTED";

    return (
        <Card className="border-border/60 bg-card hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                    {/* Left Panel: Avatar */}
                    <div className="md:w-32 bg-muted/20 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border/60">
                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                            {worker?.status === "VERIFIED" && (
                                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background shadow-md">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Panel: Info */}
                    <div className="flex-1 p-6 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                        {worker?.firstName} {worker?.lastName}
                                    </h3>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2">
                                        {t("MISSION_APPLICANTS.CARD.EXCELLENT_MATCH")}
                                    </Badge>
                                </div>
                                {worker?.speciality && (
                                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                                        <Briefcase className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                        {worker.speciality.name}
                                    </p>
                                )}
                            </div>
                            <div className="shrink-0">
                                <StatusBadge status={application.status} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            {worker?.experienceYears && (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 group-hover:bg-muted/60 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                                        <Briefcase className="h-4 w-4 text-chart-1" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Exp.</p>
                                        <p className="text-xs font-bold text-foreground truncate">
                                            {worker.experienceYears} Years
                                        </p>
                                    </div>
                                </div>
                            )}
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 group-hover:bg-muted/60 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                                        <Star className="h-4 w-4 text-chart-4" />
                                    </div>
                                    <div className="min-w-0 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-1">{t("MISSION_DETAILS.RATING")}</p>
                                        <WorkerRating workerId={worker!.id} showLabel={true} className="p-0 border-none bg-transparent h-auto" />
                                    </div>
                                </div>
                            {worker?.city && (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 group-hover:bg-muted/60 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-chart-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{t("MISSION_APPLICANTS.DIALOG.LOCATION")}</p>
                                        <p className="text-xs font-bold text-foreground truncate">{worker.city}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 group-hover:bg-muted/60 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{t("MISSION_APPLICANTS.DIALOG.APPLIED")}</p>
                                    <p className="text-xs font-bold text-foreground">
                                        {format(new Date(application.appliedAt), "MMM d")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewProfile(application)}
                                className="h-9 px-4 border-border/60 bg-transparent hover:bg-muted text-foreground font-semibold rounded-lg"
                            >
                                <Eye className="h-4 w-4 mr-2 opacity-70" />
                                {t("MISSION_APPLICANTS.ACTIONS.VIEW_PROFILE")}
                            </Button>
                            <div className="flex-1" />
                            {canProcess && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onReject(application.id)}
                                        disabled={isProcessing}
                                        className="h-9 px-4 text-destructive hover:bg-destructive/10 font-bold"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <X className="h-4 w-4 mr-2" />
                                                {t("MISSION_APPLICANTS.ACTIONS.REJECT")}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onAccept(application.id)}
                                        disabled={isProcessing}
                                        className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold rounded-lg transition-all hover:scale-[1.02]"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                {t("MISSION_APPLICANTS.ACTIONS.ACCEPT")}
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
