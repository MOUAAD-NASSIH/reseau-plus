import * as React from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Star,
  CheckCircle,
  MapPin,
  Building,
  ChevronRight,
  Briefcase,
  CreditCard,
  Search,
  AlertCircle,
  MessageCircle,
  Clock
} from "lucide-react";
import {
  useGetWorkerProfileQuery,
  useGetMyApplicationsQuery,
  useGetMyAssignmentsQuery,
  useGetWorkerAverageRatingQuery,
} from "@/features/api/endpoints/workerEndpoints";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
} from "@/features/api/endpoints/notificationEndpoints";
import { toast } from "sonner";
import type { MissionAssignment } from "@/types/assignment.types";
import type { MissionApplication } from "@/types/application.types";
import type { Notification } from "@/types/notification.types";

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function WorkerDashboardPage() {
  const navigate = useNavigate();

  // Data Fetching
  const me = useGetWorkerProfileQuery();
  const workerId = me.data?.data?.id;
  // Applications
  const pendingApps = useGetMyApplicationsQuery({ status: "SUBMITTED", page: 1, limit: 5 });
  // Assignments
  const activeAssignments = useGetMyAssignmentsQuery({ status: "ACTIVE", page: 1, limit: 5 });
  // Querying completed assignments for earnings calculation
  const completedAssignments = useGetMyAssignmentsQuery({ status: "COMPLETED", page: 1, limit: 100 });
  // Rating
  const rating = useGetWorkerAverageRatingQuery(
    { workerId: workerId ?? 0 },
    { skip: !workerId || workerId <= 0 }
  );
  // Notifications
  const notifications = useGetNotificationsQuery({ page: 1, limit: 5 });
  const unread = useGetUnreadNotificationCountQuery();

  // Derived State
  const firstName = me.data?.data?.firstName ?? "there";
  const completedList = React.useMemo(
    () => completedAssignments.data?.data ?? [],
    [completedAssignments.data?.data]
  );

  // Earnings: sum of completed mission budgets * 0.85 (15% platform fee)
  const totalEarnings = React.useMemo(() => {
    return completedList.reduce((acc: number, assignment: MissionAssignment) => {
      const budget = assignment.mission?.budget || 0;
      return acc + Number(budget);
    }, 0) * 0.85;
  }, [completedList]);

  const activeList = activeAssignments.data?.data ?? [];
  const activeMission = activeList[0];
  const appList = pendingApps.data?.data ?? [];
  const notifList = notifications.data?.data ?? [];
  const totalMissionsCompleted = completedAssignments.data?.pagination?.total ?? completedList.length;

  // Error logging
  React.useEffect(() => {
    const err =
      me.error ||
      pendingApps.error ||
      activeAssignments.error ||
      completedAssignments.error ||
      rating.error ||
      notifications.error ||
      unread.error;
    if (err) console.error("Dashboard Error:", err);
  }, [me.error, pendingApps.error, activeAssignments.error, completedAssignments.error, rating.error, notifications.error, unread.error]);

  const isLoadingInitial = me.isLoading || activeAssignments.isLoading;

  // Resolve active mission data with proper typing
  interface ActiveMissionData {
    id: number;
    title: string;
    institutionName: string;
    institutionId?: number;
    location: string;
    startDate?: string;
    institutionUserId?: number;
  }

  const activeMissionData = React.useMemo<ActiveMissionData | null>(() => {
    if (!activeMission) return null;
    return {
      id: activeMission.id,
      title: activeMission.mission?.title ?? "Untitled Mission",
      institutionName: activeMission.institution?.institutionName ?? activeMission.mission?.institution?.institutionName ?? "Unknown Institution",
      institutionId: activeMission.institutionId ?? activeMission.mission?.institutionId,
      location: activeMission.mission?.location ?? "Remote",
      startDate: activeMission.mission?.startDate,
      institutionUserId: activeMission.institution?.userId ?? activeMission.mission?.institution?.userId
    };
  }, [activeMission]);


  if (isLoadingInitial) {
    return (
      <div className="w-full py-8 space-y-8 animate-in fade-in duration-500">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative bg-card border-b border-border">
        <div className="px-2 md:px-4 py-4 lg:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-extrabold font-spline tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome back, {firstName}
              </h1>
              <p className="text-muted-foreground font-spline text-lg">
                You have <span className="font-semibold text-foreground">{activeList.length} active missions</span> and <span className="font-semibold text-foreground">{unread.data?.data?.count ?? 0} new notifications</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 h-11 border-primary/20 hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link to="/worker/availability">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Availability</span>
                </Link>
              </Button>
              <Button className="gap-2 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                <Link to="/worker/missions">
                  <Search className="h-4 w-4" />
                  <span>Find Missions</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 space-y-8">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Missions"
            value={activeList.length}
            icon={<Briefcase />}
            description="Currently in progress"
          />
          <StatCard
            title="Missions Completed"
            value={totalMissionsCompleted}
            icon={<CheckCircle />}
            description="All time count"
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(totalEarnings)}
            icon={<CreditCard />}
            description="Estimated net earnings"
            trend="+12%" // Placeholder trend
            trendUp={true}
          />
          <StatCard
            title="Average Rating"
            value={(rating.data?.data?.average ?? 0).toFixed(1)}
            icon={<Star />}
            description={`${rating.data?.data?.count ?? 0} total reviews`}
            className="border-primary/20 bg-primary/5"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Mission Highlight */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-spline flex items-center gap-2">
                  <CurrentMissionIcon className="h-5 w-5 text-primary" />
                  Active Mission
                </h2>
                {activeMissionData && (
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
                    <Link to={`/worker/assignments/${activeMissionData.id}`} className="gap-1">
                      View Details <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {activeMissionData ? (
                <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Placeholder */}
                    <div className="md:w-64 h-48 md:h-auto bg-muted relative">
                      {/* Ideally real image here. Using pattern for now. */}
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-muted flex items-center justify-center">
                        <Building className="h-12 w-12 text-primary/40" />
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-none shadow-xs">
                          In Progress
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {activeMissionData.title}
                        </h3>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                          <Building className="h-3.5 w-3.5" />
                          {activeMissionData.institutionName}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-sm text-foreground/80">
                          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {activeMissionData.location}
                          </div>
                          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {activeMissionData.startDate && new Date(activeMissionData.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <Button className="flex-1 gap-2" asChild>
                          <Link to={`/worker/assignments/${activeMissionData.id}`}>
                            View Mission
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Contact Institution"
                          onClick={() => {
                            if (activeMissionData.institutionUserId) {
                              navigate("/worker/messages", {
                                state: { startConversationWith: activeMissionData.institutionUserId }
                              });
                            } else {
                              toast.error("Institution contact info not available");
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center h-48 text-center p-6">
                  <div className="p-3 bg-muted rounded-full mb-3">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No active mission</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
                    You don't have any missions currently in progress. Apply to new opportunities!
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/worker/missions">Find Missions</Link>
                  </Button>
                </Card>
              )}
            </section>

            {/* Recent Applications Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-spline flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  Recent Applications
                </h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
                  <Link to="/worker/applications" className="gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <Card className="border-border bg-card shadow-sm overflow-hidden">
                {pendingApps.isLoading ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : appList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No pending applications</p>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                      You haven't submitted any applications recently.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/worker/missions">Browse Missions</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block relative w-full overflow-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 font-semibold border-b border-border">
                          <tr>
                            <th className="px-6 py-4">Mission</th>
                            <th className="px-6 py-4">Institution</th>
                            <th className="px-6 py-4">Applied Date</th>
                            <th className="px-6 py-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {appList.map((app: MissionApplication) => (
                            <tr
                              key={app.id}
                              className="group hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => navigate(`/worker/missions/${app.missionId}`)}
                            >
                              <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                                {app.mission?.title || "Untitled Application"}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Building className="h-3.5 w-3.5 text-muted-foreground/70" />
                                  {app.mission?.institution?.institutionName || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground tabular-nums">
                                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Badge
                                  variant={app.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                                  className={cn(
                                    "capitalize font-medium border-0 shadow-xs",
                                    app.status === 'SUBMITTED' && "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20",
                                    app.status === 'ACCEPTED' && "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
                                    app.status === 'REJECTED' && "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20"
                                  )}
                                >
                                  {app.status ? app.status.toLowerCase() : "unknown"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-border">
                      {appList.map((app: MissionApplication) => (
                        <div
                          key={app.id}
                          className="p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
                          onClick={() => navigate(`/worker/missions/${app.missionId}`)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {app.mission?.title || "Untitled"}
                              </h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Building className="h-3 w-3" />
                                {app.mission?.institution?.institutionName || "Unknown"}
                              </p>
                            </div>
                            <Badge
                              variant={app.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                              className={cn(
                                "capitalize shrink-0 text-[10px] px-1.5 h-5",
                                app.status === 'SUBMITTED' && "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                                app.status === 'ACCEPTED' && "bg-green-500/10 text-green-700 dark:text-green-400",
                                app.status === 'REJECTED' && "bg-red-500/10 text-red-700 dark:text-red-400"
                              )}
                            >
                              {app.status ? app.status.toLowerCase() : "unknown"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  to="/worker/availability"
                  icon={<Calendar className="h-5 w-5" />}
                  label="Availability"
                  color="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                />
                <QuickActionButton
                  to="/worker/documents"
                  icon={<FileText className="h-5 w-5" />}
                  label="Documents"
                  color="bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                />
                <QuickActionButton
                  to="/worker/reviews"
                  icon={<Star className="h-5 w-5" />}
                  label="Reviews"
                  color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
                />
                <QuickActionButton
                  to="/worker/help"
                  icon={<AlertCircle className="h-5 w-5" />}
                  label="Support"
                  color="bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20"
                />
              </CardContent>
            </Card>

            {/* Notifications Feed */}
            <Card className="bg-card border-border shadow-sm flex flex-col h-full max-h-[400px]">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider">
                  Notifications
                </CardTitle>
                {unread.data?.data?.count ? (
                  <Badge variant="destructive" className="h-5 px-1.5 min-w-5">
                    {unread.data.data.count}
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4 pr-1">
                {notifList.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center italic">
                    No new notifications.
                  </p>
                ) : (
                  notifList.map((n: Notification) => (
                    <div key={n.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="min-w-[8px] min-h-[8px] rounded-full bg-primary mt-1.5"></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight capitalize">{n.type.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {n.createdAt && new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="p-4 pt-0">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground" asChild>
                  <Link to="/worker/notifications">View All</Link>
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendUp,
  className
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(
      "bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 relative z-10 w-full">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </div>
            </div>
            {(description || trend) && (
              <div className="flex items-center gap-2 text-xs">
                {trend && (
                  <Badge variant={trendUp ? "default" : "destructive"} className={cn("h-5 px-1.5 font-medium", trendUp ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25" : "")}>
                    {trend}
                  </Badge>
                )}
                {description && <span className="text-muted-foreground font-medium">{description}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-500">
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-24 w-24" }) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ to, icon, label, color }: { to: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-border/50 bg-card hover:border-primary/20 hover:shadow-md group",
        "relative overflow-hidden"
      )}
    >
      <div className={cn("p-2.5 rounded-full backdrop-blur-sm transition-colors duration-300", color)}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors">{label}</span>
    </Link>
  );
}

// Icon wrapper for section headers
const CurrentMissionIcon = ({ className }: { className?: string }) => (
  <div className="p-2 bg-primary/10 rounded-lg inline-flex items-center justify-center mr-3 shadow-sm">
    <LayoutDashboard className={cn("h-5 w-5 text-primary", className)} />
  </div>
);
