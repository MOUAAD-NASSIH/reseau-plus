import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
    ClipboardList,
    Calendar,
    User,
    Building2,
    Briefcase,
    ListTodo,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetAllAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { MissionAssignment, AssignmentStatus } from "@/types/assignment.types";

import { AdminAssignmentsFilter } from "@/components/admin/assignments/AdminAssignmentsFilter";
import { AdminAssignmentsTable } from "@/components/admin/assignments/AdminAssignmentsTable";

interface AssignmentDetailsDialogProps {
    assignment: MissionAssignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AssignmentDetailsDialog({ assignment, open, onOpenChange }: AssignmentDetailsDialogProps) {
    const { t } = useTranslation();
    if (!assignment) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        {t("ASSIGNMENTS_OVERVIEW.DIALOG.TITLE")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("ASSIGNMENTS_OVERVIEW.DIALOG.SUBTITLE", { id: assignment.id })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={assignment.status} />
                    </div>

                    {/* Worker Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {t("ASSIGNMENTS_OVERVIEW.DIALOG.ASSIGNED_WORKER")}
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {assignment.worker?.user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Institution Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {t("ASSIGNMENTS_OVERVIEW.DIALOG.INSTITUTION")}
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {assignment.institution?.institutionName || t("COMMON.UNKNOWN")}
                            </p>
                            {assignment.institution?.address && (
                                <p className="text-sm text-muted-foreground">
                                    {assignment.institution.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Mission Info */}
                    {assignment.mission && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {t("ASSIGNMENTS_OVERVIEW.DIALOG.MISSION")}
                            </Label>
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="font-medium">{assignment.mission.title}</p>
                                {assignment.mission.location && (
                                    <p className="text-sm text-muted-foreground">
                                        {assignment.mission.location}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <StatusBadge status={assignment.mission.status} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {t("ASSIGNMENTS_OVERVIEW.DIALOG.ASSIGNED_AT")}
                            </Label>
                            <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
                        </div>
                        {assignment.mission && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t("ASSIGNMENTS_OVERVIEW.DIALOG.MISSION_PERIOD")}</Label>
                                <p className="font-medium">
                                    {formatDate(assignment.mission.startDate)} - {formatDate(assignment.mission.endDate)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
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

function StatCard({ title, value, icon: Icon, isLoading, color, bg }: StatCardProps) {
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
                    <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-black/5`}>
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

    // Fetch data (using client-side filtering logic for now to match current hook structure if API supports it later)
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
        };
    }, [assignments]);

    const handleViewAssignment = useCallback((assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setDialogOpen(true);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-spline">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
                    {t("ASSIGNMENTS_OVERVIEW.TITLE")}
                </h1>
                <p className="text-muted-foreground text-lg max-w-[700px]">
                    {t("ASSIGNMENTS_OVERVIEW.DESCRIPTION")}
                </p>
            </div>

             {/* Stats Overview */}
             <div className="grid gap-4 md:grid-cols-4">
                <StatCard 
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.TOTAL")} 
                    value={stats.total} 
                    icon={ListTodo} 
                    isLoading={assignmentsLoading} 
                    color="text-primary"
                    bg="bg-primary/5"
                />
                <StatCard 
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.ACTIVE")} 
                    value={stats.active} 
                    icon={Clock} 
                    isLoading={assignmentsLoading} 
                    color="text-blue-500"
                    bg="bg-blue-500/5"
                />
                <StatCard 
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.COMPLETED")} 
                    value={stats.completed} 
                    icon={CheckCircle2} 
                    isLoading={assignmentsLoading} 
                    color="text-emerald-500"
                    bg="bg-emerald-500/5"
                />
                <StatCard 
                    title={t("ASSIGNMENTS_OVERVIEW.STATS.CANCELLED")} 
                    value={stats.cancelled} 
                    icon={XCircle} 
                    isLoading={assignmentsLoading} 
                    color="text-rose-500"
                    bg="bg-rose-500/5"
                />
            </div>

            {/* Filter Section */}
            <AdminAssignmentsFilter 
                statusFilter={statusFilter} 
                onStatusChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Table Section */}
            <AdminAssignmentsTable
                data={filteredAssignments}
                isLoading={assignmentsLoading}
                onViewAssignment={handleViewAssignment}
            />

            {/* Assignment Details Dialog */}
            <AssignmentDetailsDialog
                assignment={selectedAssignment}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
