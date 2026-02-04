import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    ClipboardList,
    Calendar,
    Building2,
    MapPin,
    Trash2,
    Loader2,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter, // This was removed in the instruction, but it's part of the original code and not explicitly marked for removal. Re-adding it.
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useGetMyApplicationsQuery,
    useWithdrawApplicationMutation,
} from "@/features/api/endpoints/applicationEndpoints";
import type { MissionApplication, ApplicationStatus } from "@/types/application.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function MyApplications() {
    const { t, i18n } = useTranslation();
    const { data: applicationsData, isLoading } = useGetMyApplicationsQuery();
    const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

    const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string; icon: any }[] = [
        { value: "ALL", label: t("MY_APPLICATIONS.TABS.ALL"), icon: ClipboardList },
        { value: "SUBMITTED", label: t("MY_APPLICATIONS.TABS.PENDING"), icon: Clock },
        { value: "ACCEPTED", label: t("MY_APPLICATIONS.TABS.ACCEPTED"), icon: CheckCircle2 },
        { value: "REJECTED", label: t("MY_APPLICATIONS.TABS.REJECTED"), icon: XCircle },
    ];

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
    const [confirmWithdrawApp, setConfirmWithdrawApp] = useState<MissionApplication | null>(null);

    const applications = useMemo(() => applicationsData?.data || [], [applicationsData?.data]);

    // Filter and search applications
    const filteredApplications = useMemo(() => {
        let filtered = applications.filter((app) => {
            if (statusFilter === "ALL") return true;
            return app.status === statusFilter;
        });

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.mission?.title?.toLowerCase().includes(query) ||
                    app.mission?.institution?.institutionName?.toLowerCase().includes(query) ||
                    app.mission?.location?.toLowerCase().includes(query)
            );
        }

        return [...filtered].sort(
            (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
    }, [applications, statusFilter, searchQuery]);

    // Status counts
    const statusCounts = useMemo(
        () => ({
            ALL: applications.length,
            SUBMITTED: applications.filter((a) => a.status === "SUBMITTED").length,
            ACCEPTED: applications.filter((a) => a.status === "ACCEPTED").length,
            REJECTED: applications.filter((a) => a.status === "REJECTED").length,
        }),
        [applications]
    );

    const handleWithdraw = async () => {
        if (!confirmWithdrawApp) return;
        setWithdrawingId(confirmWithdrawApp.id);
        try {
            await withdrawApplication({
                id: confirmWithdrawApp.id,
                missionId: confirmWithdrawApp.missionId,
            }).unwrap();
            showSuccessToast(t("MY_APPLICATIONS.MESSAGES.WITHDRAW_SUCCESS"), t("MY_APPLICATIONS.MESSAGES.WITHDRAW_SUCCESS_DESC"));
        } catch (error: any) {
            showErrorToast(error, error?.data?.message || t("MY_APPLICATIONS.MESSAGES.WITHDRAW_ERROR"));
        } finally {
            setWithdrawingId(null);
            setConfirmWithdrawApp(null);
        }
    };

    const getStatusConfig = (status: ApplicationStatus) => {
        switch (status) {
            case "SUBMITTED":
                return {
                    color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25",
                    icon: Clock,
                    label: t("MY_APPLICATIONS.CARD.STATUS.PENDING")
                };
            case "ACCEPTED":
                return {
                    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25",
                    icon: CheckCircle2,
                    label: t("MY_APPLICATIONS.CARD.STATUS.ACCEPTED")
                };
            case "REJECTED":
                return {
                    color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 hover:bg-red-500/25",
                    icon: XCircle,
                    label: t("MY_APPLICATIONS.CARD.STATUS.REJECTED")
                };
            default:
                return {
                    color: "bg-muted text-muted-foreground border-border",
                    icon: AlertCircle,
                    label: status
                };
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Page Title Heade */}
            <div className="border-b border-border bg-card/30">
                <div className="px-4 md:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black font-spline tracking-tight text-foreground flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                </div>
                                {t("MY_APPLICATIONS.TITLE")}
                            </h1>
                            <p className="text-muted-foreground mt-2 ml-13">
                                {t("MY_APPLICATIONS.SUBTITLE")}
                            </p>
                        </div>
                        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
                            <Link to="/worker/missions">
                                {t("MY_APPLICATIONS.BROWSE_BTN")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="z-20 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="py-3">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-72 order-2 lg:order-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t("MY_APPLICATIONS.SEARCH_PLACEHOLDER")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/50 border-input hover:border-primary/50 transition-colors rounded-full text-sm placeholder:opacity-50"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto order-1 lg:order-2">
                            {STATUS_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = statusFilter === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => setStatusFilter(tab.value)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all border select-none",
                                            isActive
                                                ? "bg-primary/10 text-primary border-primary/20 shadow-xs"
                                                : "bg-background text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground hover:border-border"
                                        )}
                                    >
                                        <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                        {tab.label}
                                        <span className={cn(
                                            "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                                            isActive
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {statusCounts[tab.value as keyof typeof statusCounts]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[280px] rounded-2xl bg-muted/20 animate-pulse border border-border/50" />
                        ))}
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="size-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            {statusFilter === "ALL" && !searchQuery ? t("MY_APPLICATIONS.EMPTY.NO_APPS_TITLE") : t("MY_APPLICATIONS.EMPTY.NO_MATCH_TITLE")}
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-md">
                            {statusFilter === "ALL" && !searchQuery
                                ? t("MY_APPLICATIONS.EMPTY.NO_APPS_DESC")
                                : t("MY_APPLICATIONS.EMPTY.NO_MATCH_DESC")}
                        </p>
                        {statusFilter === "ALL" && !searchQuery ? (
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link to="/worker/missions">{t("MY_APPLICATIONS.EMPTY.START_EXPLORING")}</Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setSearchQuery("");
                                }}
                                className="rounded-full"
                            >
                                {t("MY_APPLICATIONS.EMPTY.CLEAR_FILTERS")}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredApplications.map((application) => {
                            const mission = application.mission;
                            const statusConfig = getStatusConfig(application.status);
                            const StatusIcon = statusConfig.icon;
                            const canWithdraw = application.status === "SUBMITTED";
                            const isCurrentlyWithdrawing = withdrawingId === application.id;

                            return (
                                <Card key={application.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/30 flex flex-col overflow-hidden">
                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 font-bold text-primary border border-primary/10">
                                                    {mission?.institution?.institutionName?.charAt(0) || <Building2 className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <CardTitle className="text-base font-bold truncate pr-2 group-hover:text-primary transition-colors">
                                                        {mission?.title}
                                                    </CardTitle>
                                                    <CardDescription className="truncate flex items-center gap-1.5 text-xs mt-0.5">
                                                        <span>{mission?.institution?.institutionName}</span>
                                                        {mission?.location && (
                                                            <>
                                                                <span className="text-muted-foreground/40">•</span>
                                                                <span className="flex items-center gap-0.5">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {mission.location}
                                                                </span>
                                                            </>
                                                        )}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 py-3 flex-1 flex flex-col gap-4">
                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-semibold gap-1.5 border", statusConfig.color)}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusConfig.label}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                ID #{application.id}
                                            </span>
                                        </div>

                                        {/* Timeline */}
                                        <div className="mt-auto space-y-2 text-sm pt-2">
                                            {mission?.startDate && (
                                                <div className="flex items-center justify-between text-muted-foreground/80 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                    <span className="flex items-center gap-2 text-xs font-medium">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {t("MY_APPLICATIONS.CARD.MISSION_PERIOD")}
                                                    </span>
                                                    <span className="text-xs text-foreground font-semibold">
                                                        {new Date(mission.startDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                                                        {mission.endDate && ` - ${new Date(mission.endDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}`}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-primary/70 text-xs px-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {t("MY_APPLICATIONS.CARD.APPLIED_ON", { date: new Date(application.appliedAt).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' }) })}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-3 border-t border-border/50 bg-muted/5 gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-lg hover:bg-background hover:border-primary/50 hover:text-primary transition-all text-xs h-9"
                                            asChild
                                        >
                                            <Link to={`/worker/missions/${application.missionId}`}>
                                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                                {t("MY_APPLICATIONS.CARD.VIEW_MISSION")}
                                            </Link>
                                        </Button>

                                        {canWithdraw && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                                onClick={() => setConfirmWithdrawApp(application)}
                                                disabled={isCurrentlyWithdrawing}
                                                title={t("MY_APPLICATIONS.CARD.WITHDRAW_BTN_TITLE")}
                                            >
                                                {isCurrentlyWithdrawing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Withdraw Dialog */}
            <Dialog open={!!confirmWithdrawApp} onOpenChange={() => setConfirmWithdrawApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            {t("MY_APPLICATIONS.WITHDRAW_DIALOG.TITLE")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("MY_APPLICATIONS.WITHDRAW_DIALOG.DESC")} <span className="font-semibold text-foreground">"{confirmWithdrawApp?.mission?.title}"</span>{t("MY_APPLICATIONS.WITHDRAW_DIALOG.DESC_SUFFIX")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmWithdrawApp(null)}
                            disabled={isWithdrawing}
                        >
                            {t("MY_APPLICATIONS.WITHDRAW_DIALOG.CANCEL")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("MY_APPLICATIONS.WITHDRAW_DIALOG.WITHDRAWING")}
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("MY_APPLICATIONS.WITHDRAW_DIALOG.CONFIRM")}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}