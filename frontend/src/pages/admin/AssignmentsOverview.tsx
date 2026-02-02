import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    ListTodo,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGetAllAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";
import { cn } from "@/lib/utils";

import { AdminAssignmentsFilter } from "@/components/admin/assignments/AdminAssignmentsFilter";
import { AdminAssignmentsTable } from "@/components/admin/assignments/AdminAssignmentsTable";
import { AssignmentDetailsDialog } from "@/components/admin/assignments/AssignmentDetailsDialog";

// Reusing the StatCard design from InstitutionAssignments for consistency
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

export default function AssignmentsOverview() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetAllAssignmentsQuery();
    const assignments = assignmentsData?.data || [];

    // Filter Logic
    const filteredAssignments = useMemo(() => {
        return assignments.filter((a) => {
            const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
            const matchesSearch = searchQuery === "" ||
                `${a.worker?.firstName} ${a.worker?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.mission?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.institution?.institutionName.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [assignments, statusFilter, searchQuery]);

    // Stats Logic
    const stats = useMemo(() => {
        return {
            total: assignments.length,
            active: assignments.filter((a) => a.status === "ACTIVE").length,
            completed: assignments.filter((a) => a.status === "COMPLETED").length,
            cancelled: assignments.filter((a) => a.status === "CANCELLED").length,
            ongoing: assignments.filter((a) => a.status === "ONGOING").length,
        };
    }, [assignments]);

    const handleViewAssignment = useCallback((assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setDialogOpen(true);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-spline">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-spline">
                            {t("ASSIGNMENTS_OVERVIEW.TITLE")}
                        </h1>
                        {assignments.length > 0 && (
                            <Badge variant="outline" className="h-7 px-3 rounded-full text-primary border-primary/20 bg-primary/5 font-mono">
                                {assignments.length}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-lg max-w-[700px] font-medium leading-relaxed">
                        {t("ASSIGNMENTS_OVERVIEW.DESCRIPTION")}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.TOTAL")}
                    value={stats.total}
                    icon={ListTodo}
                    isLoading={assignmentsLoading}
                    gradient="from-primary/10 to-primary/5"
                    iconColor="text-primary"
                    borderColor="border-primary/20"
                />
                <StatCard
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.ACTIVE")}
                    value={stats.active + stats.ongoing} // Combining Active + Ongoing for high-level stat
                    icon={Clock}
                    isLoading={assignmentsLoading}
                    gradient="from-blue-500/10 to-blue-500/5"
                    iconColor="text-blue-500"
                    borderColor="border-blue-500/20"
                />
                <StatCard
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.COMPLETED")}
                    value={stats.completed}
                    icon={CheckCircle2}
                    isLoading={assignmentsLoading}
                    gradient="from-emerald-500/10 to-emerald-500/5"
                    iconColor="text-emerald-500"
                    borderColor="border-emerald-500/20"
                />
                <StatCard
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.CANCELLED")}
                    value={stats.cancelled}
                    icon={XCircle}
                    isLoading={assignmentsLoading}
                    gradient="from-rose-500/10 to-rose-500/5"
                    iconColor="text-rose-500"
                    borderColor="border-rose-500/20"
                />
            </div>

            <div className="space-y-6">
                {/* Filter Section */}
                <div className="bg-background/80 backdrop-blur-md">
                    <AdminAssignmentsFilter
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Table Section */}
                <AdminAssignmentsTable
                    data={filteredAssignments}
                    isLoading={assignmentsLoading}
                    onViewAssignment={handleViewAssignment}
                />
            </div>

            {/* Assignment Details Dialog */}
            <AssignmentDetailsDialog
                assignment={selectedAssignment}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
