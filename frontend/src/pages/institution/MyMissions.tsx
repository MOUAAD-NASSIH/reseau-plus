import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Users, Eye, Trash2, Briefcase } from "lucide-react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMyMissions, useDeleteMission } from "@/features/hooks/useMissions";
import type { Mission, MissionStatus, Urgency } from "@/types/mission.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

function getUrgencyBadge(urgency: Urgency) {
    const colors: Record<Urgency, string> = {
        HIGH: "bg-destructive text-destructive-foreground",
        MEDIUM: "bg-warning text-warning-foreground",
        LOW: "bg-success text-success-foreground",
    };
    return <Badge className={colors[urgency]}>{urgency}</Badge>;
}

export default function MyMissions() {
    const [statusFilter, setStatusFilter] = useState<MissionStatus | "ALL">("ALL");

    const { data: missionsData, isLoading } = useMyMissions(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined
    );
    const deleteMission = useDeleteMission();

    const missions = missionsData?.data || [];

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteMission.mutateAsync(id);
            showSuccessToast("Mission deleted", "The mission has been deleted successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to delete mission. Please try again.");
        }
    }, [deleteMission]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatBudget = (budget: number | null | undefined) => {
        if (!budget) return "-";
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(budget);
    };

    // Column definitions for DataTable
    const columns: ColumnDef<Mission>[] = useMemo(
        () => [
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Title" />
                ),
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                                {mission.title}
                            </p>
                            {mission.location && (
                                <p className="text-xs text-muted-foreground truncate">
                                    {mission.location}
                                </p>
                            )}
                        </div>
                    );
                },
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
                accessorKey: "startDate",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Dates" />
                ),
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="text-sm">
                            <p>{formatDate(mission.startDate)}</p>
                            <p className="text-muted-foreground">
                                to {formatDate(mission.endDate)}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: "budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Budget" />
                ),
                cell: ({ row }) => formatBudget(row.getValue("budget") as number | null),
            },
            {
                accessorKey: "urgency",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Urgency" />
                ),
                cell: ({ row }) => getUrgencyBadge(row.getValue("urgency") as Urgency),
                filterFn: (row, id, value) => value.includes(row.getValue(id)),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="View details"
                            >
                                <Link to={`/institution/missions/${mission.id}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="View applicants"
                            >
                                <Link to={`/institution/missions/${mission.id}/applicants`}>
                                    <Users className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Edit mission"
                            >
                                <Link to={`/institution/missions/${mission.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Delete mission"
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Mission</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{mission.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(mission.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleDelete]
    );

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as MissionStatus | "ALL")}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="ONGOING">Ongoing</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button asChild>
                    <Link to="/institution/missions/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Mission
                    </Link>
                </Button>
            </div>

            {/* Missions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Missions
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {missions.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={missions}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search missions..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Briefcase}
                        emptyTitle="No missions found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No missions match the selected filter. Try changing the filter or create a new mission."
                                : "You haven't created any missions yet. Create your first mission to start finding workers."
                        }
                        emptyAction={
                            <Button asChild>
                                <Link to="/institution/missions/create">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Mission
                                </Link>
                            </Button>
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}
