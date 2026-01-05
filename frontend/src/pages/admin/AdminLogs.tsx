import { useState, useMemo } from "react";
import {
    FileText,
    Search,
    Filter,
    Calendar,
    User,
    Eye,
    X,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminLogs } from "@/features/hooks/useAdmin";
import type { AdminLog } from "@/features/services/adminService";

// Action type badge colors
const actionTypeColors: Record<string, string> = {
    VERIFY_WORKER: "bg-success/10 text-success",
    REJECT_WORKER: "bg-destructive/10 text-destructive",
    APPROVE_DOCUMENT: "bg-info/10 text-info",
    REJECT_DOCUMENT: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    UPDATE_USER_STATUS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    CREATE_DOMAIN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    UPDATE_DOMAIN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    DELETE_DOMAIN: "bg-destructive/10 text-destructive",
    CREATE_SPECIALITY: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    UPDATE_SPECIALITY: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    DELETE_SPECIALITY: "bg-destructive/10 text-destructive",
};

// Get unique action types from logs
const getUniqueActionTypes = (logs: AdminLog[]): string[] => {
    const types = new Set(logs.map((log) => log.actionType));
    return Array.from(types).sort();
};

interface LogDetailsDialogProps {
    log: AdminLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
    if (!log) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Log Details
                    </DialogTitle>
                    <DialogDescription>
                        Admin action log #{log.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Action Type */}
                    <div className="flex items-center gap-3">
                        <Badge className={actionTypeColors[log.actionType] || "bg-gray-100 text-gray-800"}>
                            {log.actionType.replace(/_/g, " ")}
                        </Badge>
                    </div>

                    {/* Admin Info */}
                    <div className="space-y-1">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Admin ID
                        </Label>
                        <p className="font-medium">{log.adminId}</p>
                    </div>

                    {/* Target User */}
                    {log.targetUserId && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Target User ID
                            </Label>
                            <p className="font-medium">{log.targetUserId}</p>
                        </div>
                    )}

                    {/* Details */}
                    {log.details && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Details
                            </Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                                {log.details}
                            </p>
                        </div>
                    )}

                    {/* Date */}
                    <div className="space-y-1">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created At
                        </Label>
                        <p className="font-medium">{formatDate(log.createdAt)}</p>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground border-t pt-4">
                        <p>Log ID: {log.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminLogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [actionTypeFilter, setActionTypeFilter] = useState<string>("ALL");
    const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: logsData, isLoading: logsLoading } = useAdminLogs(
        actionTypeFilter !== "ALL" ? { actionType: actionTypeFilter } : undefined
    );

    const logs = useMemo(() => logsData?.data || [], [logsData?.data]);

    // Get unique action types for filter dropdown
    const actionTypes = useMemo(() => getUniqueActionTypes(logs), [logs]);

    // Filter logs by search query
    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs;

        const query = searchQuery.toLowerCase();
        return logs.filter(
            (log) =>
                log.id.toString().includes(query) ||
                log.adminId.toString().includes(query) ||
                log.targetUserId?.toString().includes(query) ||
                log.actionType.toLowerCase().includes(query) ||
                log.details?.toLowerCase().includes(query)
        );
    }, [logs, searchQuery]);

    const handleViewLog = (log: AdminLog) => {
        setSelectedLog(log);
        setDialogOpen(true);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setActionTypeFilter("ALL");
    };

    const hasActiveFilters = searchQuery || actionTypeFilter !== "ALL";

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Log Entries
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-info" />
                        <span className="text-2xl font-bold">{logs.length}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, admin, target user, or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Action Type Filter */}
                        <Select
                            value={actionTypeFilter}
                            onValueChange={setActionTypeFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                {actionTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace(/_/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <div className="mt-4 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear filters
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {filteredLogs.length} log(s) found
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Admin Action Logs
                        {!logsLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredLogs.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {logsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No logs found"
                            description={
                                hasActiveFilters
                                    ? "No logs match the current filters. Try adjusting your search criteria."
                                    : "There are no admin action logs yet."
                            }
                            action={
                                hasActiveFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear filters
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Admin ID</TableHead>
                                        <TableHead>Target User</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <span className="font-mono text-sm">#{log.id}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={actionTypeColors[log.actionType] || "bg-gray-100 text-gray-800"}>
                                                    {log.actionType.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {log.adminId}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.targetUserId ? (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        {log.targetUserId}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="truncate max-w-[200px] text-sm text-muted-foreground">
                                                    {log.details || "-"}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {formatDate(log.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewLog(log)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log Details Dialog */}
            <LogDetailsDialog
                log={selectedLog}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
