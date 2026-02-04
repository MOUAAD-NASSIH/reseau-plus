import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useGetAssignmentQuery, useUpdateAssignmentStatusMutation } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { useGetMyWrittenReviewsQuery, useGetMyReceivedReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import type { AssignmentStatus } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export function useAssignedMission() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const assignmentId = parseInt(id || "0");

    const { data: assignmentData, isLoading: assignmentLoading } = useGetAssignmentQuery(assignmentId, {
        refetchOnMountOrArgChange: true
    });
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery({
        missionAssignmentId: assignmentId,
    }, {
        refetchOnMountOrArgChange: true,
        // Poll every 3 seconds if assignment is completed but not paid yet
        // This helps the UI update "instantly" after the webhook finishes
        pollingInterval: (assignmentData?.data?.status === 'COMPLETED' &&
            !assignmentData?.data?.payments?.some(p => p.status === 'COMPLETED')) ? 3000 : 0
    });
    const { data: writtenReviewsData } = useGetMyWrittenReviewsQuery();
    const { data: receivedReviewsData } = useGetMyReceivedReviewsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateAssignmentStatusMutation();

    const assignment = assignmentData?.data;

    // Combine payments from both query sources to ensure we have the absolute latest
    // and correctly filtered data (embedded in assignment might be slightly stale compared to poll)
    const payments = useMemo(() => {
        const fetchLevelPayments = paymentsData?.data || [];
        const embeddedPayments = assignment?.payments || [];

        // Use the polling results if they exist, otherwise fallback to embedded
        return fetchLevelPayments.length > 0 ? fetchLevelPayments : embeddedPayments;
    }, [paymentsData?.data, assignment?.payments]);

    const payment = payments[0]; // Get the primary payment record

    // Review states
    const isReviewed = useMemo(() =>
        writtenReviewsData?.data?.some(r => r.missionAssignmentId === assignmentId),
        [writtenReviewsData, assignmentId]
    );

    const writtenReview = useMemo(() =>
        writtenReviewsData?.data?.find(r => r.missionAssignmentId === assignmentId),
        [writtenReviewsData, assignmentId]
    );

    const receivedReview = useMemo(() =>
        receivedReviewsData?.data?.find(r => r.missionAssignmentId === assignmentId),
        [receivedReviewsData, assignmentId]
    );

    const handleStatusChange = async (newStatus: AssignmentStatus) => {
        try {
            await updateStatus({ id: assignmentId, status: newStatus }).unwrap();
            showSuccessToast(t("COMMON.STATUS_UPDATED"), t("COMMON.STATUS_UPDATED_DESC"));
        } catch (error) {
            showErrorToast(error, t("COMMON.FAILED_TO_UPDATE"));
        }
    };

    const handlePayment = () => {
        navigate(`/institution/payments/${assignmentId}`);
    };

    const isPaid = useMemo(() =>
        assignment?.status === 'COMPLETED' && payments.some(p => p.status === 'COMPLETED'),
        [payments, assignment?.status]
    );

    const canPay = assignment?.status === "COMPLETED" && !isPaid;

    return {
        assignment,
        payment,
        assignmentLoading,
        paymentsLoading,
        isUpdating,
        handleStatusChange,
        handlePayment,
        canPay,
        isPaid,
        assignmentId,
        navigate,
        isReviewed,
        writtenReview,
        receivedReview,
    };
}
