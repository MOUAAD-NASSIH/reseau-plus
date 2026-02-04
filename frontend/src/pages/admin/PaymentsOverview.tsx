import { useTranslation } from "react-i18next";
import { AdminPaymentKPIs } from "@/components/admin/payments/AdminPaymentKPIs";
import { AdminPaymentsFilter } from "@/components/admin/payments/AdminPaymentsFilter";
import { AdminPaymentsTable } from "@/components/admin/payments/AdminPaymentsTable";
import { useAdminPayments } from "@/features/hooks/AdminHooks/useAdminPayments";

export default function PaymentsOverview() {
    const { t } = useTranslation();
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
        <div className="max-w-[1400px] mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl font-spline">
                        {t("ADMIN_PAYMENTS.TITLE")}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px]">
                        {t("ADMIN_PAYMENTS.SUBTITLE")}
                    </p>
                </div>
            </div>

            {/* KPI GRID */}
            <AdminPaymentKPIs
                totals={totals}
                isLoading={isLoading}
                formatCurrency={formatCurrency}
            />

            {/* FILTER */}
            <AdminPaymentsFilter
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onExport={handleExport}
                totalRecords={filteredPayments.length}
            />

            {/* TABLE */}
            <AdminPaymentsTable
                data={filteredPayments}
                isLoading={isLoading}
                formatCurrency={formatCurrency}
            />
        </div>
    );
}
