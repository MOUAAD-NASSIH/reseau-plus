import { useState, useMemo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Briefcase,
    Filter,
    Calendar,
    MapPin,
    Building2,
    AlertTriangle,
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
import { useGetAllMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import type { Mission, MissionStatus, Urgency } from "@/types/mission.types";

const urgencyColors: Record<Urgency, string> = {
    HIGH: "text-destructive bg-destructive/10",
    MEDIUM: "text-warning bg-warning/10",
    LOW: "text-success bg-success/10",
};

interface MissionDetailsDialogProps {
    mission: Mission | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function MissionDetailsDialog({ mission, open, onOpenChange }: MissionDetailsDialogProps) {
    if (!mission) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-MA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatBudget = (budget: number | null | undefined) => {
        if (!budget) return "Not specified";
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(budget);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {mission.title}
                    </DialogTitle>
                    <DialogDescription>
                        Mission details and information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Urgency */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={mission.status} />
                        <Badge className={urgencyColors[mission.urgency]}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {mission.urgency} Urgency
                        </Badge>
                    </div>

                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Institution
                            </Label>
                            <p className="font-medium">
                                {mission.institution?.institutionName || "Unknown"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Location
                            </Label>
                            <p className="font-medium">
                                {mission.location || "Not specified"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Start Date
                            </Label>
                            <p className="font-medium">{formatDate(mission.startDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                End Date
                            </Label>
                            <p className="font-medium">{formatDate(mission.endDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Budget</Label>
                            <p className="font-medium">{formatBudget(mission.budget)}</p>
                        </div>
                        {mission.requiredSpeciality && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Required Speciality</Label>
                                <p className="font-medium">{mission.requiredSpeciality.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {mission.description && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                                {mission.description}
                            </p>
                        </div>
                    )}

                    {/* Domains */}
                    {mission.domains && mission.domains.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Domains</Label>
                            <div className="flex flex-wrap gap-2">
                                {mission.domains.map((md) => (
                                    <Badge
                                        key={md.id}
                                        variant={md.isRequired ? "default" : "secondary"}
                                    >
                                        {md.domain?.name || "Unknown"}
                                        {md.isRequired && " (Required)"}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground border-t pt-4">
                        <p>Created: {formatDate(mission.createdAt)}</p>
                        <p>Mission ID: {mission.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function MissionsOverview() {
    const [statusFilter, setStatusFilter] = useState<MissionStatus | "ALL">("ALL");
    const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "ALL">("ALL");
    const [specialityFilter, setSpecialityFilter] = useState<string>("ALL");
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: missionsData, isLoading: missionsLoading } = useGetAllMissionsQuery(
        statusFilter !== "ALL" || urgencyFilter !== "ALL" || specialityFilter !== "ALL"
            ? {
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                urgency: urgencyFilter !== "ALL" ? urgencyFilter : undefined,
                specialityId: specialityFilter !== "ALL" ? parseInt(specialityFilter) : undefined,
            }
            : undefined
    );
    const { data: specialitiesData } = useGetSpecialitiesQuery();

    const specialities = specialitiesData?.data || [];
    const missions = missionsData?.data || [];

    const handleViewMission = useCallback((mission: Mission) => {
        setSelectedMission(mission);
        setDialogOpen(true);
    }, []);

    const clearFilters = () => {
        setStatusFilter("ALL");
        setUrgencyFilter("ALL");
        setSpecialityFilter("ALL");
    };

    const hasActiveFilters =
        statusFilter !== "ALL" || urgencyFilter !== "ALL" || specialityFilter !== "ALL";

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
                    <DataTableColumnHeader column={column} title="Mission" />
                ),
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                                {mission.title}
                            </p>
                            {mission.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {mission.location}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "institution",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Institution" />
                ),
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">
                                {mission.institution?.institutionName || "Unknown"}
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
                accessorKey: "urgency",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Urgency" />
                ),
                cell: ({ row }) => {
                    const urgency = row.getValue("urgency") as Urgency;
                    return (
                        <Badge className={urgencyColors[urgency]}>
                            {urgency}
                        </Badge>
                    );
                },
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
                            <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {formatDate(mission.startDate)}
                            </p>
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
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMission(row.original)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [handleViewMission]
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as MissionStatus | "ALL")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="ONGOING">Ongoing</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Urgency Filter */}
                        <Select
                            value={urgencyFilter}
                            onValueChange={(value) => setUrgencyFilter(value as Urgency | "ALL")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Urgencies</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Speciality Filter */}
                        <Select
                            value={specialityFilter}
                            onValueChange={setSpecialityFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Speciality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Specialities</SelectItem>
                                {specialities.map((speciality) => (
                                    <SelectItem key={speciality.id} value={speciality.id.toString()}>
                                        {speciality.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Missions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        All Missions
                        {!missionsLoading && (
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
                        isLoading={missionsLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search missions..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Briefcase}
                        emptyTitle="No missions found"
                        emptyDescription={
                            hasActiveFilters
                                ? "No missions match the current filters. Try adjusting your search criteria."
                                : "There are no missions in the system yet."
                        }
                        emptyAction={
                            hasActiveFilters ? (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>

            {/* Mission Details Dialog */}
            <MissionDetailsDialog
                mission={selectedMission}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}

