import { Link } from "react-router";
import {
    Briefcase,
    Users,
    CreditCard,
    Star,
    ArrowRight,
    PlusCircle,
    Clock,
    CheckCircle,
    FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { useGetInstitutionProfileQuery } from "@/features/api/endpoints/institutionEndpoints";
import { useGetMyMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { useGetMyReceivedReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";

export default function InstitutionDashboard() {
    const { data: profileData, isLoading: profileLoading } = useGetInstitutionProfileQuery();
    const { data: missionsData, isLoading: missionsLoading } = useGetMyMissionsQuery();
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery();
    const { data: reviewsData, isLoading: reviewsLoading } = useGetMyReceivedReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery();

    const institution = profileData?.data;
    const missions = missionsData?.data || [];
    const payments = paymentsData?.data || [];
    const reviews = reviewsData?.data || [];
    const assignments = assignmentsData?.data || [];

    // Calculate KPI values
    const activeMissions = missions.filter(
        (m) => m.status === "OPEN" || m.status === "ONGOING"
    ).length;
    const openMissions = missions.filter((m) => m.status === "OPEN").length;
    const ongoingMissions = missions.filter((m) => m.status === "ONGOING").length;

    // Pending applications: count missions that are OPEN (accepting applications)
    const pendingApplicationsCount = openMissions;

    // Assigned missions count
    const assignedMissionsCount = assignments.filter(
        (a) => a.status === "ACTIVE" || a.status === "ONGOING"
    ).length;
    const completedAssignmentsCount = assignments.filter(
        (a) => a.status === "COMPLETED"
    ).length;

    // Payment status
    const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
    const completedPayments = payments.filter((p) => p.status === "COMPLETED").length;
    const totalPaymentAmount = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amountTotal, 0);

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : "N/A";

    // Get missions with pending applications (missions that are OPEN)
    const missionsWithPendingApplicants = missions.filter((m) => m.status === "OPEN");

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Active Missions"
                    value={activeMissions}
                    icon={Briefcase}
                    description={`${openMissions} open, ${ongoingMissions} ongoing`}
                    isLoading={missionsLoading}
                    variant="info"
                    href="/institution/missions"
                />
                <KPICard
                    title="Pending Applications"
                    value={pendingApplicationsCount}
                    icon={FileText}
                    description="Missions accepting applications"
                    isLoading={missionsLoading}
                    variant={pendingApplicationsCount > 0 ? "warning" : "default"}
                    href="/institution/missions"
                />
                <KPICard
                    title="Assigned Missions"
                    value={assignedMissionsCount}
                    icon={Users}
                    description={`${completedAssignmentsCount} completed`}
                    isLoading={assignmentsLoading}
                    variant="success"
                />
                <KPICard
                    title="Payment Status"
                    value={pendingPayments > 0 ? `${pendingPayments} pending` : `${completedPayments} paid`}
                    icon={CreditCard}
                    description={
                        totalPaymentAmount > 0
                            ? `${totalPaymentAmount.toLocaleString()} MAD total paid`
                            : "No payments yet"
                    }
                    isLoading={paymentsLoading}
                    variant={pendingPayments > 0 ? "warning" : "success"}
                    href="/institution/payments/history"
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <KPICard
                    title="Average Rating"
                    value={averageRating}
                    icon={Star}
                    description={`Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
                    isLoading={reviewsLoading}
                    variant={
                        averageRating !== "N/A" && parseFloat(averageRating) >= 4
                            ? "success"
                            : "default"
                    }
                    href="/institution/reviews"
                />
                <KPICard
                    title="Ongoing Missions"
                    value={ongoingMissions}
                    icon={Clock}
                    description="Currently in progress"
                    isLoading={missionsLoading}
                    variant={ongoingMissions > 0 ? "info" : "default"}
                />
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Institution Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    {profileLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ) : institution ? (
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">{institution.institutionName}</p>
                                {institution.city && (
                                    <p className="text-sm text-muted-foreground">
                                        {institution.city}
                                        {institution.address && ` - ${institution.address}`}
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/institution/profile">
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

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Missions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Missions</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/institution/missions">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {missionsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : missions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No missions yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {missions.slice(0, 3).map((mission) => (
                                    <div
                                        key={mission.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{mission.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(mission.startDate).toLocaleDateString()} -{" "}
                                                {new Date(mission.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <StatusBadge status={mission.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {missionsLoading || paymentsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : missionsWithPendingApplicants.length === 0 && pendingPayments === 0 ? (
                            <div className="text-center py-4">
                                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    No pending actions
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {missionsWithPendingApplicants.slice(0, 2).map((mission) => (
                                    <Link
                                        key={mission.id}
                                        to={`/institution/missions/${mission.id}/applicants`}
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate text-sm">
                                                    {mission.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Review applicants
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                                {pendingPayments > 0 && (
                                    <Link
                                        to="/institution/payments/history"
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate text-sm">
                                                    {pendingPayments} pending payment{pendingPayments > 1 ? "s" : ""}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Complete payments
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link to="/institution/missions/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Mission
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/institution/missions">View My Missions</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/institution/payments/history">Payment History</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

