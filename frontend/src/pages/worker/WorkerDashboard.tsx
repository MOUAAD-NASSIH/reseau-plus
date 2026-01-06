import { Link } from "react-router";
import {
    ClipboardList,
    CheckSquare,
    Star,
    AlertTriangle,
    Briefcase,
    ArrowRight,
    Calendar,
    Bell,
    FileText,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KPICard } from "@/components/common/KPICard";
import {
    useGetWorkerProfileQuery,
    useGetWorkerAvailabilitiesQuery,
} from "@/features/api/endpoints/workerEndpoints";
import { useGetMyApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMyReceivedReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { useGetNotificationsQuery } from "@/features/api/endpoints/notificationEndpoints";
import { format, isAfter, isBefore, addDays } from "date-fns";

export default function WorkerDashboard() {
    const { data: profileData, isLoading: profileLoading } = useGetWorkerProfileQuery();
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMyApplicationsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetMyAssignmentsQuery();
    const { data: reviewsData, isLoading: reviewsLoading } = useGetMyReceivedReviewsQuery();
    const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery();
    const { data: availabilitiesData, isLoading: availabilitiesLoading } = useGetWorkerAvailabilitiesQuery();

    const worker = profileData?.data;
    const applications = applicationsData?.data || [];
    const assignments = assignmentsData?.data || [];
    const reviews = reviewsData?.data || [];
    const notifications = notificationsData?.data || [];
    const availabilities = availabilitiesData?.data || [];

    // Calculate KPI values
    const pendingApplications = applications.filter((a) => a.status === "SUBMITTED").length;
    const activeAssignments = assignments.filter(
        (a) => a.status === "ACTIVE" || a.status === "ONGOING"
    ).length;
    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED").length;
    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : "N/A";

    // Get unread notifications
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const recentNotifications = notifications.slice(0, 5);

    // Get upcoming availabilities (next 7 days)
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const upcomingAvailabilities = availabilities.filter((a) => {
        const startDate = new Date(a.startDate);
        return isAfter(startDate, now) && isBefore(startDate, nextWeek);
    }).slice(0, 3);

    const isPending = worker?.status === "PENDING";

    return (
        <div className="space-y-6">
            {/* Verification Status Alert for PENDING workers */}
            {isPending && (
                <Alert variant="destructive" className="border-2 border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-semibold">Account Pending Verification</AlertTitle>
                    <AlertDescription className="mt-2">
                        Your account is currently under review. You will be able to browse and
                        apply for missions once your profile and documents are verified by an
                        administrator.
                        <Link to="/worker/documents" className="ml-1 underline font-medium hover:text-destructive">
                            Upload your documents
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Pending Applications"
                    value={pendingApplications}
                    icon={ClipboardList}
                    description="Awaiting response"
                    isLoading={applicationsLoading}
                    variant="info"
                    href="/worker/applications"
                />
                <KPICard
                    title="Active Assignments"
                    value={activeAssignments}
                    icon={CheckSquare}
                    description="Currently working on"
                    isLoading={assignmentsLoading}
                    variant="success"
                    href="/worker/assignments"
                />
                <KPICard
                    title="Completed Missions"
                    value={completedAssignments}
                    icon={Briefcase}
                    description="Successfully finished"
                    isLoading={assignmentsLoading}
                    variant="default"
                    href="/worker/assignments"
                />
                <KPICard
                    title="Average Rating"
                    value={averageRating}
                    icon={Star}
                    description={`Based on ${reviews.length} reviews`}
                    isLoading={reviewsLoading}
                    variant="warning"
                    href="/worker/reviews"
                />
            </div>

            {/* Quick Actions */}
            {!isPending && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link to="/worker/missions">
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    Browse Missions
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/worker/availability">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Update Availability
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/worker/documents">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Manage Documents
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Profile Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {profileLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ) : worker ? (
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {worker.firstName} {worker.lastName}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Status:
                                    </span>
                                    <StatusBadge status={worker.status} />
                                </div>
                                {worker.speciality && (
                                    <p className="text-sm text-muted-foreground">
                                        Speciality: {worker.speciality.name}
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/worker/profile">
                                    Edit Profile
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Unable to load profile</p>
                    )}
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Recent Notifications */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                            {unreadNotifications.length > 0 && (
                                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                                    {unreadNotifications.length}
                                </span>
                            )}
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/worker/notifications">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {notificationsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : recentNotifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No notifications yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border ${!notification.isRead
                                            ? "bg-primary/5 border-primary/20"
                                            : "bg-muted/50"
                                            }`}
                                    >
                                        <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Applications & Assignments */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Recent Applications */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Recent Applications</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/worker/applications">View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {applicationsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : applications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No applications yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {applications.slice(0, 3).map((app) => (
                                        <div
                                            key={app.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">
                                                    {app.mission?.title || "Mission"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Applied{" "}
                                                    {format(new Date(app.appliedAt), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Assignments */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Recent Assignments</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/worker/assignments">View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {assignmentsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : assignments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No assignments yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {assignments.slice(0, 3).map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">
                                                    {assignment.mission?.title || "Mission"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {assignment.institution?.institutionName ||
                                                        "Institution"}
                                                </p>
                                            </div>
                                            <StatusBadge status={assignment.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Availability Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Upcoming Availability
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/worker/availability">Manage</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {availabilitiesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : upcomingAvailabilities.length === 0 ? (
                        <div className="text-center py-6">
                            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">
                                No upcoming availability set
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/worker/availability">
                                    Add Availability
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAvailabilities.map((availability) => (
                                <div
                                    key={availability.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-success/20">
                                            <Calendar className="h-4 w-4 text-success" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {format(new Date(availability.startDate), "EEEE, MMM d")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(availability.startDate), "MMM d")} -{" "}
                                                {format(new Date(availability.endDate), "MMM d, yyyy")}
                                                {availability.isRecurring && " (Recurring)"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {availabilities.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{availabilities.length - 3} more availability slots
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

