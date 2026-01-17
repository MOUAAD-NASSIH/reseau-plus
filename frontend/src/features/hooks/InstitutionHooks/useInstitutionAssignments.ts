import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMyWrittenReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import type { MissionAssignment } from "@/types/assignment.types";

export function useInstitutionAssignments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery();
    const { data: reviewsData, isLoading: reviewsLoading } = useGetMyWrittenReviewsQuery();
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery();

    const assignments = assignmentsData?.data || [];
    const reviews = reviewsData?.data || [];
    const payments = paymentsData?.data || [];

    const reviewedAssignmentIds = useMemo<Set<number>>(
        () => new Set(reviews.map((r) => r.missionAssignmentId)),
        [reviews]
    );

    const paidAssignmentIds = useMemo<Set<number>>(
        () => new Set(payments
            .filter(p => p.status === 'COMPLETED' || p.stripePaymentId !== null)
            .map((p) => p.missionAssignmentId)),
        [payments]
    );

    const filteredAssignments = useMemo(() => {
        if (statusFilter === "ALL") return assignments;
        return assignments.filter((a) => a.status === statusFilter);
    }, [assignments, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: assignments.length,
            active: assignments.filter((a) => a.status === "ACTIVE").length,
            completed: assignments.filter((a) => a.status === "COMPLETED").length,
            pendingReview: assignments.filter(
                (a) => a.status === "COMPLETED" && !reviewedAssignmentIds.has(a.id)
            ).length,
        };
    }, [assignments, reviewedAssignmentIds]);

    const handleViewAssignment = (assignment: MissionAssignment) => {
        navigate(`/institution/assignments/${assignment.id}`);
    };

    const handlePayment = (assignmentId: number) => {
        navigate(`/institution/payments/${assignmentId}`);
    };

    const handleReview = (assignmentId: number) => {
        navigate(`/institution/reviews?assignmentId=${assignmentId}`);
    };

    return {
        assignments: filteredAssignments,
        isLoading: assignmentsLoading || reviewsLoading || paymentsLoading,
        statusFilter,
        setStatusFilter,
        stats,
        reviewedAssignmentIds,
        paidAssignmentIds,
        handleViewAssignment,
        handlePayment,
        handleReview,
        t,
    };
}
