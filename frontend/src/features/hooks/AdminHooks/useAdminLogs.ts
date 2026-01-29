import { useState, useMemo } from "react";
import { useGetAdminLogsQuery, type AdminLog } from "@/features/api/endpoints/adminEndpoints";
import { isToday, isYesterday, parseISO, subDays, isAfter } from "date-fns";

export function useAdminLogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [actionTypeFilter, setActionTypeFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL");
    const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch data with pagination
    const { data: logsData, isLoading } = useGetAdminLogsQuery({
        actionType: actionTypeFilter !== "ALL" ? actionTypeFilter : undefined,
        page,
        limit: pageSize,
        // Backend filtering can be added here if the API supports it
        // For now filtering is client-side for search/date but pagination is server-side
        // Note: Ideally search/date filtering should also be server-side for true pagination
    });

    const allLogs = useMemo(() => logsData?.data || [], [logsData?.data]);
    const pagination = logsData?.pagination;

    // Get unique action types from all potential logs (optimistic or fetched)
    // Note: With server-side pagination this might only show types from current page
    // Using a separate metadata endpoint for filters would be better, but we'll use what we have
    const actionTypes = useMemo(() => {
        const types = new Set(allLogs.map((log) => log.actionType));
        return Array.from(types).sort();
    }, [allLogs]);

    // Client-side filtering logic remains for search/date until API supports it
    // If API supports search/date, these should be passed to useGetAdminLogsQuery instead
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
                    log.reason?.toLowerCase().includes(query) ||
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
    }, [allLogs, searchQuery, dateFilter]);

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
            total: pagination?.total || allLogs.length, // Use server total if available
            today: todayCount,
            yesterday: yesterdayCount,
            last7Days: sevenDaysCount,
            mostFrequentAction: mostFrequentAction.replace(/_/g, " ")
        };
    }, [allLogs, pagination]);

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
        hasActiveFilters,
        // Pagination exports
        page,
        setPage,
        pageSize,
        setPageSize,
        pagination
    };
}
