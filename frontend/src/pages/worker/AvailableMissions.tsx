import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Briefcase,
    MapPin,
    Calendar,
    DollarSign,
    Filter,
    CheckCircle,
    Eye,
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
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { useGetAvailableMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import { useGetSpecialitiesQuery, useGetDomainsQuery } from "@/features/api/endpoints/domainEndpoints";
import type { Mission, Urgency } from "@/types/mission.types";

const URGENCY_OPTIONS: { value: Urgency | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Urgencies" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
];

function getUrgencyBadge(urgency: Urgency) {
    const colors: Record<Urgency, string> = {
        HIGH: "bg-destructive text-destructive-foreground",
        MEDIUM: "bg-warning text-warning-foreground",
        LOW: "bg-success text-success-foreground",
    };
    return <Badge className={colors[urgency]}>{urgency}</Badge>;
}

// Extended mission type with applied status for table
interface MissionWithApplied extends Mission {
    isApplied: boolean;
}

export default function AvailableMissions() {
    const [selectedSpeciality, setSelectedSpeciality] = useState<string>("ALL");
    const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
    const [selectedUrgency, setSelectedUrgency] = useState<string>("ALL");

    const { data: missionsData, isLoading: missionsLoading } = useGetAvailableMissionsQuery();
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMyApplicationsQuery();
    const { data: specialitiesData, isLoading: specialitiesLoading } = useGetSpecialitiesQuery();
    const { data: domainsData, isLoading: domainsLoading } = useGetDomainsQuery();

    const specialities = specialitiesData?.data || [];
    const domains = domainsData?.data || [];

    // Get set of mission IDs the worker has applied to
    const appliedMissionIds = useMemo(() => {
        const applications = applicationsData?.data || [];
        return new Set(applications.map((app) => app.missionId));
    }, [applicationsData?.data]);

    // Filter missions and add applied status
    const filteredMissions = useMemo((): MissionWithApplied[] => {
        const missions = missionsData?.data || [];
        return missions
            .filter((mission) => {
                // Speciality filter
                if (selectedSpeciality !== "ALL") {
                    if (mission.requiredSpecialityId?.toString() !== selectedSpeciality) {
                        return false;
                    }
                }

                // Domain filter
                if (selectedDomain !== "ALL") {
                    const hasDomain = mission.domains?.some(
                        (md) => md.domainId.toString() === selectedDomain
                    );
                    if (!hasDomain) {
                        return false;
                    }
                }

                // Urgency filter
                if (selectedUrgency !== "ALL") {
                    if (mission.urgency !== selectedUrgency) {
                        return false;
                    }
                }

                return true;
            })
            .map((mission) => ({
                ...mission,
                isApplied: appliedMissionIds.has(mission.id),
            }));
    }, [missionsData?.data, selectedSpeciality, selectedDomain, selectedUrgency, appliedMissionIds]);

    const isLoading = missionsLoading || applicationsLoading;
    const isFiltersLoading = specialitiesLoading || domainsLoading;

    const clearFilters = () => {
        setSelectedSpeciality("ALL");
        setSelectedDomain("ALL");
        setSelectedUrgency("ALL");
    };

    const hasActiveFilters =
        selectedSpeciality !== "ALL" || selectedDomain !== "ALL" || selectedUrgency !== "ALL";

    // Column definitions for DataTable
    const columns: ColumnDef<MissionWithApplied>[] = useMemo(
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
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate max-w-[200px]">
                                    {mission.title}
                                </span>
                                {mission.isApplied && (
                                    <Badge variant="outline" className="text-primary border-primary shrink-0">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Applied
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {mission.institution?.institutionName || "Institution"}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: "location",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Location" />
                ),
                cell: ({ row }) => {
                    const location = row.getValue("location") as string | null;
                    return location ? (
                        <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{location}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: "startDate",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Dates" />
                ),
                cell: ({ row }) => {
                    const mission = row.original;
                    return (
                        <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                                {format(new Date(mission.startDate), "MMM d")} -{" "}
                                {format(new Date(mission.endDate), "MMM d, yyyy")}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Budget" />
                ),
                cell: ({ row }) => {
                    const budget = row.getValue("budget") as number | null;
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
                accessorKey: "urgency",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Urgency" />
                ),
                cell: ({ row }) => getUrgencyBadge(row.getValue("urgency") as Urgency),
                filterFn: (row, id, value) => value.includes(row.getValue(id)),
            },
            {
                accessorKey: "speciality",
                header: "Speciality",
                cell: ({ row }) => {
                    const mission = row.original;
                    return mission.speciality ? (
                        <Badge variant="secondary">{mission.speciality.name}</Badge>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                enableSorting: false,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button asChild size="sm">
                        <Link to={`/worker/missions/${row.original.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            View
                        </Link>
                    </Button>
                ),
                enableSorting: false,
            },
        ],
        []
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filter Selects */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Speciality</label>
                            {isFiltersLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Specialities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Specialities</SelectItem>
                                        {specialities.map((spec) => (
                                            <SelectItem key={spec.id} value={spec.id.toString()}>
                                                {spec.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Domain</label>
                            {isFiltersLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Domains" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Domains</SelectItem>
                                        {domains.map((domain) => (
                                            <SelectItem key={domain.id} value={domain.id.toString()}>
                                                {domain.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Urgency</label>
                            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Urgencies" />
                                </SelectTrigger>
                                <SelectContent>
                                    {URGENCY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Available Missions
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredMissions.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredMissions}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search missions..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Briefcase}
                        emptyTitle="No missions found"
                        emptyDescription={
                            hasActiveFilters
                                ? "Try adjusting your filters to find more missions."
                                : "There are no available missions at the moment. Check back later!"
                        }
                        emptyAction={
                            hasActiveFilters ? (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}

