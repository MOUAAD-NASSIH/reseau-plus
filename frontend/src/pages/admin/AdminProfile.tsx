import {
    User,
    Mail,
    Shield,
    Calendar,
    Settings,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { useGetAdminDashboardQuery } from "@/features/api/endpoints/adminEndpoints";

export default function AdminProfile() {
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();

    const user = userData?.data?.user;
    const stats = dashboardData?.data;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Get role name from user
    const getRoleName = () => {
        if (!user) return "Unknown";
        if ("role" in user && user.role) {
            if (typeof user.role === "object" && "name" in user.role) {
                return user.role.name;
            }
            return String(user.role);
        }
        return "admin";
    };

    // Get email from user
    const getEmail = () => {
        if (!user) return "Unknown";
        if ("email" in user) {
            return user.email;
        }
        if ("user" in user && user.user && "email" in user.user) {
            return user.user.email;
        }
        return "Unknown";
    };

    // Get created date
    const getCreatedAt = () => {
        if (!user) return undefined;
        if ("createdAt" in user) {
            return user.createdAt;
        }
        return undefined;
    };

    // Get status
    const getStatus = () => {
        if (!user) return "Unknown";
        if ("status" in user) {
            return user.status;
        }
        return "ACTIVE";
    };

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Your admin account details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {userLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </Label>
                                <p className="font-medium text-lg">{getEmail()}</p>
                            </div>

                            {/* Role */}
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Role
                                </Label>
                                <div>
                                    <Badge variant="default" className="capitalize">
                                        {getRoleName()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    Status
                                </Label>
                                <div>
                                    <Badge
                                        variant={getStatus() === "ACTIVE" ? "default" : "destructive"}
                                        className="capitalize"
                                    >
                                        {getStatus()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Member Since
                                </Label>
                                <p className="font-medium">{formatDate(getCreatedAt())}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Admin Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Platform Overview
                    </CardTitle>
                    <CardDescription>
                        Quick stats about the platform you manage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : stats ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Workers</p>
                                <p className="text-2xl font-bold">{stats.totalWorkers}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.pendingWorkers} pending verification
                                </p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Institutions</p>
                                <p className="text-2xl font-bold">{stats.totalInstitutions}</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Missions</p>
                                <p className="text-2xl font-bold">{stats.totalMissions}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.activeMissions} active
                                </p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Payments</p>
                                <p className="text-2xl font-bold">{stats.totalPayments}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.pendingPayments} pending
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Unable to load platform stats</p>
                    )}
                </CardContent>
            </Card>

            {/* Settings Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>
                        Manage your account preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Account settings and password management are handled through the main settings panel.
                            Contact the system administrator for account-related changes.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

