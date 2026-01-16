import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import {
    Calendar,
    Building2,
    MapPin,
    Clock,
    TrendingUp,
    Search,
    X,
    CheckCircle2,
    Briefcase,
    ArrowRight,
    Star,
    CheckCircle,
    CreditCard,
    DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMyWrittenReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import type { AssignmentStatus } from "@/types/assignment.types";
import { cn } from "@/lib/utils";
import * as React from "react";

const STATUS_FILTERS = [
    { value: "ALL", label: "All Missions", icon: Briefcase },
    { value: "ACTIVE", label: "Active", icon: TrendingUp },
    { value: "ONGOING", label: "In Progress", icon: Clock },
    { value: "COMPLETED", label: "Completed", icon: CheckCircle2 },
    { value: "CANCELLED", label: "Cancelled", icon: X },
];

export default function AssignedMissions() {
    const { data: assignmentsData, isLoading } = useGetMyAssignmentsQuery();
    const { data: writtenReviewsData } = useGetMyWrittenReviewsQuery();
    const { data: paymentsData } = useGetPaymentsQuery();

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");

    const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);
    const writtenReviews = useMemo(() => writtenReviewsData?.data || [], [writtenReviewsData?.data]);
    const payments = useMemo(() => paymentsData?.data || [], [paymentsData?.data]);

    const reviewedAssignmentIds = useMemo(() => {
        return new Set(writtenReviews.map((r) => r.missionAssignmentId));
    }, [writtenReviews]);

    const paidAssignmentIds = useMemo(() => {
        return new Set(
            payments
                .filter((p) => p.status === "COMPLETED")
                .map((p) => p.missionAssignmentId)
        );
    }, [payments]);

    // Filter and search
    const filteredAssignments = useMemo(() => {
        let filtered = assignments;

        // Status filter
        if (statusFilter !== "ALL") {
            filtered = filtered.filter((a) => a.status === statusFilter);
        }

        // Time filter
        const now = new Date();
        if (timeFilter === "upcoming") {
            filtered = filtered.filter((a) => isAfter(new Date(a.mission?.startDate || ""), now));
        } else if (timeFilter === "past") {
            filtered = filtered.filter((a) => isBefore(new Date(a.mission?.endDate || ""), now));
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.mission?.title?.toLowerCase().includes(query) ||
                    a.institution?.institutionName?.toLowerCase().includes(query) ||
                    a.mission?.location?.toLowerCase().includes(query)
            );
        }

        return [...filtered].sort(
            (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
        );
    }, [assignments, statusFilter, searchQuery, timeFilter]);

    // Stats
    const stats = useMemo(() => {
        const active = assignments.filter((a) => a.status === "ACTIVE").length;
        const ongoing = assignments.filter((a) => a.status === "ONGOING").length;
        const completed = assignments.filter((a) => a.status === "COMPLETED").length;

        // Calculate earnings with 15% platform fee deduction
        const totalEarnings = assignments
            .filter((a) => a.status === "COMPLETED")
            .reduce((sum, a) => sum + (Number(a.mission?.budget) || 0), 0) * 0.85;

        return { active, ongoing, completed, totalEarnings };
    }, [assignments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusConfig = (status: AssignmentStatus) => {
        switch (status) {
            case "ACTIVE":
                return { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30", icon: TrendingUp, label: "Active" };
            case "ONGOING":
                return { color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30", icon: Clock, label: "In Progress" };
            case "COMPLETED":
                return { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2, label: "Completed" };
            case "CANCELLED":
                return { color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30", icon: X, label: "Cancelled" };
            default:
                return { color: "bg-muted text-muted-foreground border-border", icon: Briefcase, label: status };
        }
    };

    const getDaysRemaining = (endDate: string) => {
        const days = differenceInDays(new Date(endDate), new Date());
        if (days < 0) return "Ended";
        if (days === 0) return "Ends today";
        if (days === 1) return "1 day left";
        return `${days} days left`;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/30">
                <div className="py-6 px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black font-spline tracking-tight text-foreground flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                </div>
                                My Assignments
                            </h1>
                            <p className="text-muted-foreground mt-2 ml-13">
                                Track and manage your active and past missions
                            </p>
                        </div>
                        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
                            <Link to="/worker/missions">
                                Find New Missions
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Grid - Using Dashboard Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Active Missions"
                            value={stats.active}
                            icon={<Briefcase />}
                            description="Currently active"
                            trend="Now"
                            trendUp={true}
                        />
                        <StatCard
                            title="In Progress"
                            value={stats.ongoing}
                            icon={<Clock />}
                            description="Ongoing missions"
                            trend="Pending"
                            trendUp={true}
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon={<CheckCircle />}
                            description="All time count"
                            trend="Done"
                            trendUp={true}
                        />
                        <StatCard
                            title="Total Earnings"
                            value={formatCurrency(stats.totalEarnings)}
                            icon={<CreditCard />}
                            description="Net earnings (fees deducted)"
                            className="bg-primary/5 border-primary/20"
                        />
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Filters wrap on mobile */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            {STATUS_FILTERS.map((filter) => {
                                const Icon = filter.icon;
                                const isActive = statusFilter === filter.value;
                                return (
                                    <button
                                        key={filter.value}
                                        onClick={() => setStatusFilter(filter.value)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all border select-none",
                                            isActive
                                                ? "bg-primary/10 text-primary border-primary/20 shadow-xs"
                                                : "bg-background text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground hover:border-border"
                                        )}
                                    >
                                        <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search assignments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 bg-muted/50 border-input hover:border-primary/50 transition-colors rounded-full text-sm placeholder:opacity-70"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="shrink-0 rounded-full bg-muted/50 border-input h-9 w-9">
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTimeFilter("all")}>
                                        All Time
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTimeFilter("upcoming")}>
                                        Upcoming
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTimeFilter("past")}>
                                        Past
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <main className="py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[280px] rounded-2xl bg-muted/20 animate-pulse border border-border/50" />
                        ))}
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                        <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No assignments found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            {searchQuery || statusFilter !== "ALL" || timeFilter !== "all"
                                ? "No assignments match your current filters. Try adjusting your search criteria."
                                : "You don't have any assigned missions yet. Start browsing to find your next opportunity!"}
                        </p>
                        {searchQuery || statusFilter !== "ALL" || timeFilter !== "all" ? (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("ALL");
                                    setTimeFilter("all");
                                }}
                                className="rounded-full"
                            >
                                Clear All Filters
                            </Button>
                        ) : (
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link to="/worker/missions">Browse Missions</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAssignments.map((assignment) => {
                            const mission = assignment.mission;
                            const institution = assignment.institution;
                            const statusConfig = getStatusConfig(assignment.status);
                            const StatusIcon = statusConfig.icon;
                            const isReviewed = reviewedAssignmentIds.has(assignment.id);
                            const isPaid = paidAssignmentIds.has(assignment.id);

                            return (
                                <Card key={assignment.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/30 flex flex-col overflow-hidden">
                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 font-bold text-primary border border-primary/10 overflow-hidden">
                                                    {institution?.logo ? (
                                                        <img src={institution.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <CardTitle className="text-base font-bold truncate pr-2 group-hover:text-primary transition-colors">
                                                        {mission?.title}
                                                    </CardTitle>
                                                    <CardDescription className="truncate flex items-center gap-1.5 text-xs mt-0.5">
                                                        <span>{institution?.institutionName}</span>
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
                                        {/* Status & Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-semibold gap-1 border", statusConfig.color)}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig.label}
                                            </Badge>
                                            {isReviewed && (
                                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-semibold gap-1 border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                                    <Star className="h-3 w-3" />
                                                    Reviewed
                                                </Badge>
                                            )}
                                            {isPaid && (
                                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-semibold gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                    <DollarSign className="h-3 w-3" />
                                                    Paid
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 mt-auto p-3 rounded-xl bg-muted/30 border border-border/50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3" />
                                                    Start
                                                </div>
                                                <p className="text-xs font-semibold">
                                                    {mission?.startDate ? format(new Date(mission.startDate), "MMM d, yyyy") : "TBD"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                    <CreditCard className="h-3 w-3" />
                                                    Budget
                                                </div>
                                                <p className="text-xs font-semibold">
                                                    {Number(mission?.budget || 0).toFixed(0)} <span className="text-[10px] text-muted-foreground">MAD</span>
                                                </p>
                                            </div>
                                            <div className="space-y-1 col-span-2 pt-2 border-t border-border/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                        <Clock className="h-3 w-3" />
                                                        Timing
                                                    </div>
                                                    <p className="text-xs font-semibold text-primary">
                                                        {mission?.endDate ? getDaysRemaining(mission.endDate) : "TBD"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-3 border-t border-border/50 bg-muted/5 gap-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 rounded-lg hover:border-primary/50 hover:bg-background h-9 text-xs"
                                            asChild
                                        >
                                            <Link to={`/worker/assignments/${assignment.id}`}>
                                                Details
                                            </Link>
                                        </Button>

                                        {/* Actions only show if relevant */}
                                        {assignment.status === "COMPLETED" && !isReviewed && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                                className="flex-1 rounded-lg border-primary/20 text-primary hover:bg-primary/5 h-9 text-xs"
                                            >
                                                <Link to={`/worker/assignments/${assignment.id}#review`}>
                                                    Review
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

// Reusing StatCard component concept from Dashboard
function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    trendUp,
    className
}: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}) {
    return (
        <Card className={cn(
            "bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group",
            className
        )}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 relative z-10 w-full">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {value}
                            </div>
                        </div>
                        {(description || trend) && (
                            <div className="flex items-center gap-2 text-xs">
                                {trend && (
                                    <Badge variant={trendUp ? "default" : "destructive"} className={cn("h-5 px-1.5 font-medium", trendUp ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25" : "")}>
                                        {trend}
                                    </Badge>
                                )}
                                {description && <span className="text-muted-foreground font-medium">{description}</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-500">
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-24 w-24" }) : null}
                </div>
            </CardContent>
        </Card>
    );
}
