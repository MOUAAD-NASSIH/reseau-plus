import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ClipboardList,
    Filter,
    Calendar,
    User,
    Building2,
    Briefcase,
    Eye,
    X,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetAllAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";

interface AssignmentDetailsDialogProps {
    assignment: MissionAssignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AssignmentDetailsDialog({ assignment, open, onOpenChange }: AssignmentDetailsDialogProps) {
    if (!assignment) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Assignment Details
                    </DialogTitle>
                    <DialogDescription>
                        Assignment #{assignment.id} information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={assignment.status} />
                    </div>

                    {/* Worker Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Assigned Worker
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {assignment.worker?.user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Institution Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Institution
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {assignment.institution?.institutionName || "Unknown"}
                            </p>
                            {assignment.institution?.address && (
                                <p className="text-sm text-muted-foreground">
                                    {assignment.institution.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Mission Info */}
                    {assignment.mission && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                Mission
                            </Label>
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="font-medium">{assignment.mission.title}</p>
                                {assignment.mission.location && (
                                    <p className="text-sm text-muted-foreground">
                                        {assignment.mission.location}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <StatusBadge status={assignment.mission.status} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Assigned At
                            </Label>
                            <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
                        </div>
                        {assignment.mission && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Mission Period</Label>
                                <p className="font-medium">
                                    {formatDate(assignment.mission.startDate)} - {formatDate(assignment.mission.endDate)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground border-t pt-4">
                        <p>Assignment ID: {assignment.id}</p>
                        <p>Mission ID: {assignment.missionId}</p>
                        <p>Worker ID: {assignment.workerId}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AssignmentsOverview() {
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "ALL">("ALL");
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetAllAssignmentsQuery(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined
    );

    const assignments = assignmentsData?.data || [];

    const handleViewAssignment = useCallback((assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setDialogOpen(true);
    }, []);

    // Column definitions for DataTable
    const columns: ColumnDef<MissionAssignment>[] = useMemo(
        () => [
            {
                accessorKey: "worker.firstName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Worker" />
                ),
                cell: ({ row }) => {
                    const assignment = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="font-medium truncate max-w-[150px]">
                                    {assignment.worker?.firstName} {assignment.worker?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {assignment.worker?.user?.email}
                                </p>
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.worker?.firstName || ""} ${row.worker?.lastName || ""}`,
            },
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
                            <span className="truncate max-w-[150px]">
                                {mission?.title || "Unknown"}
                            </span>
                        </div>
                    );
                },
                accessorFn: (row) => row.mission?.title || "",
            },
            {
                accessorKey: "institution.institutionName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Institution" />
                ),
                cell: ({ row }) => {
                    const institution = row.original.institution;
                    return (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">
                                {institution?.institutionName || "Unknown"}
                            </span>
                        </div>
                    );
                },
                accessorFn: (row) => row.institution?.institutionName || "",
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
                    <DataTableColumnHeader column={column} title="Assigned At" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.getValue("assignedAt")), "MMM d, yyyy")}
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const assignment = row.original;
                    return (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAssignment(assignment)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleViewAssignment]
    );

    return (
        <div className="space-y-6">
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
                        All Assignments
                        {!assignmentsLoading && (
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
                        isLoading={assignmentsLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search by worker, mission, or institution..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={ClipboardList}
                        emptyTitle="No assignments found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No assignments match the current filters. Try adjusting your search criteria."
                                : "There are no assignments in the system yet."
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

            {/* Assignment Details Dialog */}
            <AssignmentDetailsDialog
                assignment={selectedAssignment}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}

