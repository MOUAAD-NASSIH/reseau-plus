import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
    Briefcase,
    Calendar,
    MapPin,
    Building2,
    User,
    X,
    ExternalLink
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import type { MissionAssignment } from "@/types/assignment.types";

interface AssignmentDetailsDialogProps {
    assignment: MissionAssignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssignmentDetailsDialog({
    assignment,
    open,
    onOpenChange,
}: AssignmentDetailsDialogProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === "fr" ? fr : enUS;

    if (!assignment) return null;

    const formatDate = (date: string) => {
        if (!date) return "";
        return format(new Date(date), "dd MMM yyyy", { locale: dateLocale });
    };

    const worker = assignment.worker;
    const mission = assignment.mission;
    const institution = assignment.institution;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] md:max-w-6xl lg:max-w-7xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl flex flex-col"
            >
                {/* Header Section */}
                <div className="relative shrink-0">
                    <div className="h-28 bg-linear-to-r from-blue-600/10 via-primary/5 to-background border-b border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <Briefcase className="w-56 h-56 rotate-12" />
                        </div>
                        <DialogClose className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background transition-colors cursor-pointer">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </DialogClose>
                    </div>

                    <div className="px-6 md:px-8 -mt-10 flex flex-col md:flex-row items-start md:items-end gap-6 relative z-10 pb-6 border-b border-border/40">
                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-background shadow-xl flex items-center justify-center border border-border/50 shrink-0">
                            {institution?.logo ? (
                                <img
                                    src={institution.logo}
                                    alt={institution.institutionName}
                                    className="h-full w-full object-cover rounded-2xl"
                                />
                            ) : (
                                <Building2 className="h-10 w-10 text-primary/60" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold font-spline text-foreground truncate">
                                    {t("ASSIGNMENTS_OVERVIEW.DIALOG.TITLE")}
                                </h2>
                                <StatusBadge status={assignment.status} className="h-6" />
                            </div>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className="font-medium text-foreground">#{assignment.id}</span>
                                <span>•</span>
                                <span>{t("ASSIGNMENTS_OVERVIEW.DIALOG.SUBTITLE", { id: assignment.id })}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Mission Info */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    {t("ASSIGNMENTS_OVERVIEW.DIALOG.SECTIONS.MISSION_INFO")}
                                </h3>
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="font-semibold text-lg">{mission?.title}</h4>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{mission?.location || t("COMMON.REMOTE")}</span>
                                                <span>•</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 rounded-md px-1.5 font-medium">
                                                    {mission?.domains?.[0]?.domain?.name || t("COMMON.SOCIAL_SERVICE")}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {mission?.description && (
                                        <>
                                            <Separator className="bg-border/50" />
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {mission.description}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Worker Info */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <User className="w-5 h-5 text-blue-500" />
                                    {t("ASSIGNMENTS_OVERVIEW.DIALOG.SECTIONS.WORKER_INFO")}
                                </h3>
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                        <AvatarImage src={worker?.profilePicture || worker?.user?.profilePicture || undefined} alt={worker?.firstName} />
                                        <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xl font-bold">
                                            {worker?.firstName?.[0]}{worker?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg">{worker?.firstName} {worker?.lastName}</h4>
                                        <p className="text-sm text-muted-foreground">{worker?.user?.email}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="bg-background text-xs font-normal text-muted-foreground">
                                                {t("COMMON.N_A")}
                                            </Badge>
                                            {worker?.city && (
                                                <Badge variant="outline" className="bg-background text-xs font-normal text-muted-foreground">
                                                    {worker.city}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
                                        <User className="w-4 h-4 mr-2" />
                                        {t("ASSIGNMENTS_OVERVIEW.DIALOG.ACTIONS.VIEW_WORKER_PROFILE")}
                                    </Button>
                                </div>
                            </section>

                        </div>

                        {/* Right Column: Stats & Timeline */}
                        <div className="space-y-6">
                            {/* Timeline Card */}
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    {t("ASSIGNMENTS_OVERVIEW.DIALOG.SECTIONS.TIMELINE")}
                                </h3>

                                <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50 pl-6">
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
                                        <p className="text-xs text-muted-foreground font-medium">{t("ASSIGNMENTS_OVERVIEW.DIALOG.LABELS.ASSIGNED_AT")}</p>
                                        <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
                                    </div>

                                    {mission?.startDate && (
                                        <div className="relative">
                                            <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-background ring-4 ring-background" />
                                            <p className="text-xs text-muted-foreground font-medium">{t("ASSIGNMENTS_OVERVIEW.DIALOG.LABELS.MISSION_PERIOD")}</p>
                                            <p className="font-medium">
                                                {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Institution Card */}
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
                                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                    <Building2 className="w-4 h-4" />
                                    {t("COMMON.INSTITUTION")}
                                </h3>
                                <div>
                                    <p className="font-bold text-lg">{institution?.institutionName}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {institution?.address || t("COMMON.N_A")}
                                    </p>
                                </div>
                                <Button variant="secondary" className="w-full mt-2" size="sm" disabled>
                                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                    {t("ASSIGNMENTS_OVERVIEW.DIALOG.ACTIONS.VIEW_INSTITUTION")}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
