import { Navigate, Link } from "react-router";
import { Elements } from "@stripe/react-stripe-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { stripePromise } from "@/lib/stripe";
import { StripeCheckoutForm } from "@/components/payment/StripeCheckoutForm";

import { usePaymentPage } from "@/features/hooks/InstitutionHooks/usePaymentPage";
import { PaymentPageHeader } from "@/components/institution/payment-page/PaymentPageHeader";
import { PaymentSuccessState } from "@/components/institution/payment-page/PaymentSuccessState";
import { PaymentErrorState } from "@/components/institution/payment-page/PaymentErrorState";
import { PaymentMissionSummary } from "@/components/institution/payment-page/PaymentMissionSummary";
import { PaymentDetailsCard } from "@/components/institution/payment-page/PaymentDetailsCard";

export default function PaymentPage() {
  const {
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
  } = usePaymentPage();

  // If no valid assignment ID, redirect to payment history
  if (!isValidAssignmentId) {
    return <Navigate to="/institution/payments/history" replace />;
  }

  if (isLoading) {
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
            <Button variant="outline" className="mt-4" asChild>
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
        <PaymentPageHeader assignmentId={assignmentId} />
        <PaymentSuccessState
          assignmentId={assignmentId}
          existingPayment={existingPayment}
          formatCurrency={formatCurrency}
          isPreExisting
        />
      </div>
    );
  }

  // Check if assignment is not completed
  if (assignment.status !== "COMPLETED") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PaymentPageHeader assignmentId={assignmentId} />
        <Alert>
          <AlertTitle>Assignment Not Completed</AlertTitle>
          <AlertDescription>
            You can only process payment for completed assignments. Please mark
            the assignment as completed first.
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
        <PaymentPageHeader assignmentId={assignmentId} />
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
      <PaymentPageHeader assignmentId={assignmentId} title="Process Payment" />

      {/* Success State */}
      {paymentState === "success" && (
        <PaymentSuccessState
          assignmentId={assignmentId}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Error State */}
      {paymentState === "error" && (
        <PaymentErrorState errorMessage={errorMessage} onRetry={handleRetry} />
      )}

      {/* Checkout State - Stripe Elements */}
      {paymentState === "checkout" && clientSecret && (
        <>
          <PaymentMissionSummary
            assignment={assignment}
            formatCurrency={formatCurrency}
          />

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
          <PaymentMissionSummary
            assignment={assignment}
            formatCurrency={formatCurrency}
          />
          <PaymentDetailsCard
            budget={assignment.mission?.budget || 0}
            isLoading={paymentState === "loading"}
            onInitiatePayment={handleInitiatePayment}
            formatCurrency={formatCurrency}
          />
        </>
      )}
    </div>
  );
}
