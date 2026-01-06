import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    CheckSquare,
    Calendar,
    Building2,
    MapPin,
    DollarSign,
    ExternalLink,
    Filter,
    Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMyWrittenReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";

const STATUS_OPTIONS: { value: AssignmentStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "ONGOING", label: "Ongoing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

export default function AssignedMissions() {
    const { data: assignmentsData, isLoading } = useGetMyAssignmentsQuery();
    const { data: writtenReviewsData } = useGetMyWrittenReviewsQuery();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);
    const writtenReviews = useMemo(() => writtenReviewsData?.data || [], [writtenReviewsData?.data]);

    // Create a set of assignment IDs that have been reviewed
    const reviewedAssignmentIds = useMemo(() => {
        return new Set(writtenReviews.map((r) => r.missionAssignmentId));
    }, [writtenReviews]);

    // Filter assignments
    const filteredAssignments = useMemo(() => {
        const filtered = assignments.filter((assignment) => {
            if (statusFilter === "ALL") return true;
            return assignment.status === statusFilter;
        });
        // Sort by date (newest first)
        return [...filtered].sort(
            (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
        );
    }, [assignments, statusFilter]);

    // Group by status for summary
    const statusCounts = useMemo(() => ({
        ACTIVE: assignments.filter((a) => a.status === "ACTIVE").length,
        ONGOING: assignments.filter((a) => a.status === "ONGOING").length,
        COMPLETED: assignments.filter((a) => a.status === "COMPLETED").length,
        CANCELLED: assignments.filter((a) => a.status === "CANCELLED").length,
    }), [assignments]);

    // Column definitions for DataTable
    const columns: ColumnDef<MissionAssignment>[] = useMemo(
        () => [
            {
                accessorKey: "mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Mission" />
                ),
                cell: ({ row }) => {
                    const assignment = row.original;
                    const mission = assignment.mission;
                    const institution = assignment.institution;
                    return (
                        <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                                {mission?.title || "Mission"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {institution?.institutionName || "Institution"}
                            </p>
                        </div>
                    );
                },
                accessorFn: (row) => row.mission?.title || "",
            },
            {
                accessorKey: "mission.location",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Location" />
                ),
                cell: ({ row }) => {
                    const location = row.original.mission?.location;
                    return location ? (
                        <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{location}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                accessorFn: (row) => row.mission?.location || "",
            },
            {
                accessorKey: "mission.startDate",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Mission Period" />
                ),
                cell: ({ row }) => {
                    const mission = row.original.mission;
                    return mission ? (
                        <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                                {format(new Date(mission.startDate), "MMM d")} -{" "}
                                {format(new Date(mission.endDate), "MMM d, yyyy")}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                accessorFn: (row) => row.mission?.startDate || "",
            },
            {
                accessorKey: "mission.budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Budget" />
                ),
                cell: ({ row }) => {
                    const budget = row.original.mission?.budget;
                    return budget ? (
                        <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{budget.toLocaleString()} MAD</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: "assignedAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Assigned" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">
                        {format(new Date(row.getValue("assignedAt")), "MMM d, yyyy")}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
                filterFn: (row, id, value) => value.includes(row.getValue(id)),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const assignment = row.original;
                    const hasReviewed = reviewedAssignmentIds.has(assignment.id);
                    const canReview = assignment.status === "COMPLETED" && !hasReviewed;

                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/worker/missions/${assignment.missionId}`}>
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    View
                                </Link>
                            </Button>
                            {canReview && (
                                <Button size="sm" asChild>
                                    <Link to={`/worker/reviews?assignmentId=${assignment.id}`}>
                                        <Star className="mr-1 h-3 w-3" />
                                        Review
                                    </Link>
                                </Button>
                            )}
                            {hasReviewed && assignment.status === "COMPLETED" && (
                                <Badge variant="secondary" className="text-xs">
                                    <Star className="mr-1 h-3 w-3 fill-warning text-warning" />
                                    Reviewed
                                </Badge>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [reviewedAssignmentIds]
    );

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{statusCounts.ACTIVE}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-info/10">
                                <CheckSquare className="h-5 w-5 text-info" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ongoing</p>
                                <p className="text-2xl font-bold">{statusCounts.ONGOING}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-warning/10">
                                <CheckSquare className="h-5 w-5 text-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{statusCounts.COMPLETED}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-success/10">
                                <CheckSquare className="h-5 w-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cancelled</p>
                                <p className="text-2xl font-bold">{statusCounts.CANCELLED}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-destructive/10">
                                <CheckSquare className="h-5 w-5 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        My Assignments
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredAssignments.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredAssignments}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search assignments..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={CheckSquare}
                        emptyTitle="No assignments found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No assignments match the selected filter."
                                : "You don't have any assigned missions yet. Apply to missions to get started!"
                        }
                        emptyAction={
                            statusFilter === "ALL" ? (
                                <Button asChild>
                                    <Link to="/worker/missions">Browse Missions</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                                    Clear Filter
                                </Button>
                            )
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}

