import { AdminPaymentKPIs } from "@/components/admin/payments/AdminPaymentKPIs";
import { AdminPaymentsTable } from "@/components/admin/payments/AdminPaymentsTable";
import { useAdminPayments } from "@/features/hooks/AdminHooks/useAdminPayments";

export default function PaymentsOverview() {
  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredPayments,
    totals,
    isLoading,
    formatCurrency,
    handleExport,
  } = useAdminPayments();

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8 font-spline animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            Financial Overview
          </h1>
          <p className="text-muted-foreground text-lg max-w-[600px]">
            Manage platform revenue, monitor transactions, and track worker
            payouts.
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <AdminPaymentKPIs
        totals={totals}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      {/* TABLE */}
      <AdminPaymentsTable
        data={filteredPayments}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
        onExport={handleExport}
      />
    </div>
  );
}
