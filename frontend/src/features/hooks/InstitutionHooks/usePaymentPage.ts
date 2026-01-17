import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { useGetAssignmentQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetPaymentsQuery, useCreatePaymentIntentMutation } from "@/features/api/endpoints/paymentEndpoints";
import { showErrorToast } from "@/lib/toast";

export type PaymentState = "idle" | "loading" | "checkout" | "success" | "error";

export const usePaymentPage = () => {
    // Support both :id and :assignmentId route params
    const params = useParams<{ id?: string; assignmentId?: string }>();
    const [searchParams] = useSearchParams();
    const assignmentIdParam = params.assignmentId || params.id;
    const assignmentId = assignmentIdParam ? parseInt(assignmentIdParam) : 0;
    const isValidAssignmentId = Boolean(assignmentIdParam && !isNaN(assignmentId) && assignmentId > 0);

    // Derive initial state from URL params
    const initialState = useMemo((): PaymentState => {
        const paymentStatus = searchParams.get("payment_status");
        if (paymentStatus === "success") return "success";
        if (paymentStatus === "cancelled" || paymentStatus === "failed") return "error";
        return "idle";
    }, [searchParams]);

    const initialError = useMemo(() => {
        const paymentStatus = searchParams.get("payment_status");
        if (paymentStatus === "cancelled" || paymentStatus === "failed") {
            return "Payment was cancelled or failed. Please try again.";
        }
        return "";
    }, [searchParams]);

    const [paymentState, setPaymentState] = useState<PaymentState>(initialState);
    const [errorMessage, setErrorMessage] = useState<string>(initialError);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    // Only fetch data if we have a valid assignment ID
    const { data: assignmentData, isLoading: assignmentLoading } = useGetAssignmentQuery(
        assignmentId,
        { skip: !isValidAssignmentId }
    );
    const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = useGetPaymentsQuery(
        isValidAssignmentId ? { missionAssignmentId: assignmentId } : undefined,
        {
            skip: !isValidAssignmentId,
            refetchOnMountOrArgChange: true,
        }
    );
    const [createPaymentIntent] = useCreatePaymentIntentMutation();

    const assignment = assignmentData?.data;
    const payments = paymentsData?.data || [];
    const existingPayment = payments[0];
    const isLoading = assignmentLoading || paymentsLoading;

    const handleInitiatePayment = async () => {
        setPaymentState("loading");
        setErrorMessage("");

        try {
            const response = await createPaymentIntent({
                assignmentId,
            }).unwrap();

            if (response.data && "clientSecret" in response.data) {
                setClientSecret(response.data.clientSecret as string);
                setPaymentAmount(
                    (response.data as { amount?: number }).amount ||
                    assignment?.mission?.budget ||
                    0
                );
                setPaymentState("checkout");
            } else {
                throw new Error("Invalid response from payment service");
            }
        } catch (error: any) {
            setPaymentState("error");
            const message = error?.data?.message || error?.message || "Failed to initialize payment. Please try again.";
            setErrorMessage(message);
            showErrorToast(error, "Payment initialization failed");
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentState("success");
        refetchPayments();
    };

    const handlePaymentError = (message: string) => {
        setErrorMessage(message);
    };

    const handleRetry = () => {
        setPaymentState("idle");
        setErrorMessage("");
        setClientSecret(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    return {
        assignmentId,
        isValidAssignmentId,
        assignment,
        existingPayment,
        paymentState,
        errorMessage,
        clientSecret,
        paymentAmount,
        isLoading,
        handleInitiatePayment,
        handlePaymentSuccess,
        handlePaymentError,
        handleRetry,
        formatCurrency,
    };
};
