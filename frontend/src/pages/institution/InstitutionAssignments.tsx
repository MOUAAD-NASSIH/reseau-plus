import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ClipboardList,
    Filter,
    Calendar,
    User,
    Briefcase,
    Eye,
    X,
    CreditCard,
    Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useInstitutionAssignments } from "@/features/hooks/useAssignments";
import { useMyWrittenReviews } from "@/features/hooks/useReviews";
import { usePayments } from "@/features/hooks/usePayments";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";

export default function InstitutionAssignments() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "ALL">("ALL");

    // Fetch institution's assignments
    const { data: assignmentsData, isLoading } = useInstitutionAssignments(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined
    );

    // Fetch written reviews to check which assignments have been reviewed
    const { data: writtenReviewsData } = useMyWrittenReviews();

    // Fetch payments to check which assignments have been paid
    const { data: paymentsData } = usePayments();

    const assignments = assignmentsData?.data || [];
    const writtenReviews = writtenReviewsData?.data || [];
    const payments = paymentsData?.data || [];

    // Create sets for quick lookup
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

    const handleViewAssignment = useCallback((assignment: MissionAssignment) => {
        navigate(`/institution/assignments/${assignment.id}`);
    }, [navigate]);

    const handlePayment = useCallback((assignmentId: number) => {
        navigate(`/institution/payments/${assignmentId}`);
    }, [navigate]);

    const handleReview = useCallback((assignmentId: number) => {
        navigate(`/institution/reviews?assignmentId=${assignmentId}`);
    }, [navigate]);

    // Column definitions for DataTable
    const columns: ColumnDef<MissionAssignment>[] = useMemo(
        () => [
            {
                accessorKey: "mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Mission" />
                ),
                cell: ({ row }) => {
                    const mission = row.original.mission;
                    return (
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="font-medium truncate max-w-[200px]">
                                    {mission?.title || "Unknown"}
                                </p>
                                {mission?.location && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {mission.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => row.mission?.title || "",
            },
            {
                accessorKey: "worker.firstName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Assigned Worker" />
                ),
                cell: ({ row }) => {
                    const assignment = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate max-w-[150px]">
                                    {assignment.worker?.firstName} {assignment.worker?.lastName}
                                </p>
                                {assignment.worker?.speciality && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                        {assignment.worker.speciality.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.worker?.firstName || ""} ${row.worker?.lastName || ""}`,
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
                accessorKey: "assignedAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Assigned Date" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.getValue("assignedAt")), "MMM d, yyyy")}
                    </div>
                ),
            },
            {
                accessorKey: "mission.budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Budget" />
                ),
                cell: ({ row }) => {
                    const budget = row.original.mission?.budget;
                    if (!budget) return <span className="text-muted-foreground">-</span>;
                    return (
                        <span className="font-medium">
                            {new Intl.NumberFormat("fr-MA", {
                                style: "currency",
                                currency: "MAD",
                            }).format(budget)}
                        </span>
                    );
                },
                accessorFn: (row) => row.mission?.budget || 0,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const assignment = row.original;
                    const isCompleted = assignment.status === "COMPLETED";
                    const hasReviewed = reviewedAssignmentIds.has(assignment.id);
                    const hasPaid = paidAssignmentIds.has(assignment.id);
                    const canPay = isCompleted && !hasPaid;
                    const canReview = isCompleted && !hasReviewed;

                    return (
                        <div className="flex justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAssignment(assignment)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                            {canPay && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePayment(assignment.id)}
                                >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pay
                                </Button>
                            )}
                            {canReview && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReview(assignment.id)}
                                >
                                    <Star className="h-4 w-4 mr-1" />
                                    Review
                                </Button>
                            )}
                            {hasReviewed && isCompleted && (
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
        [handleViewAssignment, handlePayment, handleReview, reviewedAssignmentIds, paidAssignmentIds]
    );

    // Calculate stats
    const stats = useMemo(() => {
        const active = assignments.filter(a => a.status === "ACTIVE" || a.status === "ONGOING").length;
        const completed = assignments.filter(a => a.status === "COMPLETED").length;
        const cancelled = assignments.filter(a => a.status === "CANCELLED").length;
        return { active, completed, cancelled, total: assignments.length };
    }, [assignments]);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total Assignments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-info">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Active/Ongoing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-success">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-destructive">{stats.cancelled}</div>
                        <p className="text-xs text-muted-foreground">Cancelled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as AssignmentStatus | "ALL")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {statusFilter !== "ALL" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("ALL")}
                                className="text-muted-foreground mt-6"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear filter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        My Assignments
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {assignments.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={assignments}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search by mission or worker..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={ClipboardList}
                        emptyTitle="No assignments yet"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No assignments match the current filter. Try adjusting your search criteria."
                                : "You don't have any assignments yet. Assignments are created when you accept an applicant for a mission."
                        }
                        emptyAction={
                            statusFilter !== "ALL" ? (
                                <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                                    Clear filter
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}
