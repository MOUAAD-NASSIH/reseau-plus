import { useParams, Link, useNavigate } from "react-router";
import { format } from "date-fns";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Building2,
    Briefcase,
    CheckCircle,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMission } from "@/features/hooks/useMissions";
import { useMyApplications, useApplyToMission } from "@/features/hooks/useApplications";
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

export default function MissionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading, error: missionError } = useMission(missionId);
    const { data: applicationsData, isLoading: applicationsLoading } = useMyApplications();
    const applyMutation = useApplyToMission();

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];

    // Check if already applied
    const existingApplication = applications.find((app) => app.missionId === missionId);
    const isApplied = !!existingApplication;

    const handleApply = async () => {
        try {
            await applyMutation.mutateAsync({ missionId });
            showSuccessToast("Application submitted", "Your application has been sent to the institution.");
        } catch (error) {
            showErrorToast(error, "Failed to submit application");
        }
    };

    if (missionLoading || applicationsLoading) {
        return (
            <MissionDetailsSkeleton />
        );
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
                    <Button variant="outline" onClick={() => navigate("/worker/missions")}>
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
                <Link to="/worker/missions">
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
                                {isApplied && (
                                    <Badge variant="outline" className="text-primary border-primary">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Applied
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {mission.institution?.institutionName || "Institution"}
                            </CardDescription>
                        </div>
                        <Badge className={cn("text-sm px-3 py-1", getUrgencyColor(mission.urgency))}>
                            {mission.urgency} Urgency
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        {mission.speciality && (
                            <div>
                                <h3 className="font-semibold mb-2">Required Speciality</h3>
                                <Badge variant="secondary" className="text-sm">
                                    {mission.speciality.name}
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

            {/* Institution Info */}
            {mission.institution && (
                <Card>
                    <CardHeader>
                        <CardTitle>About the Institution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{mission.institution.institutionName}</p>
                                {mission.institution.city && (
                                    <p className="text-sm text-muted-foreground">
                                        {mission.institution.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Application Status / Apply Button */}
            <Card>
                <CardContent className="p-6">
                    {isApplied ? (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">Application Submitted</p>
                                    <p className="text-sm text-muted-foreground">
                                        Status: {existingApplication?.status} • Applied on{" "}
                                        {format(new Date(existingApplication!.appliedAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/worker/applications">View My Applications</Link>
                            </Button>
                        </div>
                    ) : mission.status === "OPEN" ? (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="font-semibold">Interested in this mission?</p>
                                <p className="text-sm text-muted-foreground">
                                    Submit your application to be considered for this opportunity.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleApply}
                                disabled={applyMutation.isPending}
                            >
                                {applyMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    "Apply for this Mission"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                This mission is no longer accepting applications.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
