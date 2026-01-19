import { useParams, Link, useNavigate } from "react-router";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    MapPin,
    Calendar,
    CheckCircle,
    Loader2,
    AlertTriangle,
    Clock,
    TrendingUp,
    Users,
    HelpCircle,
    Navigation,
    FileText,
    Phone,
    MessageSquare,
    X,
    Building2,
    DollarSign,
    ChevronRight,
    Shield,
    Award,
    Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import {
    useGetMyApplicationsQuery,
    useApplyToMissionMutation,
    useWithdrawApplicationMutation
} from "@/features/api/endpoints/applicationEndpoints";
import { useLazyGetOrCreateConversationQuery } from "@/features/api/endpoints/messageEndpoints";
import ChatWindow from "@/components/messages/ChatWindow";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/features/api/endpoints/messageEndpoints";

type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';





function getStatusColor(status: string) {
    switch (status) {
        case "OPEN":
            return "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:border-primary/40 transition-colors";
        case "ONGOING":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/40 transition-colors";
        case "CLOSED":
            return "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30 hover:border-gray-500/40 transition-colors";
        case "CANCELLED":
            return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/40 transition-colors";
        default:
            return "bg-muted text-muted-foreground hover:bg-muted/80 transition-colors";
    }
}

function MissionDetailsSkeleton() {
    return (
        <div className="space-y-6 p-4 lg:p-8">
            <Skeleton className="h-12 w-full" />
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-5 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function MissionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");
    const { t, i18n } = useTranslation();

    const getUrgencyConfig = (urgency: string) => {
        const configs = {
            HIGH: {
                label: t("WORKER_MISSION_DETAILS.URGENCY.URGENT"),
                color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/25 hover:border-red-500/40 transition-colors",
                icon: AlertTriangle,
                chipColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
            },
            MEDIUM: {
                label: t("WORKER_MISSION_DETAILS.URGENCY.MODERATE"),
                color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25 hover:border-yellow-500/40 transition-colors",
                icon: TrendingUp,
                chipColor: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/30 transition-colors"
            },
            LOW: {
                label: t("WORKER_MISSION_DETAILS.URGENCY.STANDARD"),
                color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-500/40 transition-colors",
                icon: FileText,
                chipColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-colors"
            },
        };
        return configs[urgency as UrgencyLevel] ?? configs.LOW;
    };

    const { data: missionData, isLoading: missionLoading, error: missionError } = useGetMissionQuery(missionId);
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMyApplicationsQuery();
    const [applyToMission, { isLoading: isApplying }] = useApplyToMissionMutation();
    const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();
    const [getOrCreateConversation] = useLazyGetOrCreateConversationQuery();

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];
    const institution = mission?.institution;

    // Check if already applied
    const existingApplication = applications.find((app) => app.missionId === missionId);
    const isApplied = !!existingApplication;

    const handleApply = async () => {
        try {
            await applyToMission({ missionId }).unwrap();
            showSuccessToast(t("WORKER_MISSION_DETAILS.TOASTS.APPLY_SUCCESS"), t("WORKER_MISSION_DETAILS.TOASTS.APPLY_SUCCESS_DESC"));
        } catch (error) {
            const message = (error as { data?: { message?: string } })?.data?.message || t("WORKER_MISSION_DETAILS.TOASTS.ERROR_DEFAULT");
            showErrorToast(error, message);
        }
    };

    const handleWithdraw = async () => {
        if (!existingApplication) return;

        try {
            await withdrawApplication({ id: existingApplication.id, missionId }).unwrap();
            showSuccessToast(t("WORKER_MISSION_DETAILS.TOASTS.WITHDRAW_SUCCESS"), t("WORKER_MISSION_DETAILS.TOASTS.WITHDRAW_SUCCESS_DESC"));
        } catch (error) {
            const message = (error as { data?: { message?: string } })?.data?.message || t("WORKER_MISSION_DETAILS.TOASTS.ERROR_DEFAULT");
            showErrorToast(error, message);
        }
    };

    const handleSupport = () => {
        showInfoToast(t("WORKER_MISSION_DETAILS.TOASTS.COMING_SOON"), t("WORKER_MISSION_DETAILS.TOASTS.SUPPORT_MSG"));
    };

    const handleCall = () => {
        showInfoToast(t("WORKER_MISSION_DETAILS.TOASTS.COMING_SOON"), t("WORKER_MISSION_DETAILS.TOASTS.CALL_MSG"));
    };

    const handleGetDirections = () => {
        showInfoToast(t("WORKER_MISSION_DETAILS.TOASTS.COMING_SOON"), t("WORKER_MISSION_DETAILS.TOASTS.DIRECTIONS_MSG"));
    };

    const handleOpenChat = async () => {
        if (!institution?.userId) {
            showErrorToast(null, t("WORKER_MISSION_DETAILS.TOASTS.CONTACT_ERROR"));
            return;
        }

        try {
            const conversation = await getOrCreateConversation(institution.userId).unwrap();
            setCurrentConversation(conversation);
            setIsChatOpen(true);
        } catch (error) {
            showErrorToast(error, t("WORKER_MISSION_DETAILS.TOASTS.CHAT_ERROR"));
        }
    };

    if (missionLoading || applicationsLoading) {
        return <MissionDetailsSkeleton />;
    }

    if (missionError || !mission) {
        return (
            <div className="min-h-screen p-4 lg:p-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("WORKER_MISSION_DETAILS.NOT_FOUND.TITLE")}</AlertTitle>
                    <AlertDescription>
                        {t("WORKER_MISSION_DETAILS.NOT_FOUND.DESC")}
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate("/worker/missions")}>
                        {t("WORKER_MISSION_DETAILS.NOT_FOUND.BACK_BTN")}
                    </Button>
                </div>
            </div>
        );
    }

    const urgencyConfig = getUrgencyConfig(mission.urgency);
    const UrgencyIcon = urgencyConfig.icon;

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumbs */}
            <div className="px-4 md:px-6 lg:px-8 pb-4 border-b border-border">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <Link to="/worker" className="text-muted-foreground hover:text-primary transition-colors">
                        {t("WORKER_MISSION_DETAILS.BREADCRUMBS.DASHBOARD")}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link to="/worker/missions" className="text-muted-foreground hover:text-primary transition-colors">
                        {t("WORKER_MISSION_DETAILS.BREADCRUMBS.MISSIONS")}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                        {t("WORKER_MISSION_DETAILS.BREADCRUMBS.MISSION_PREFIX")}{mission.id}
                    </span>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-4 md:px-6 lg:px-8 py-6 lg:py-8 border-b border-border bg-card/30">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge className={cn("flex items-center gap-2 px-3 py-1.5 border text-xs font-bold", getStatusColor(mission.status))}>
                                <span className="size-2 rounded-full bg-current"></span>
                                {t(`WORKER_MISSION_DETAILS.STATUS.${mission.status}`)}
                            </Badge>
                            {isApplied && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-colors">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    {t("WORKER_MISSION_DETAILS.HEADER.APPLIED_BADGE")}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-foreground text-3xl lg:text-4xl font-black font-spline leading-tight tracking-tight mb-3">
                            {mission.title}
                        </h1>

                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Building2 className="h-4 w-4" />
                            <span className="text-base font-medium">{institution?.institutionName}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-sm">{t("WORKER_MISSION_DETAILS.HEADER.REF")}: #{mission.id}-{mission.title?.substring(0, 3).toUpperCase()}</span>
                        </div>

                        {/* Metadata Chips */}
                        <div className="flex flex-wrap gap-2">
                            {mission.urgency && (
                                <Badge variant="outline" className={cn("border px-3 py-1.5 flex items-center gap-1.5", urgencyConfig.chipColor)}>
                                    <UrgencyIcon className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">{urgencyConfig.label}</span>
                                </Badge>
                            )}
                            {mission.location && (
                                <Badge variant="outline" className="border-border px-3 py-1.5 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-xs font-medium">{mission.location}</span>
                                </Badge>
                            )}
                            <Badge variant="outline" className="border-border px-3 py-1.5 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium">{t("WORKER_MISSION_DETAILS.HEADER.PROFESSIONAL_MISSION")}</span>
                            </Badge>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            onClick={handleSupport}
                            className="rounded-full hover:bg-muted hover:border-primary/50 transition-colors"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            {t("WORKER_MISSION_DETAILS.ACTIONS.SUPPORT")}
                        </Button>
                        {isApplied && existingApplication?.status === "SUBMITTED" && (
                            <Button
                                variant="outline"
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 transition-all px-6"
                            >
                                {isWithdrawing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("WORKER_MISSION_DETAILS.ACTIONS.WITHDRAWING")}
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        {t("WORKER_MISSION_DETAILS.ACTIONS.WITHDRAW")}
                                    </>
                                )}
                            </Button>
                        )}
                        {!isApplied && mission.status === "OPEN" && (
                            <Button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/30 px-6 transition-all"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("WORKER_MISSION_DETAILS.ACTIONS.APPLYING")}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {t("WORKER_MISSION_DETAILS.ACTIONS.APPLY")}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-6 lg:py-8">
                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Mission Overview */}
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-foreground text-xl font-bold font-spline mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                {t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.TITLE")}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed font-spline mb-6">
                                {mission.description || t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.DEFAULT_DESC")}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">{t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.START_DATE")}</p>
                                        <p className="text-foreground font-semibold">
                                            {mission.startDate ? new Date(mission.startDate).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' }) : t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.NA")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">{t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.DURATION")}</p>
                                        <p className="text-foreground font-semibold">
                                            {mission.startDate && mission.endDate
                                                ? `${new Date(mission.startDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} - ${new Date(mission.endDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}`
                                                : t("WORKER_MISSION_DETAILS.TABS.OVERVIEW.MULTIPLE_DAYS")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location */}
                    {institution && (
                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-foreground text-xl font-bold font-spline mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {t("WORKER_MISSION_DETAILS.TABS.INSTITUTION.TITLE")}
                                </h2>
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="size-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="font-spline">
                                        <p className="text-foreground font-bold text-lg mb-1">{institution.institutionName}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {institution.address || "Address not provided"}
                                            {institution.city && <><br />{institution.city}</>}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full rounded-full hover:bg-muted hover:border-primary/50 transition-colors"
                                    variant="outline"
                                    onClick={handleGetDirections}
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    {t("WORKER_MISSION_DETAILS.TABS.INSTITUTION.GET_DIRECTIONS")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mission Requirements */}
                    {(mission.requiredSpeciality || (mission.domains && mission.domains.length > 0)) && (
                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-foreground text-xl font-bold font-spline mb-6 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {t("WORKER_MISSION_DETAILS.TABS.REQUIREMENTS.TITLE")}
                                </h2>

                                <div className="space-y-6">
                                    {/* Required Specialty */}
                                    {mission.requiredSpeciality && (
                                        <div>
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-3">{t("WORKER_MISSION_DETAILS.TABS.REQUIREMENTS.REQUIRED_SPECIALTY")}</p>
                                            <Badge
                                                variant="outline"
                                                className="px-3 py-1.5 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors rounded-full font-semibold text-primary"
                                            >
                                                {mission.requiredSpeciality.name}
                                                <span className="text-red-500 ml-1.5">*</span>
                                            </Badge>
                                        </div>
                                    )}

                                    {/* domains */}
                                    {mission.domains && mission.domains.length > 0 && (
                                        <div>
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-3">{t("WORKER_MISSION_DETAILS.TABS.REQUIREMENTS.FOCUS_DOMAINS")}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {mission.domains.map((md) => (
                                                    <Badge
                                                        key={md.id}
                                                        variant="outline"
                                                        className="px-3 py-1.5 text-sm border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                                    >
                                                        {md.domain?.name}
                                                        {md.isRequired && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(mission.requiredSpeciality || mission.domains?.some((md) => md.isRequired)) && (
                                    <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5 pt-4 border-t border-border/50">
                                        <span className="text-red-500 font-bold">*</span>
                                        {t("WORKER_MISSION_DETAILS.TABS.REQUIREMENTS.MANDATORY_MSG")}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Application Status */}
                    {isApplied && (
                        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm -order-1">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold font-spline text-emerald-600 dark:text-emerald-400 mb-1">
                                                    {t("WORKER_MISSION_DETAILS.TABS.APPLICATION_STATUS.SUBMITTED_TITLE")}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {t("WORKER_MISSION_DETAILS.TABS.APPLICATION_STATUS.STATUS_LABEL")} <span className="font-semibold text-foreground">{t(`WORKER_MISSION_DETAILS.STATUS.${existingApplication?.status}`)}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t("WORKER_MISSION_DETAILS.TABS.APPLICATION_STATUS.APPLIED_ON", { date: new Date(existingApplication!.appliedAt).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
                                                </p>
                                            </div>
                                            {existingApplication?.status === "SUBMITTED" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleWithdraw}
                                                    disabled={isWithdrawing}
                                                    className="shrink-0 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors w-full sm:w-auto"
                                                >
                                                    {isWithdrawing ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                                    ) : (
                                                        <X className="h-3.5 w-3.5 mr-2" />
                                                    )}
                                                    {t("WORKER_MISSION_DETAILS.TABS.APPLICATION_STATUS.WITHDRAW_BTN")}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Contact Card */}
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-muted-foreground text-xs font-bold font-spline uppercase tracking-wider mb-4">
                                {t("WORKER_MISSION_DETAILS.TABS.CONTACT.TITLE")}
                            </h3>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {institution?.institutionName?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="text-foreground font-bold font-spline text-base">{t("WORKER_MISSION_DETAILS.TABS.CONTACT.INSTITUTION_CONTACT")}</p>
                                    <p className="text-muted-foreground text-sm">{t("WORKER_MISSION_DETAILS.TABS.CONTACT.COORDINATOR")}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-background hover:bg-muted hover:border-primary/50 transition-colors"
                                    onClick={handleCall}
                                >
                                    <Phone className="h-4 w-4 mr-2 text-primary" />
                                    {t("WORKER_MISSION_DETAILS.TABS.CONTACT.CALL")}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-background hover:bg-muted hover:border-primary/50 transition-colors"
                                    onClick={handleOpenChat}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                                    {t("WORKER_MISSION_DETAILS.TABS.CONTACT.MESSAGE")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compensation Card */}
                    <Card className="border-border shadow-sm bg-linear-to-br from-primary/5 to-primary/10 font-spline">
                        <CardContent className="p-6">
                            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                {t("WORKER_MISSION_DETAILS.TABS.COMPENSATION.TITLE")}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-foreground">
                                    {Number(mission.budget || 0).toFixed(0)}
                                </span>
                                <span className="text-muted-foreground text-base font-medium">{t("WORKER_MISSION_DETAILS.TABS.COMPENSATION.MAD")}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mb-4">
                                <Info className="h-4 w-4 text-primary shrink-0" />
                                <p className="text-[11px] leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: t("WORKER_MISSION_DETAILS.TABS.COMPENSATION.PLATFORM_FEE_MSG", { interpolation: { escapeValue: false } }).replace('<bold>', '<span class="font-bold text-primary">').replace('</bold>', '</span>') }}>
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                                <span className="text-muted-foreground">
                                    {mission.requiredSpeciality && `${mission.requiredSpeciality.name}`}
                                </span>
                                <Badge variant="outline" className="border-primary/30 text-primary">
                                    {t("WORKER_MISSION_DETAILS.TABS.COMPENSATION.TOTAL_BUDGET")}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Badge */}
                    <Card className="border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <Award className="text-primary h-6 w-6 shrink-0" />
                                <div>
                                    <h5 className="text-foreground font-bold text-sm mb-1">{t("WORKER_MISSION_DETAILS.TABS.VERIFICATION.TITLE")}</h5>
                                    <p className="text-muted-foreground text-xs">
                                        {t("WORKER_MISSION_DETAILS.TABS.VERIFICATION.DESC")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Chat Modal */}
            {isChatOpen && currentConversation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsChatOpen(false);
                        }
                    }}
                >
                    <div className="bg-background border border-border rounded-2xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl m-4">
                        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                            <h2 className="text-xl font-bold text-foreground">{t("WORKER_MISSION_DETAILS.CHAT_MODAL.TITLE")}</h2>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ChatWindow
                                conversation={currentConversation}
                                onBack={() => setIsChatOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
