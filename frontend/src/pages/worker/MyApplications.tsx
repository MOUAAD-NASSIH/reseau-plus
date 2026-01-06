import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ClipboardList,
    Calendar,
    Building2,
    MapPin,
    Trash2,
    Loader2,
    ExternalLink,
    Filter,
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

const STATUS_OPTIONS: { value: ApplicationStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Statuses" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
];

export default function MyApplications() {
    const { data: applicationsData, isLoading } = useGetMyApplicationsQuery();
    const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
    const [confirmWithdrawApp, setConfirmWithdrawApp] = useState<MissionApplication | null>(null);

    const applications = useMemo(() => applicationsData?.data || [], [applicationsData?.data]);

    // Filter applications
    const filteredApplications = useMemo(() => {
        const filtered = applications.filter((app) => {
            if (statusFilter === "ALL") return true;
            return app.status === statusFilter;
        });
        // Sort by date (newest first)
        return [...filtered].sort(
            (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
    }, [applications, statusFilter]);

    // Group by status for summary
    const statusCounts = useMemo(() => ({
        SUBMITTED: applications.filter((a) => a.status === "SUBMITTED").length,
        ACCEPTED: applications.filter((a) => a.status === "ACCEPTED").length,
        REJECTED: applications.filter((a) => a.status === "REJECTED").length,
    }), [applications]);

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

    const onWithdrawClick = useCallback((application: MissionApplication) => {
        setConfirmWithdrawApp(application);
    }, []);

    // Column definitions for DataTable
    const columns: ColumnDef<MissionApplication>[] = useMemo(
        () => [
            {
                accessorKey: "mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Mission" />
                ),
                cell: ({ row }) => {
                    const application = row.original;
                    const mission = application.mission;
                    return (
                        <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                                {mission?.title || "Mission"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {mission?.institution?.institutionName || "Institution"}
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
                    <DataTableColumnHeader column={column} title="Mission Dates" />
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
                accessorKey: "appliedAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Applied" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm">
                        <ClipboardList className="h-3 w-3 text-muted-foreground" />
                        <span>{format(new Date(row.getValue("appliedAt")), "MMM d, yyyy")}</span>
                    </div>
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
                    const application = row.original;
                    const canWithdraw = application.status === "SUBMITTED";
                    const isCurrentlyWithdrawing = withdrawingId === application.id;

                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link to={`/worker/missions/${application.missionId}`}>
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    View
                                </Link>
                            </Button>
                            {canWithdraw && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => onWithdrawClick(application)}
                                    disabled={isCurrentlyWithdrawing}
                                >
                                    {isCurrentlyWithdrawing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [withdrawingId, onWithdrawClick]
    );

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{statusCounts.SUBMITTED}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-warning/10">
                                <ClipboardList className="h-5 w-5 text-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Accepted</p>
                                <p className="text-2xl font-bold">{statusCounts.ACCEPTED}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-success/10">
                                <ClipboardList className="h-5 w-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                                <p className="text-2xl font-bold">{statusCounts.REJECTED}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-destructive/10">
                                <ClipboardList className="h-5 w-5 text-destructive" />
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

            {/* Applications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        My Applications
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredApplications.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredApplications}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search applications..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={ClipboardList}
                        emptyTitle="No applications found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No applications match the selected filter."
                                : "You haven't applied to any missions yet. Browse available missions to get started!"
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

            {/* Withdraw Confirmation Dialog */}
            <Dialog open={!!confirmWithdrawApp} onOpenChange={() => setConfirmWithdrawApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Withdraw Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to withdraw this application? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmWithdrawApp(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Withdrawing...</>
                            ) : (
                                "Withdraw Application"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

