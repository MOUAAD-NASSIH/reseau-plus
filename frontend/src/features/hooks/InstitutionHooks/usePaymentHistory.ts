
import { useState, useMemo } from "react";
import type { PaymentStatus } from "@/types/payment.types";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { exportToExcel } from "@/lib/exportUtils";

export const usePaymentHistory = () => {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery({ limit: 100 });
  const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery();

  const payments = useMemo(() => paymentsData?.data || [], [paymentsData]);
  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData]);

  const isLoading = paymentsLoading || assignmentsLoading;

  // Filter Logic for payments table
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // 1. Status Filter
      if (statusFilter !== "ALL") {

        const isInitiated = (payment as any).stripePaymentId !== null;
        const visualStatus = (payment.status === "PENDING" && isInitiated) ? "COMPLETED" : payment.status;

        if (visualStatus !== statusFilter) return false;
      }

      // 2. Search Query (Mission Title or Worker Name)
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const missionTitle = (payment as any).missionAssignment?.mission?.title?.toLowerCase() || "";
        const workerName = (payment as any).missionAssignment?.worker
          ? `${(payment as any).missionAssignment.worker.firstName} ${(payment as any).missionAssignment.worker.lastName}`.toLowerCase()
          : "";

        if (!missionTitle.includes(lowerQ) && !workerName.includes(lowerQ)) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  // Derived Data for KPIs
  const totals = useMemo(() => {
    const totalPaid = payments
      .filter((p) => p.status === "COMPLETED" || (p as any).stripePaymentId !== null)
      .reduce((sum, p) => sum + p.amountTotal, 0);

    const totalPending = payments
      .filter((p) => p.status === "PENDING" && (p as any).stripePaymentId === null)
      .reduce((sum, p) => sum + p.amountTotal, 0);

    const activeMissions = assignments.filter((a) => a.status === "ACTIVE" || a.status === "ONGOING").length;

    return { totalPaid, totalPending, activeMissions };
  }, [payments, assignments]);

  // Pending assignments (Completed assignments awaiting payment)
  const pendingPaymentAssignments = useMemo(() => {
    // Find completed assignments that don't have a COMPLETED or initiated payment yet
    return assignments.filter((assignment) => {
      if (assignment.status !== "COMPLETED") return false;

      // 1. Check reactive global payments list (for real-time updates after payment)
      const paymentInGlobalList = payments.find(p => p.missionAssignmentId === assignment.id);
      const isPaidOrInitiatedGlobal = paymentInGlobalList && (paymentInGlobalList.status === "COMPLETED" || (paymentInGlobalList as any).stripePaymentId !== null);

      if (isPaidOrInitiatedGlobal) return false;

      // 2. Check robust nested payments list (source of truth from backend, includes all records)
      const paymentsForThisAssignment = assignment.payments || [];
      const isPaidOrInitiatedNested = paymentsForThisAssignment.some(
        p => p.status === "COMPLETED" || (p as any).stripePaymentId !== null
      );

      return !isPaidOrInitiatedNested;
    });
  }, [assignments, payments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(amount);
  };

  const handleExport = () => {
    exportToExcel(filteredPayments, "Réseau+");
  };

  return {
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
  };
};
