import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetAssignmentQuery, useUpdateAssignmentStatusMutation } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import type { AssignmentStatus } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export function useAssignedMission() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const assignmentId = parseInt(id || "0");

    const { data: assignmentData, isLoading: assignmentLoading } = useGetAssignmentQuery(assignmentId);
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery({
        missionAssignmentId: assignmentId,
    });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateAssignmentStatusMutation();

    const assignment = assignmentData?.data;
    const payments = paymentsData?.data || [];
    const payment = payments[0]; // Get the first payment for this assignment

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

    const canPay = assignment?.status === "COMPLETED" && (!payment || payment.status !== "COMPLETED");
    const isPaid = payment?.status === "COMPLETED";

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
        navigate
    };
}
