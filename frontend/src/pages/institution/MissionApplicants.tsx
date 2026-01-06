import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowLeft,
    Check,
    X,
    User,
    Briefcase,
    MapPin,
    Calendar,
    Users,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
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
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import {
    useGetMissionApplicationsQuery,
    useAcceptApplicationMutation,
    useRejectApplicationMutation,
} from "@/features/api/endpoints/applicationEndpoints";
import type { ApplicationStatus, MissionApplication } from "@/types/application.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function MissionApplicants() {
    const { id } = useParams<{ id: string }>();
    const missionId = parseInt(id || "0");

    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
    const [selectedApplicant, setSelectedApplicant] = useState<MissionApplication | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const { data: missionData, isLoading: missionLoading } = useGetMissionQuery(missionId, {
        skip: !missionId,
    });
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMissionApplicationsQuery(
        {
            missionId,
            filters: statusFilter !== "ALL" ? { status: statusFilter } : undefined,
        },
        { skip: !missionId }
    );
    const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation();
    const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation();

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];

    const handleAccept = useCallback(async (applicationId: number) => {
        setProcessingId(applicationId);
        try {
            await acceptApplication({ id: applicationId, missionId }).unwrap();
            showSuccessToast("Application accepted", "The worker has been assigned to this mission.");
            setSelectedApplicant(null);
        } catch (error) {
            showErrorToast(error, "Failed to accept application. Please try again.");
        } finally {
            setProcessingId(null);
        }
    }, [acceptApplication, missionId]);

    const handleReject = useCallback(async (applicationId: number) => {
        setProcessingId(applicationId);
        try {
            await rejectApplication({ id: applicationId, missionId }).unwrap();
            showSuccessToast("Application rejected", "The application has been rejected.");
            setSelectedApplicant(null);
        } catch (error) {
            showErrorToast(error, "Failed to reject application. Please try again.");
        } finally {
            setProcessingId(null);
        }
    }, [rejectApplication, missionId]);

    const onViewProfile = useCallback((application: MissionApplication) => {
        setSelectedApplicant(application);
    }, []);

    // Column definitions for DataTable
    const columns: ColumnDef<MissionApplication>[] = useMemo(
        () => [
            {
                accessorKey: "worker.firstName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Applicant" />
                ),
                cell: ({ row }) => {
                    const application = row.original;
                    const worker = application.worker;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate">
                                    {worker?.firstName} {worker?.lastName}
                                </p>
                                {worker?.speciality && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {worker.speciality.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.worker?.firstName || ""} ${row.worker?.lastName || ""}`,
            },
            {
                accessorKey: "worker.city",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Location" />
                ),
                cell: ({ row }) => {
                    const city = row.original.worker?.city;
                    return city ? (
                        <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{city}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                accessorFn: (row) => row.worker?.city || "",
            },
            {
                accessorKey: "worker.experienceYears",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Experience" />
                ),
                cell: ({ row }) => {
                    const years = row.original.worker?.experienceYears;
                    return years ? (
                        <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{years} years</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: "appliedAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Applied" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">
                        {format(new Date(row.getValue("appliedAt")), "MMM d, yyyy")}
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
                    const application = row.original;
                    const isProcessing = processingId === application.id;
                    const canProcess = application.status === "SUBMITTED";

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewProfile(application)}
                            >
                                View Profile
                            </Button>
                            {canProcess && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAccept(application.id)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Accept
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleReject(application.id)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [processingId, onViewProfile, handleAccept, handleReject]
    );

    const isLoading = missionLoading || applicationsLoading;

    if (missionLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!mission) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Mission not found</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        asChild
                    >
                        <Link to="/institution/missions">Back to Missions</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back link and mission info */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/institution/missions">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-semibold">{mission.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusBadge status={mission.status} />
                        <span>•</span>
                        <span>{applications.length} applicant{applications.length !== 1 ? "s" : ""}</span>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Applicants Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Applicants
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {applications.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Review and manage applications for this mission
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={applications}
                        isLoading={applicationsLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search applicants..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={User}
                        emptyTitle="No applicants yet"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No applicants match the selected filter."
                                : "No workers have applied to this mission yet."
                        }
                        emptyAction={
                            statusFilter !== "ALL" ? (
                                <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                                    Clear Filter
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>

            {/* Applicant Profile Dialog */}
            <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Applicant Profile</DialogTitle>
                        <DialogDescription>
                            Review the worker's qualifications and experience
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApplicant?.worker && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {selectedApplicant.worker.firstName} {selectedApplicant.worker.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={selectedApplicant.worker.status} />
                                        <StatusBadge status={selectedApplicant.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {selectedApplicant.worker.speciality && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Speciality</p>
                                        <p>{selectedApplicant.worker.speciality.name}</p>
                                    </div>
                                )}
                                {selectedApplicant.worker.experienceYears && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                                        <p>{selectedApplicant.worker.experienceYears} years</p>
                                    </div>
                                )}
                                {selectedApplicant.worker.city && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                                        <p>{selectedApplicant.worker.city}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Applied</p>
                                    <p>{new Date(selectedApplicant.appliedAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedApplicant.worker.bio && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                                    <p className="text-sm">{selectedApplicant.worker.bio}</p>
                                </div>
                            )}

                            {/* Domains */}
                            {selectedApplicant.worker.domains && selectedApplicant.worker.domains.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Domains</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.worker.domains.map((wd: { id: number; domain?: { name: string } }) => (
                                            <Badge key={wd.id} variant="secondary">
                                                {wd.domain?.name || "Domain"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedApplicant.status === "SUBMITTED" && (
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleReject(selectedApplicant.id)}
                                        disabled={isRejecting}
                                    >
                                        {isRejecting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4 mr-1" />
                                        )}
                                        Reject Application
                                    </Button>
                                    <Button
                                        onClick={() => handleAccept(selectedApplicant.id)}
                                        disabled={isAccepting}
                                    >
                                        {isAccepting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Accept Application
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

