import { Briefcase, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentsTable } from "@/components/institution/assignments/AssignmentsTable";
import { AssignmentsFilter } from "@/components/institution/assignments/AssignmentsFilter";
import { useInstitutionAssignments } from "@/features/hooks/InstitutionHooks/useInstitutionAssignments";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function InstitutionAssignments() {
  const {
    assignments,
    isLoading,
    statusFilter,
    setStatusFilter,
    stats,
    reviewedAssignmentIds,
    paidAssignmentIds,
    handleViewAssignment,
    handlePayment,
    handleReview,
    t,
    searchQuery,
    setSearchQuery,
  } = useInstitutionAssignments();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-spline">
              {t("INSTITUTION_ASSIGNMENTS.TITLE")}
            </h1>
            {assignments.length > 0 && (
              <Badge variant="outline" className="h-7 px-3 rounded-full text-primary border-primary/20 bg-primary/5 font-mono">
                {assignments.length}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg max-w-[700px] font-medium leading-relaxed">
            {t("INSTITUTION_ASSIGNMENTS.DESCRIPTION")}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.TOTAL")}
          value={stats.total}
          icon={ListTodo}
          isLoading={isLoading}
          gradient="from-primary/10 to-primary/5"
          iconColor="text-primary"
          borderColor="border-primary/20"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.ACTIVE")}
          value={stats.active}
          icon={Clock}
          isLoading={isLoading}
          gradient="from-blue-500/10 to-blue-500/5"
          iconColor="text-blue-500"
          borderColor="border-blue-500/20"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.COMPLETED")}
          value={stats.completed}
          icon={CheckCircle2}
          isLoading={isLoading}
          gradient="from-emerald-500/10 to-emerald-500/5"
          iconColor="text-emerald-500"
          borderColor="border-emerald-500/20"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.PENDING_REVIEW")}
          value={stats.pendingReview}
          icon={Briefcase}
          isLoading={isLoading}
          gradient="from-amber-500/10 to-amber-500/5"
          iconColor="text-amber-500"
          borderColor="border-amber-500/20"
        />
      </div>

      <div className="space-y-6">
        {/* Filter Section */}
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <AssignmentsFilter
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Table Section */}
        <Card className="border-border/60 shadow-lg shadow-black/5 overflow-hidden rounded-2xl bg-card">
          <AssignmentsTable
            data={assignments}
            isLoading={isLoading}
            reviewedAssignmentIds={reviewedAssignmentIds}
            paidAssignmentIds={paidAssignmentIds}
            onViewAssignment={handleViewAssignment}
            onPayment={handlePayment}
            onReview={handleReview}
          />
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  isLoading: boolean;
  gradient: string;
  iconColor: string;
  borderColor: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  gradient,
  iconColor,
  borderColor,
}: StatCardProps) {
  return (
    <Card className={cn(
      "border overflow-hidden relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
      borderColor
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", gradient)} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            {isLoading ? (
              <Skeleton className="h-9 w-16 rounded-lg bg-background/50" />
            ) : (
              <p className="text-3xl font-black tracking-tight font-spline text-foreground">{value}</p>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center bg-background/60 backdrop-blur-sm shadow-sm border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform duration-300",
            iconColor
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
