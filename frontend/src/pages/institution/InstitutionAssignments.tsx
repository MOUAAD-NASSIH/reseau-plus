import { Briefcase, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentsTable } from "@/components/institution/assignments/AssignmentsTable";
import { AssignmentsFilter } from "@/components/institution/assignments/AssignmentsFilter";
import { useInstitutionAssignments } from "@/features/hooks/InstitutionHooks/useInstitutionAssignments";

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
  } = useInstitutionAssignments();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          {t("INSTITUTION_ASSIGNMENTS.TITLE")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-[700px]">
          {t("INSTITUTION_ASSIGNMENTS.DESCRIPTION")}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.TOTAL")}
          value={stats.total}
          icon={ListTodo}
          isLoading={isLoading}
          color="text-primary"
          bg="bg-primary/5"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.ACTIVE")}
          value={stats.active}
          icon={Clock}
          isLoading={isLoading}
          color="text-blue-500"
          bg="bg-blue-500/5"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.COMPLETED")}
          value={stats.completed}
          icon={CheckCircle2}
          isLoading={isLoading}
          color="text-emerald-500"
          bg="bg-emerald-500/5"
        />
        <StatCard
          title={t("INSTITUTION_ASSIGNMENTS.STATS.PENDING_REVIEW")}
          value={stats.pendingReview}
          icon={Briefcase}
          isLoading={isLoading}
          color="text-amber-500"
          bg="bg-amber-500/5"
        />
      </div>

      {/* Filter Section */}
      <AssignmentsFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Table Section */}
      <AssignmentsTable
        data={assignments}
        isLoading={isLoading}
        reviewedAssignmentIds={reviewedAssignmentIds}
        paidAssignmentIds={paidAssignmentIds}
        onViewAssignment={handleViewAssignment}
        onPayment={handlePayment}
        onReview={handleReview}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  isLoading: boolean;
  color: string;
  bg: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  color,
  bg,
}: StatCardProps) {
  return (
    <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 truncate">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-12 rounded-lg" />
            ) : (
              <p className="text-3xl font-black tracking-tight">{value}</p>
            )}
          </div>
          <div
            className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-black/5`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
