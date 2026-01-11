import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
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
    FileText,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useGetMyApplicationsQuery,
    useWithdrawApplicationMutation,
} from "@/features/api/endpoints/applicationEndpoints";
import type { MissionApplication, ApplicationStatus } from "@/types/application.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string; icon: any }[] = [
    { value: "ALL", label: "All", icon: ClipboardList },
    { value: "SUBMITTED", label: "Pending", icon: Clock },
    { value: "ACCEPTED", label: "Accepted", icon: CheckCircle2 },
    { value: "REJECTED", label: "Rejected", icon: XCircle },
];

export default function MyApplications() {
    const { data: applicationsData, isLoading } = useGetMyApplicationsQuery();
    const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

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
            filtered = filtered.filter(
                (app) =>
                    app.mission?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.mission?.institution?.institutionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.mission?.location?.toLowerCase().includes(searchQuery.toLowerCase())
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
            showSuccessToast("Application withdrawn", "Your application has been withdrawn.");
        } catch (error) {
            showErrorToast(error, "Failed to withdraw application");
        } finally {
            setWithdrawingId(null);
            setConfirmWithdrawApp(null);
        }
    };

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case "SUBMITTED":
                return "text-yellow-400";
            case "ACCEPTED":
                return "text-primary";
            case "REJECTED":
                return "text-red-400";
            default:
                return "text-text-muted";
        }
    };

    const getStatusBg = (status: ApplicationStatus) => {
        switch (status) {
            case "SUBMITTED":
                return "bg-yellow-900/20 border-yellow-800/30";
            case "ACCEPTED":
                return "bg-primary/10 border-primary/30";
            case "REJECTED":
                return "bg-red-900/20 border-red-800/30";
            default:
                return "bg-surface-dark border-border-dark";
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface-darker border-b border-border-dark backdrop-blur-sm bg-opacity-95">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                </div>
                                My Applications
                            </h1>
                            <p className="text-text-muted text-sm mt-1">
                                Track and manage your mission applications
                            </p>
                        </div>
                        <Button asChild className="bg-primary hover:bg-[#20bd5e] text-background-dark font-bold">
                            <Link to="/worker/missions">
                                <FileText className="mr-2 h-4 w-4" />
                                Browse Missions
                            </Link>
                        </Button>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {STATUS_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = statusFilter === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                        isActive
                                            ? "bg-primary text-background-dark shadow-[0_0_15px_rgba(43,238,121,0.2)]"
                                            : "bg-surface-dark text-text-muted hover:text-white hover:bg-surface-dark/80 border border-border-dark"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            isActive
                                                ? "bg-background-dark/20 text-background-dark"
                                                : "bg-surface-darker text-text-muted"
                                        }`}
                                    >
                                        {statusCounts[tab.value]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input
                            type="text"
                            placeholder="Search applications by mission, institution, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-surface-dark border-border-dark text-white placeholder:text-text-muted h-12"
                        />
                    </div>
                </div>

                {/* Applications List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                            <ClipboardList className="h-10 w-10 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
                        <p className="text-text-muted mb-6 max-w-md">
                            {statusFilter !== "ALL" || searchQuery
                                ? "No applications match your filters. Try adjusting your search."
                                : "You haven't applied to any missions yet. Start browsing available missions!"}
                        </p>
                        {statusFilter === "ALL" && !searchQuery ? (
                            <Button asChild className="bg-primary hover:bg-[#20bd5e] text-background-dark font-bold">
                                <Link to="/worker/missions">Browse Missions</Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setSearchQuery("");
                                }}
                                className="border-border-dark text-white hover:bg-surface-dark"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredApplications.map((application) => {
                            const mission = application.mission;
                            const canWithdraw = application.status === "SUBMITTED";
                            const isCurrentlyWithdrawing = withdrawingId === application.id;

                            return (
                                <div
                                    key={application.id}
                                    className={`bg-surface-darker border rounded-xl p-5 hover:bg-surface-dark transition-all ${getStatusBg(
                                        application.status
                                    )}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-white mb-1 truncate">
                                                        {mission?.title || "Mission"}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Building2 className="h-4 w-4" />
                                                            <span className="truncate max-w-[200px]">
                                                                {mission?.institution?.institutionName || "Institution"}
                                                            </span>
                                                        </div>
                                                        {mission?.location && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{mission.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
                                                        application.status === "SUBMITTED"
                                                            ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                                                            : application.status === "ACCEPTED"
                                                            ? "bg-primary/20 text-primary border border-primary/40"
                                                            : "bg-red-900/30 text-red-400 border border-red-800/50"
                                                    }`}
                                                >
                                                    {application.status === "SUBMITTED" ? (
                                                        <Clock className="h-3 w-3" />
                                                    ) : application.status === "ACCEPTED" ? (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3" />
                                                    )}
                                                    {application.status}
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className="flex items-center gap-6 text-sm mb-4">
                                                {mission?.startDate && mission?.endDate && (
                                                    <div className="flex items-center gap-1.5 text-text-muted">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(mission.startDate), "MMM d")} -{" "}
                                                            {format(new Date(mission.endDate), "MMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-text-muted">
                                                    <ClipboardList className="h-4 w-4" />
                                                    <span>Applied {format(new Date(application.appliedAt), "MMM d, yyyy")}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="border-border-dark text-white hover:bg-surface-dark hover:text-primary"
                                                >
                                                    <Link to={`/worker/missions/${application.missionId}`}>
                                                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                                        View Mission
                                                    </Link>
                                                </Button>
                                                {canWithdraw && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                        onClick={() => setConfirmWithdrawApp(application)}
                                                        disabled={isCurrentlyWithdrawing}
                                                    >
                                                        {isCurrentlyWithdrawing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                        )}
                                                        Withdraw
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Withdraw Confirmation Dialog */}
            <Dialog open={!!confirmWithdrawApp} onOpenChange={() => setConfirmWithdrawApp(null)}>
                <DialogContent className="bg-surface-darker border-border-dark">
                    <DialogHeader>
                        <DialogTitle className="text-white">Withdraw Application</DialogTitle>
                        <DialogDescription className="text-text-muted">
                            Are you sure you want to withdraw your application for{" "}
                            <span className="font-semibold text-white">{confirmWithdrawApp?.mission?.title}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmWithdrawApp(null)}
                            className="border-border-dark text-white hover:bg-surface-dark"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isWithdrawing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Withdrawing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Withdraw Application
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}