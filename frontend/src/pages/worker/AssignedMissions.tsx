import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import {
    CheckSquare,
    Calendar,
    Building2,
    MapPin,
    DollarSign,
    ExternalLink,
    Filter,
    Star,
    Clock,
    TrendingUp,
    AlertCircle,
    Search,
    X,
    CheckCircle2,
    Award,
    Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMyWrittenReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";

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
    
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");
    const [animationKey, setAnimationKey] = useState(0);

    const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);
    const writtenReviews = useMemo(() => writtenReviewsData?.data || [], [writtenReviewsData?.data]);

    const reviewedAssignmentIds = useMemo(() => {
        return new Set(writtenReviews.map((r) => r.missionAssignmentId));
    }, [writtenReviews]);

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
        const totalEarnings = assignments
            .filter((a) => a.status === "COMPLETED")
            .reduce((sum, a) => sum + (Number(a.mission?.budget) || 0), 0);

        return { active, ongoing, completed, totalEarnings };
    }, [assignments]);

    const getStatusColor = (status: AssignmentStatus) => {
        switch (status) {
            case "ACTIVE":
                return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            case "ONGOING":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case "COMPLETED":
                return "bg-primary/10 text-primary border-primary/30";
            case "CANCELLED":
                return "bg-red-500/10 text-red-400 border-red-500/30";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getDaysRemaining = (endDate: string) => {
        const days = differenceInDays(new Date(endDate), new Date());
        if (days < 0) return "Ended";
        if (days === 0) return "Ends today";
        if (days === 1) return "1 day left";
        return `${days} days left`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="loading-spinner loading-spinner-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Main Card with Header, Stats, Filters and Results */}
            <div className="p-6 lg:p-8">
                <Card>
                    {/* Header Section */}
                    <div className="p-6 border-b border-border">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-2">
                                    My Assignments
                                </h1>
                                <p className="text-muted-foreground">
                                    Track and manage all your mission assignments in one place
                                </p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-linear-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="h-5 w-5 text-blue-400" />
                                        <span className="text-2xl font-bold text-foreground">
                                            {stats.active}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Active Missions</p>
                                </div>

                                <div className="bg-linear-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="h-5 w-5 text-yellow-400" />
                                        <span className="text-2xl font-bold text-foreground">
                                            {stats.ongoing}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>

                                <div className="bg-linear-to-br from-primary/10 to-transparent border border-primary/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        <span className="text-2xl font-bold text-foreground">
                                            {stats.completed}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>

                                <div className="bg-linear-to-br from-primary/10 to-transparent border border-primary/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <span className="text-2xl font-bold text-foreground">
                                            €{stats.totalEarnings.toFixed(0)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Earned</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Content Section */}
                    <div className="p-6">{/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by mission, institution, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 h-12 bg-background"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {STATUS_FILTERS.map((filter) => {
                                const Icon = filter.icon;
                                const isActive = statusFilter === filter.value;
                                return (
                                    <button
                                        key={filter.value}
                                        onClick={() => {
                                            setStatusFilter(filter.value);
                                            setAnimationKey(prev => prev + 1);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            isActive
                                                ? "bg-primary text-background-dark"
                                                : "bg-surface-darker text-secondary-text hover:bg-surface-dark hover:text-white"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time Filter and Results Count */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setTimeFilter("all");
                                        setAnimationKey(prev => prev + 1);
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        timeFilter === "all"
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    All Time
                                </button>
                                <button
                                    onClick={() => {
                                        setTimeFilter("upcoming");
                                        setAnimationKey(prev => prev + 1);
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        timeFilter === "upcoming"
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => {
                                        setTimeFilter("past");
                                        setAnimationKey(prev => prev + 1);
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        timeFilter === "past"
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Past
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="text-foreground font-medium">{filteredAssignments.length}</span>{" "}
                                    {filteredAssignments.length === 1 ? "assignment" : "assignments"}
                                </p>
                                {(searchQuery || statusFilter !== "ALL" || timeFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setStatusFilter("ALL");
                                            setTimeFilter("all");
                                        }}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Assignment Cards or Empty State */}
                        {filteredAssignments.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No assignments found</h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchQuery || statusFilter !== "ALL" || timeFilter !== "all"
                                        ? "Try adjusting your filters to see more results."
                                        : "You don't have any assigned missions yet. Browse available missions to get started!"}
                                </p>
                                {searchQuery || statusFilter !== "ALL" || timeFilter !== "all" ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setStatusFilter("ALL");
                                            setTimeFilter("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button asChild className="btn-glow">
                                        <Link to="/worker/missions">Browse Missions</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div key={animationKey} className="space-y-4 animate-in fade-in duration-300">
                                {filteredAssignments.map((assignment, index) => {
                                    const mission = assignment.mission;
                                    const institution = assignment.institution;
                                    const isReviewed = reviewedAssignmentIds.has(assignment.id);
                                    const canReview = assignment.status === "COMPLETED" && !isReviewed;

                                    return (
                                        <div
                                            key={assignment.id}
                                            className="group border border-border rounded-xl p-6 hover:border-primary/50 bg-surface-darker/30 hover:bg-surface-darker/50 transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in"
                                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                                        >
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Left: Institution Logo */}
                                            <div className="shrink-0">
                                                <div className="size-16 lg:size-20 rounded-xl bg-surface-darker border border-border flex items-center justify-center overflow-hidden">
                                                    {institution?.logo ? (
                                                        <img
                                                            src={institution.logo}
                                                            alt={institution.institutionName || "Institution"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Middle: Mission Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                                                            {mission?.title || "Untitled Mission"}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Building2 className="h-4 w-4" />
                                                            {institution?.institutionName || "Institution"}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 ${getStatusColor(assignment.status)}`}
                                                    >
                                                        {assignment.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="p-1.5 rounded-md bg-surface-darker text-primary">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Start Date</p>
                                                            <p className="font-medium text-foreground">
                                                                {mission?.startDate
                                                                    ? format(new Date(mission.startDate), "MMM d, yyyy")
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="p-1.5 rounded-md bg-surface-darker text-primary">
                                                            <Clock className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Duration</p>
                                                            <p className="font-medium text-foreground">
                                                                {mission?.endDate
                                                                    ? getDaysRemaining(mission.endDate)
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {mission?.location && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="p-1.5 rounded-md bg-surface-darker text-primary">
                                                                <MapPin className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Location</p>
                                                                <p className="font-medium text-foreground truncate">
                                                                    {mission.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="p-1.5 rounded-md bg-surface-darker text-primary">
                                                            <DollarSign className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Budget</p>
                                                            <p className="font-medium text-foreground">
                                                                €{Number(mission?.budget || 0).toFixed(0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="text-xs text-muted-foreground">
                                                        Assigned{" "}
                                                        {format(new Date(assignment.assignedAt), "MMM d, yyyy")}
                                                    </div>
                                                    {isReviewed && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-primary/10 text-primary border-primary/30"
                                                        >
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Reviewed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex lg:flex-col gap-2 shrink-0">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="flex-1 lg:flex-none hover:bg-primary hover:text-background-dark"
                                                >
                                                    <Link to={`/worker/assignments/${assignment.id}`}>
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                                {canReview && (
                                                    <Button
                                                        asChild
                                                        className="flex-1 lg:flex-none btn-glow"
                                                    >
                                                        <Link to={`/worker/assignments/${assignment.id}/review`}>
                                                            <Star className="h-4 w-4 mr-2" />
                                                            Leave Review
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
