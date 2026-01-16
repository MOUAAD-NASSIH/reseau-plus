import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { useGetAdminDashboardQuery } from "@/features/api/endpoints/adminEndpoints";
import { AdminProfileHeader } from "@/components/admin/profile/AdminProfileHeader";
import { AdminProfileCard } from "@/components/admin/profile/AdminProfileCard";

export default function AdminProfile() {
    const { t } = useTranslation();
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();

    const user = userData?.data?.user;
    const stats = dashboardData?.data;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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

    const getCreatedAt = () => {
        if (!user) return undefined;
        if ("createdAt" in user) {
            return user.createdAt;
        }
        return undefined;
    };

    const getStatus = () => {
        if (!user) return "Unknown";
        if ("status" in user) {
            return user.status;
        }
        return "ACTIVE";
    };

    if (userLoading || dashboardLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12 font-spline">
                <Skeleton className="h-10 w-64" />
                <Card className="border-border/40 shadow-xl rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 bg-muted/10 p-6 rounded-3xl border border-border/40">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 font-spline animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminProfileHeader t={t} />

            <AdminProfileCard
                user={user}
                stats={stats}
                t={t}
                formatDate={formatDate}
                getRoleName={getRoleName}
                getEmail={getEmail}
                getCreatedAt={getCreatedAt}
                getStatus={getStatus}
            />
        </div>
    );
}


