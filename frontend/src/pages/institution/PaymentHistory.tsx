import { useTranslation } from "react-i18next";
import { usePaymentHistory } from "@/features/hooks/InstitutionHooks/usePaymentHistory";
import { PaymentKPIs } from "@/components/institution/payments/PaymentKPIs";
import { PendingPayments } from "@/components/institution/payments/PendingPayments";
import { PaymentsTable } from "@/components/institution/payments/PaymentsTable";

export default function PaymentHistory() {
  const { t } = useTranslation();
  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    payments,
    filteredPayments,
    pendingPaymentAssignments,
    totals,
    isLoading,
    formatCurrency,
    handleExport,
  } = usePaymentHistory();

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8 font-spline">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            {t("FINANCIAL.TITLE")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-[600px]">
            {t("FINANCIAL.SUBTITLE")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Optional secondary actions can go here */}
        </div>
      </div>

      {/* KPI GRID */}
      <PaymentKPIs
        totals={totals}
        pendingCount={
          payments.filter(
            (p) => p.status === "PENDING" && (p as any).stripePaymentId === null
          ).length
        }
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      {/* PENDING PAYMENT SECTION */}
      <PendingPayments
        assignments={pendingPaymentAssignments}
        payments={payments}
        formatCurrency={formatCurrency}
      />

      {/* TABLE */}
      <PaymentsTable
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
