import { Check, Briefcase, Star, MapPin, Clock, Eye, X, Loader2, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkerRating } from "@/components/common/WorkerRating";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { MissionApplication } from "@/types/application.types";
import { Separator } from "@/components/ui/separator";

interface ApplicantCardProps {
    application: MissionApplication;
    isProcessing: boolean;
    onViewProfile: (app: MissionApplication) => void;
    onReject: (id: number) => void;
    onAccept: (id: number) => void;
}

export function ApplicantCard({ application, isProcessing, onViewProfile, onReject, onAccept }: ApplicantCardProps) {
    const { t, i18n } = useTranslation();
    const worker = application.worker;
    const canProcess = application.status === "SUBMITTED";

    // Format dates safely
    const appliedDate = new Date(application.appliedAt);
    const dateLocale = i18n.language === 'fr' ? fr : enUS;
    const formattedDate = !isNaN(appliedDate.getTime()) ? format(appliedDate, "d MMM yyyy", { locale: dateLocale }) : "N/A";

    return (
        <Card className="group border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 bg-card overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Left Section: Profile & Quick Info */}
                    <div className="flex flex-col items-center p-6 bg-muted/10 md:w-60 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="relative mb-4">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-md ring-1 ring-border/20 group-hover:scale-105 transition-transform duration-300">
                                <AvatarImage src={worker?.profilePicture || worker?.user?.profilePicture || undefined} alt={`${worker?.firstName} ${worker?.lastName}`} className="object-cover" />
                                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                    {worker?.firstName?.[0]}{worker?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            {worker?.status === "VERIFIED" && (
                                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 ring-2 ring-background shadow-sm" title="Verified Worker">
                                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                </div>
                            )}
                        </div>

                        <div className="text-center w-full space-y-1">
                            <h3 className="text-lg font-bold font-spline text-foreground truncate" title={`${worker?.firstName} ${worker?.lastName}`}>
                                {worker?.firstName} {worker?.lastName}
                            </h3>
                            {worker?.speciality && (
                                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-medium">
                                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{worker.speciality.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 w-full text-center">
                            <StatusBadge status={application.status} className="justify-center" />
                        </div>
                    </div>

                    {/* Right Section: Details & Actions */}
                    <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                        <div>
                            {/* Header Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-bold px-2.5 py-0.5">
                                    {t("MISSION_APPLICANTS.CARD.EXCELLENT_MATCH")}
                                </Badge>
                                <div className="flex items-center text-xs text-muted-foreground font-medium bg-muted/30 px-2.5 py-1 rounded-md">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    {t("MISSION_APPLICANTS.CARD.APPLIED_ON")} {formattedDate}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Experience */}
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5" />
                                        {t("MISSION_APPLICANTS.CARD.EXP_LABEL")}
                                    </p>
                                    <p className="font-bold text-sm">
                                        {worker?.experienceYears || 0} {t("MISSION_APPLICANTS.CARD.YEARS")}
                                    </p>
                                </div>
                                {/* Rating */}
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5" />
                                        {t("MISSION_APPLICANTS.CARD.RATING_LABEL")}
                                    </p>
                                    <WorkerRating workerId={worker!.id} showLabel={false} className="p-0 h-auto gap-0.5 border-none" />
                                </div>
                                {/* Location */}
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {t("MISSION_APPLICANTS.CARD.LOCATION_LABEL")}
                                    </p>
                                    <p className="font-bold text-sm truncate" title={worker?.city || "Remote"}>
                                        {worker?.city || "Remote"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4 md:hidden" />

                        {/* Actions Footer */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto pt-2">
                            <Button
                                variant="outline"
                                onClick={() => onViewProfile(application)}
                                className="w-full sm:w-auto font-bold border-border/60 hover:bg-muted/50"
                            >
                                <Eye className="h-4 w-4 mr-2 opacity-70" />
                                {t("MISSION_APPLICANTS.ACTIONS.VIEW_PROFILE")}
                            </Button>

                            <div className="flex-1 hidden sm:block" />

                            {canProcess && (
                                <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => onReject(application.id)}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 font-bold"
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                                        {t("MISSION_APPLICANTS.ACTIONS.REJECT")}
                                    </Button>
                                    <Button
                                        onClick={() => onAccept(application.id)}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                        {t("MISSION_APPLICANTS.ACTIONS.ACCEPT")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
