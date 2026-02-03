import { useTranslation } from "react-i18next";
import { PaginationControls } from "@/components/common/PaginationControls";
import { useAdminLogs } from "@/features/hooks/AdminHooks/useAdminLogs";
import { AdminLogsStats } from "@/components/admin/logs/AdminLogsStats";
import { AdminLogsFilter } from "@/components/admin/logs/AdminLogsFilter";
import { AdminLogsTable } from "@/components/admin/logs/AdminLogsTable";
import { LogDetailsDialog } from "@/components/admin/logs/LogDetailsDialog";

export default function AdminLogs() {
  const { t } = useTranslation();
  const {
    logs,
    isLoading,
    searchQuery,
    setSearchQuery,
    actionTypeFilter,
    setActionTypeFilter,
    selectedLog,
    dialogOpen,
    setDialogOpen,
    actionTypes,
    stats,
    handleViewLog,
    clearFilters,
    hasActiveFilters,
    dateFilter,
    setDateFilter,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    pagination
  } = useAdminLogs();

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-700 font-spline">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
          {t("ADMIN_LOGS.TITLE")}
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-2xl opacity-70">
          {t("ADMIN_LOGS.SUBTITLE")}
        </p>
      </div>

      {/* Stats Overview */}
      <AdminLogsStats stats={stats} isLoading={isLoading} />

      {/* Filters Section */}
      <AdminLogsFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        actionTypeFilter={actionTypeFilter}
        onActionTypeChange={setActionTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        actionTypes={actionTypes}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Logs Table Section */}
      <AdminLogsTable
        logs={logs}
        isLoading={isLoading}
        onViewLog={handleViewLog}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      {/* Log Details Dialog */}
      <LogDetailsDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 border-t border-border/40 pt-6">
          <PaginationControls
            currentPage={page}
            totalPages={pagination.totalPages}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setPage={setPage}
            totalItems={pagination.total}
          />
        </div>
      )}
    </div>
  );
}
