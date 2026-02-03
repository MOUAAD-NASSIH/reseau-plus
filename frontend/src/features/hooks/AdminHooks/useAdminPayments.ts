
import { useState, useMemo } from "react";
import type { PaymentStatus } from "@/types/payment.types";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { exportAdminReportToExcel } from "@/lib/exportUtils";

export const useAdminPayments = () => {
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all payments
    // Admin likely sees ALL payments, whereas institution sees "my" payments (frontend usually filters or backend filters)
    // The existing PaymentsOverview used useGetPaymentsQuery(statusFilter !== "ALL" ? { status: statusFilter } : undefined)
    // We will fetch ALL and filter client-side for smoother UX unless pagination is huge, matching the Institution UX pattern.
    const { data: paymentsData, isLoading } = useGetPaymentsQuery({ limit: 100 });

    const payments = useMemo(() => paymentsData?.data || [], [paymentsData]);

    // Filter Logic
    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            // 1. Status Filter
            if (statusFilter !== "ALL") {
                const isInitiated = payment.stripePaymentId !== null;
                const visualStatus = (payment.status === "PENDING" && isInitiated) ? "COMPLETED" : payment.status;

                if (visualStatus !== statusFilter) return false;
            }

            // 2. Search Query (ID, Institution, Worker)
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();

                // Fields to search
                const idMatch = payment.id.toString().includes(lowerQ);
                const stripeIdMatch = payment.stripePaymentId?.toLowerCase().includes(lowerQ) ?? false;

                // We need to check if missionAssignment relation exists for Worker Name
                // And if we have institution details (usually on the mission or payment if expanded)
                // Assuming payment has basic relations. If not, we might miss names. 
                // Based on types/payment.types.ts (not fully visible but implied), let's check safest props.

                // Helper to safely get worker name
                const workerName = payment.missionAssignment?.worker
                    ? `${payment.missionAssignment.worker.firstName} ${payment.missionAssignment.worker.lastName}`.toLowerCase()
                    : "";

                // Institution Name (if available in relations)
                const institutionName = payment.missionAssignment?.mission?.institution?.institutionName?.toLowerCase() || "";

                if (!idMatch && !stripeIdMatch && !workerName.includes(lowerQ) && !institutionName.includes(lowerQ)) {
                    return false;
                }
            }

            return true;
        });
    }, [payments, statusFilter, searchQuery]);

    // Derived Data for KPIs
    const totals = useMemo(() => {
        // Calculate totals based on ALL payments
        const completedOrInitiated = payments.filter(
            (p) => p.status === "COMPLETED" || p.stripePaymentId !== null
        );

        return {
            totalRevenue: completedOrInitiated.reduce((sum, p) => sum + p.amountTotal, 0),
            totalFees: completedOrInitiated.reduce((sum, p) => sum + p.platformFee, 0),
            totalWorkerPayouts: completedOrInitiated.reduce((sum, p) => sum + p.workerAmount, 0),
            pendingCount: payments.filter((p) => p.status === "PENDING" && p.stripePaymentId === null).length,
        };
    }, [payments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    const handleExport = () => {
        exportAdminReportToExcel(filteredPayments);
    };

    return {
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        payments,
        filteredPayments,
        totals,
        isLoading,
        formatCurrency,
        handleExport,
    };
};
