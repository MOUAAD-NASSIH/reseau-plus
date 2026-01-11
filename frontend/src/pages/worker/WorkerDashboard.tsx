import * as React from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar, FileText, User, Bell } from "lucide-react";

import {
  useGetWorkerMeQuery,
  useGetMyApplicationsQuery,
  useGetMyAssignmentsQuery,
  useGetWorkerAverageRatingQuery,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from "@/services/api/workerDashboardApi";

function getTotal<T>(res?: { data?: T[]; pagination?: { total?: number } }) {
  // If backend exposes pagination.total, use it; otherwise fallback to array length.
  return res?.pagination?.total ?? res?.data?.length ?? 0;
}

function StatCard(props: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("bg-card/60 border-border/60", props.className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{props.label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
        {props.hint ? <p className="mt-1 text-xs text-muted-foreground">{props.hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function WorkerDashboardPage() {
  const me = useGetWorkerMeQuery();

  const pendingApps = useGetMyApplicationsQuery({ status: "SUBMITTED", page: 1, limit: 5 });
  const activeAssignments = useGetMyAssignmentsQuery({ status: "ACTIVE", page: 1, limit: 5 });
  const completedAssignments = useGetMyAssignmentsQuery({ status: "COMPLETED", page: 1, limit: 1 });

  const workerId = me.data?.data.id;
  const rating = useGetWorkerAverageRatingQuery(
    { workerId: workerId ?? 0 },
    { skip: !workerId || workerId <= 0 }
  );

  const notifications = useGetNotificationsQuery({ page: 1, limit: 3 });
  const unread = useGetUnreadCountQuery();

  React.useEffect(() => {
    // Optional: centralize this in baseQuery; here is page-level safety.
    const err =
      me.error || pendingApps.error || activeAssignments.error || completedAssignments.error || rating.error || notifications.error || unread.error;
    if (err) toast.error("Some dashboard data failed to load. Please refresh.");
  }, [me.error, pendingApps.error, activeAssignments.error, completedAssignments.error, rating.error, notifications.error, unread.error]);

  const firstName = me.data?.data.firstName ?? "there";

  // Placeholder “completeness”: until you compute from real fields, keep it stable.
  const profileCompleteness = 85;

  const upcoming = activeAssignments.data?.data ?? [];
  const apps = pendingApps.data?.data ?? [];
  const notifs = notifications.data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-10 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your missions today.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <Link to="/worker/availability">Availability</Link>
          </Button>
          <Button asChild>
            <Link to="/worker/missions">Find missions</Link>
          </Button>
        </div>
      </div>

      {/* KPI row (requested additions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending applications"
          value={pendingApps.isLoading ? <Skeleton className="h-8 w-16" /> : getTotal(pendingApps.data)}
          hint="Awaiting institution decision"
        />
        <StatCard
          label="Active assignments"
          value={activeAssignments.isLoading ? <Skeleton className="h-8 w-16" /> : getTotal(activeAssignments.data)}
          hint="Currently scheduled/in progress"
        />
        <StatCard
          label="Completed missions"
          value={completedAssignments.isLoading ? <Skeleton className="h-8 w-16" /> : getTotal(completedAssignments.data)}
          hint="All-time completed"
        />
        <StatCard
          label="Average rating"
          value={
            rating.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <span>
                {(rating.data?.data.average ?? 0).toFixed(1)}
                <span className="text-sm text-muted-foreground"> / 5</span>
              </span>
            )
          }
          hint={rating.data?.data.count ? `${rating.data.data.count} reviews` : undefined}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile completeness */}
          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Profile completeness</div>
                  <div className="text-primary font-semibold">{profileCompleteness}%</div>
                </div>
                <Progress value={profileCompleteness} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete your profile to unlock premium missions.
                </p>
              </div>
              <Button variant="outline" className="md:self-start" asChild>
                <Link to="/worker/documents">Upload ID verification</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming missions (assignments) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upcoming missions</h2>
              <Button variant="link" asChild className="px-0">
                <Link to="/worker/assignments">View all</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {activeAssignments.isLoading ? (
                <>
                  <Skeleton className="h-[92px] w-full" />
                  <Skeleton className="h-[92px] w-full" />
                </>
              ) : upcoming.length === 0 ? (
                <Card className="bg-card/60 border-border/60">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No upcoming assignments yet.
                  </CardContent>
                </Card>
              ) : (
                upcoming.slice(0, 2).map((a: any) => (
                  <Card key={a.id} className="bg-card/60 border-border/60 hover:border-primary/40 transition-colors">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold truncate">{a.mission?.title ?? "Assignment"}</div>
                          <Badge variant="secondary">{a.status}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground truncate">
                          {a.mission?.institution?.name ?? a.mission?.institutionName ?? "Institution"}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                          <span className="rounded bg-muted px-2 py-1">
                            {a.startDate ? new Date(a.startDate).toLocaleString() : "Date TBD"}
                          </span>
                          <span className="rounded bg-muted px-2 py-1">
                            {a.location ?? "Location"}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" asChild className="sm:self-start">
                        <Link to="/worker/assignments">View details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Application status table */}
          <div>
            <h2 className="text-xl font-bold mb-4">Application status</h2>
            <Card className="bg-card/60 border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {pendingApps.isLoading ? (
                  <div className="p-6">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full mt-3" />
                    <Skeleton className="h-8 w-full mt-3" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Applied date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-muted-foreground">
                            No pending applications.
                          </TableCell>
                        </TableRow>
                      ) : (
                        apps.map((app: any) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.mission?.title ?? "Mission"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {app.mission?.institution?.name ?? "Institution"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{app.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick actions */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm tracking-wider uppercase text-muted-foreground">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="h-auto py-6 flex flex-col gap-2" asChild>
                <Link to="/worker/availability">
                  <Calendar className="h-5 w-5" />
                  <span className="font-bold">Update availability</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-6 flex flex-col gap-2" asChild>
                <Link to="/worker/documents">
                  <FileText className="h-5 w-5" />
                  <span className="font-bold">My documents</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-6 flex flex-col gap-2" asChild>
                <Link to="/worker/profile">
                  <User className="h-5 w-5" />
                  <span className="font-bold">Profile</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-6 flex flex-col gap-2" asChild>
                <Link to="/worker/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="font-bold">Notifications</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm tracking-wider uppercase text-muted-foreground">Notifications</CardTitle>
              <Badge variant="destructive">
                {unread.isLoading ? "…" : `${unread.data?.data.count ?? 0} new`}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.isLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : notifs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications.</p>
              ) : (
                notifs.map((n: any) => (
                  <div key={n.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <div className="text-sm font-medium">{n.title ?? "Notification"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{n.message ?? ""}</div>
                    <div className="text-[10px] text-muted-foreground mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Reputation (simple) */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm tracking-wider uppercase text-muted-foreground">Your reputation</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end gap-3">
              <div className="text-4xl font-extrabold leading-none">
                {(rating.data?.data.average ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {rating.data?.data.count ? `${rating.data.data.count} reviews` : "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
