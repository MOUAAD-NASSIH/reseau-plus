import { useParams, Link, useNavigate } from "react-router";
import { format } from "date-fns";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Briefcase,
    Edit,
    Users,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { useGetMissionQuery, useDeleteMissionMutation } from "@/features/api/endpoints/missionEndpoints";
import { useGetMissionApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import type { Urgency } from "@/types/mission.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function getUrgencyColor(urgency: Urgency) {
    switch (urgency) {
        case "HIGH":
            return "bg-destructive text-destructive-foreground";
        case "MEDIUM":
            return "bg-warning text-warning-foreground";
        case "LOW":
            return "bg-success text-success-foreground";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function MissionDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function InstitutionMissionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading, error: missionError } = useGetMissionQuery(missionId);
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMissionApplicationsQuery({ missionId });
    const [deleteMission] = useDeleteMissionMutation();

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];
    const pendingApplications = applications.filter((app) => app.status === "SUBMITTED");

    const handleDelete = async () => {
        try {
            await deleteMission(missionId).unwrap();
            showSuccessToast("Mission deleted", "The mission has been deleted successfully.");
            navigate("/institution/missions");
        } catch (error) {
            showErrorToast(error, "Failed to delete mission. Please try again.");
        }
    };

    if (missionLoading || applicationsLoading) {
        return <MissionDetailsSkeleton />;
    }

    if (missionError || !mission) {
        return (
            <>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Mission not found</AlertTitle>
                    <AlertDescription>
                        The mission you're looking for doesn't exist or has been removed.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate("/institution/missions")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Missions
                    </Button>
                </div>
            </>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-4">
                <Link to="/institution/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Missions
                </Link>
            </Button>

            {/* Main Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-2xl">{mission.title}</CardTitle>
                                <StatusBadge status={mission.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Created {format(new Date(mission.createdAt), "MMM d, yyyy")}</span>
                                {applications.length > 0 && (
                                    <span>• {applications.length} applicant{applications.length !== 1 ? "s" : ""}</span>
                                )}
                            </div>
                        </div>
                        <Badge className={cn("text-sm px-3 py-1", getUrgencyColor(mission.urgency))}>
                            {mission.urgency} Urgency
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link to={`/institution/missions/${mission.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Mission
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={`/institution/missions/${mission.id}/applicants`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Applicants
                                {pendingApplications.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {pendingApplications.length}
                                    </Badge>
                                )}
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Mission
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
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Description */}
                    {mission.description && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {mission.description}
                            </p>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {mission.location && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">{mission.location}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(mission.startDate), "MMM d, yyyy")} -{" "}
                                    {format(new Date(mission.endDate), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                        {mission.budget && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Budget</p>
                                    <p className="text-sm text-muted-foreground">
                                        {mission.budget.toLocaleString()} MAD
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Status</p>
                                <p className="text-sm text-muted-foreground">{mission.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Speciality & Domains */}
                    <div className="space-y-3">
                        {mission.requiredSpeciality && (
                            <div>
                                <h3 className="font-semibold mb-2">Required Speciality</h3>
                                <Badge variant="outline">
                                    {mission.requiredSpeciality.name}
                                    <span className="ml-1 text-xs text-destructive">*</span>
                                </Badge>
                            </div>
                        )}
                        {mission.domains && mission.domains.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Domains</h3>
                                <div className="flex flex-wrap gap-2">
                                    {mission.domains.map((md) => (
                                        <Badge key={md.id} variant="outline">
                                            {md.domain?.name}
                                            {md.isRequired && (
                                                <span className="ml-1 text-xs text-destructive">*</span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                                {mission.domains.some((md) => md.isRequired) && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        * Required domain
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Applicants Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Applicants Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <p className="text-muted-foreground">No applicants yet for this mission.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <p className="text-2xl font-bold">{applications.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Applicants</p>
                                </div>
                                <div className="p-4 rounded-lg bg-warning/10 text-center">
                                    <p className="text-2xl font-bold text-warning">
                                        {pendingApplications.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending Review</p>
                                </div>
                                <div className="p-4 rounded-lg bg-success/10 text-center">
                                    <p className="text-2xl font-bold text-success">
                                        {applications.filter((app) => app.status === "ACCEPTED").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Accepted</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to={`/institution/missions/${mission.id}/applicants`}>
                                    <Users className="mr-2 h-4 w-4" />
                                    View All Applicants
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

