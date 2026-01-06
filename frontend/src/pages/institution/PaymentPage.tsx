import { useState, useMemo } from "react";
import { useParams, Link, useSearchParams, Navigate } from "react-router";
import { Elements } from "@stripe/react-stripe-js";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAssignmentQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetPaymentsQuery, useCreatePaymentIntentMutation } from "@/features/api/endpoints/paymentEndpoints";
import { showErrorToast } from "@/lib/toast";
import { stripePromise } from "@/lib/stripe";
import { StripeCheckoutForm } from "@/components/payment/StripeCheckoutForm";

type PaymentState = "idle" | "loading" | "checkout" | "success" | "error";

export default function PaymentPage() {
    // Support both :id and :assignmentId route params
    const params = useParams<{ id?: string; assignmentId?: string }>();
    const [searchParams] = useSearchParams();
    const assignmentIdParam = params.assignmentId || params.id;
    const assignmentId = assignmentIdParam ? parseInt(assignmentIdParam) : 0;
    const isValidAssignmentId = assignmentIdParam && !isNaN(assignmentId) && assignmentId > 0;

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
            // Refetch when the assignment ID changes to ensure fresh data
            refetchOnMountOrArgChange: true,
        }
    );
    const [createPaymentIntent] = useCreatePaymentIntentMutation();

    // If no valid assignment ID, redirect to payment history
    if (!isValidAssignmentId) {
        return <Navigate to="/institution/payments/history" replace />;
    }

    const assignment = assignmentData?.data;
    const payments = paymentsData?.data || [];
    const existingPayment = payments[0];

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
        } catch (error) {
            setPaymentState("error");
            const err = error as { data?: { message?: string }; message?: string };
            const message = err?.data?.message || err?.message || "Failed to initialize payment. Please try again.";
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
        // Don't change state to error, let user retry from checkout
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

    if (assignmentLoading || paymentsLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-6 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Assignment not found</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            asChild
                        >
                            <Link to="/institution/missions">Back to Missions</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if already paid
    if (existingPayment?.status === "COMPLETED") {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/institution/assignments/${assignmentId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Payment</h1>
                </div>

                <Card>
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Completed</h2>
                        <p className="text-muted-foreground mb-6">
                            This assignment has already been paid.
                        </p>
                        <div className="bg-muted rounded-lg p-4 max-w-sm mx-auto">
                            <div className="flex justify-between mb-2">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="font-semibold">
                                    {formatCurrency(existingPayment.amountTotal)}
                                </span>
                            </div>
                            {existingPayment.paidAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid On</span>
                                    <span>
                                        {new Date(existingPayment.paidAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Button className="mt-6" asChild>
                            <Link to="/institution/payments/history">View Payment History</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if assignment is not completed
    if (assignment.status !== "COMPLETED") {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/institution/assignments/${assignmentId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Payment</h1>
                </div>

                <Alert>
                    <AlertTitle>Assignment Not Completed</AlertTitle>
                    <AlertDescription>
                        You can only process payment for completed assignments. Please mark the
                        assignment as completed first.
                    </AlertDescription>
                </Alert>

                <Button asChild>
                    <Link to={`/institution/assignments/${assignmentId}`}>
                        Go to Assignment
                    </Link>
                </Button>
            </div>
        );
    }

    // Check if Stripe is configured
    if (!stripePromise) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/institution/assignments/${assignmentId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Payment</h1>
                </div>

                <Alert variant="destructive">
                    <AlertTitle>Payment Not Available</AlertTitle>
                    <AlertDescription>
                        Payment processing is not configured. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to={`/institution/assignments/${assignmentId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Process Payment</h1>
            </div>

            {/* Success State */}
            {paymentState === "success" && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                        <p className="text-muted-foreground mb-6">
                            The payment has been processed successfully.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" asChild>
                                <Link to={`/institution/assignments/${assignmentId}`}>
                                    View Assignment
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link to="/institution/payments/history">
                                    View Payment History
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {paymentState === "error" && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
                        <p className="text-muted-foreground mb-6">
                            {errorMessage || "Something went wrong. Please try again."}
                        </p>
                        <Button onClick={handleRetry}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Checkout State - Stripe Elements */}
            {paymentState === "checkout" && clientSecret && (
                <>
                    {/* Mission Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mission</span>
                                <span className="font-medium">{assignment.mission?.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Worker</span>
                                <span>
                                    {assignment.worker?.firstName} {assignment.worker?.lastName}
                                </span>
                            </div>
                            {assignment.mission?.budget && (
                                <>
                                    <div className="border-t pt-4 flex justify-between">
                                        <span className="font-semibold">Total Amount</span>
                                        <span className="font-semibold text-lg">
                                            {formatCurrency(assignment.mission.budget)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The worker will receive{" "}
                                        {formatCurrency(assignment.mission.budget * 0.85)} after
                                        platform fees (15%).
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stripe Payment Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>
                                Enter your payment information below
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Elements
                                stripe={stripePromise}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        theme: "stripe",
                                        variables: {
                                            colorPrimary: "#0f172a",
                                        },
                                    },
                                }}
                            >
                                <StripeCheckoutForm
                                    amount={paymentAmount || assignment.mission?.budget || 0}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            </Elements>
                        </CardContent>
                    </Card>

                    {/* Cancel Button */}
                    <div className="text-center">
                        <Button variant="ghost" onClick={handleRetry}>
                            Cancel and Go Back
                        </Button>
                    </div>
                </>
            )}

            {/* Idle/Loading State - Payment Summary */}
            {(paymentState === "idle" || paymentState === "loading") && (
                <>
                    {/* Mission Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mission</span>
                                <span className="font-medium">{assignment.mission?.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Worker</span>
                                <span>
                                    {assignment.worker?.firstName} {assignment.worker?.lastName}
                                </span>
                            </div>
                            {assignment.mission?.budget && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mission Budget</span>
                                    <span className="font-semibold">
                                        {formatCurrency(assignment.mission.budget)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>
                                Review the payment breakdown before proceeding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assignment.mission?.budget ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(assignment.mission.budget)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Platform Fee (15%)
                                        </span>
                                        <span>
                                            {formatCurrency(assignment.mission.budget * 0.15)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-semibold text-lg">
                                            {formatCurrency(assignment.mission.budget)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The worker will receive{" "}
                                        {formatCurrency(assignment.mission.budget * 0.85)} after
                                        platform fees.
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    No budget specified for this mission.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Proceed to Payment Button */}
                    <Card>
                        <CardContent className="py-6">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleInitiatePayment}
                                disabled={paymentState === "loading" || !assignment.mission?.budget}
                            >
                                {paymentState === "loading" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Initializing Payment...
                                    </>
                                ) : (
                                    "Proceed to Checkout"
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center mt-4">
                                You will be able to enter your card details on the next screen.
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

