import { useState, useMemo } from "react";
import { useGetAdminLogsQuery, type AdminLog } from "@/features/api/endpoints/adminEndpoints";
import { isToday, isYesterday, parseISO, subDays, isAfter } from "date-fns";

export function useAdminLogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [actionTypeFilter, setActionTypeFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL");
    const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: logsData, isLoading } = useGetAdminLogsQuery(
        actionTypeFilter !== "ALL" ? { actionType: actionTypeFilter } : undefined
    );

    const allLogs = useMemo(() => logsData?.data || [], [logsData?.data]);

    // Get unique action types for filter dropdown
    const actionTypes = useMemo(() => {
        const types = new Set(allLogs.map((log) => log.actionType));
        return Array.from(types).sort();
    }, [allLogs]);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        let logs = allLogs;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            logs = logs.filter(
                (log) =>
                    log.id.toString().includes(query) ||
                    log.adminId.toString().includes(query) ||
                    log.targetUserId?.toString().includes(query) ||
                    log.actionType.toLowerCase().includes(query) ||
                    log.details?.toLowerCase().includes(query) ||
                    log.admin?.email.toLowerCase().includes(query) ||
                    log.targetUser?.email.toLowerCase().includes(query)
            );
        }

        if (dateFilter !== "ALL") {
            const now = new Date();
            logs = logs.filter((log) => {
                const date = parseISO(log.createdAt);
                if (dateFilter === "TODAY") return isToday(date);
                if (dateFilter === "YESTERDAY") return isYesterday(date);
                if (dateFilter === "LAST_7_DAYS") return isAfter(date, subDays(now, 7));
                if (dateFilter === "LAST_30_DAYS") return isAfter(date, subDays(now, 30));
                return true;
            });
        }

        return logs;
    }, [allLogs, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => {
        if (allLogs.length === 0) {
            return {
                total: 0,
                today: 0,
                yesterday: 0,
                last7Days: 0,
                mostFrequentAction: "N/A"
            };
        }

        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);

        let todayCount = 0;
        let yesterdayCount = 0;
        let sevenDaysCount = 0;
        const actionCounts: Record<string, number> = {};

        allLogs.forEach(log => {
            const date = parseISO(log.createdAt);
            if (isToday(date)) todayCount++;
            if (isYesterday(date)) yesterdayCount++;
            if (isAfter(date, sevenDaysAgo)) sevenDaysCount++;

            actionCounts[log.actionType] = (actionCounts[log.actionType] || 0) + 1;
        });

        const mostFrequentAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        return {
            total: allLogs.length,
            today: todayCount,
            yesterday: yesterdayCount,
            last7Days: sevenDaysCount,
            mostFrequentAction: mostFrequentAction.replace(/_/g, " ")
        };
    }, [allLogs]);

    const handleViewLog = (log: AdminLog) => {
        setSelectedLog(log);
        setDialogOpen(true);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setActionTypeFilter("ALL");
        setDateFilter("ALL");
    };

    const hasActiveFilters = searchQuery !== "" || actionTypeFilter !== "ALL" || dateFilter !== "ALL";

    return {
        logs: filteredLogs,
        allLogs,
        isLoading,
        searchQuery,
        setSearchQuery,
        actionTypeFilter,
        setActionTypeFilter,
        dateFilter,
        setDateFilter,
        selectedLog,
        setSelectedLog,
        dialogOpen,
        setDialogOpen,
        actionTypes,
        stats,
        handleViewLog,
        clearFilters,
        hasActiveFilters
    };
}
