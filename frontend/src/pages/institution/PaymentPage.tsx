import { Navigate, Link } from "react-router";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
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
import { useTranslation } from "react-i18next";
import { ChevronLeft, Lock, Headphones, CheckCircle2, ChevronRight } from "lucide-react";

import { usePaymentPage } from "@/features/hooks/InstitutionHooks/usePaymentPage";
import { PaymentPageHeader } from "@/components/institution/payment-page/PaymentPageHeader";
import { PaymentSuccessState } from "@/components/institution/payment-page/PaymentSuccessState";
import { PaymentErrorState } from "@/components/institution/payment-page/PaymentErrorState";
import { PaymentMissionSummary } from "@/components/institution/payment-page/PaymentMissionSummary";
import { PaymentDetailsCard } from "@/components/institution/payment-page/PaymentDetailsCard";

export default function PaymentPage() {
  const { t } = useTranslation();
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
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-none bg-muted/20">
              <CardContent className="p-0">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardContent className="py-16 text-center space-y-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Lock className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-spline">Assignment Not Found</h2>
                <p className="text-muted-foreground">The resource you're looking for might have been moved or doesn't exist.</p>
              </div>
              <Button variant="outline" className="h-12 px-8 rounded-xl font-semibold" asChild>
                <Link to="/institution/missions">Back to Missions</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Check if already paid
  if (existingPayment?.status === "COMPLETED") {
    return (
      <div className="space-y-8">
        <PaymentPageHeader assignmentId={assignmentId} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaymentSuccessState
            assignmentId={assignmentId}
            existingPayment={existingPayment}
            formatCurrency={formatCurrency}
            isPreExisting
            assignment={assignment}
          />
        </motion.div>
      </div>
    );
  }

  // Check if assignment is not completed
  if (assignment.status !== "COMPLETED") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <PaymentPageHeader assignmentId={assignmentId} />
        <Alert className="border-none bg-amber-500/10 text-amber-600 dark:text-amber-400 p-6 rounded-2xl">
          <div className="space-y-4">
            <AlertTitle className="text-xl font-bold font-spline">Assignment Not Completed</AlertTitle>
            <AlertDescription className="text-base">
              Payments can only be processed for assignments that have been marked as completed by both parties.
            </AlertDescription>
            <Button variant="outline" className="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl" asChild>
              <Link to={`/institution/assignments/${assignmentId}`}>
                Go to Assignment Details
              </Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {paymentState !== "success" && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
              <Link to="/institution" className="hover:text-primary transition-colors flex items-center gap-1">
                {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.DASHBOARD")}
              </Link>
              <ChevronRight className="h-4 w-4 text-border" />
              <Link to={`/institution/assignments/${assignmentId}`} className="hover:text-primary transition-colors flex items-center gap-1">
                {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.ASSIGNMENT_ID", { id: assignmentId })}
              </Link>
              <ChevronRight className="h-4 w-4 text-border" />
              <span className="text-foreground font-medium truncate">
                {t("HEADER_TITLES.PAYMENT")}
              </span>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-spline">
                {t("PAYMENT.TITLE")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("PAYMENT.SUBTITLE")}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {t("PAYMENT.SECURE_CHECKOUT")}
              </span>
            </motion.div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {paymentState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <PaymentSuccessState
              assignmentId={assignmentId}
              formatCurrency={formatCurrency}
              assignment={assignment}
            />
          </motion.div>
        ) : paymentState === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <PaymentErrorState
              error={errorMessage}
              onRetry={handleRetry}
              onCancel={handleRetry}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            {/* Left Column: Interactive Area */}
            <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
              {paymentState === "checkout" && clientSecret ? (
                <motion.div variants={itemVariants} className="space-y-6">
                  <Card className="border-border/50 shadow-sm overflow-hidden rounded-xl bg-card transition-all">
                    <CardHeader className="p-6 border-b bg-muted/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold font-spline">
                          {t("PAYMENT.SUMMARY.TITLE")}
                        </CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <CardDescription className="text-sm pt-1">
                        Please enter your credit or debit card information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "oklch(0.5273 0.1371 150.0693)",
                              borderRadius: "8px",
                              fontFamily: 'Outfit, sans-serif',
                              colorBackground: 'transparent',
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

                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={handleRetry}
                      className="text-muted-foreground hover:text-foreground hover:bg-transparent flex items-center gap-2 group transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      {t("PAYMENT.ACTIONS.CANCEL")}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants}>
                  <PaymentDetailsCard
                    budget={assignment.mission?.budget || 0}
                    isLoading={paymentState === "loading"}
                    onInitiatePayment={handleInitiatePayment}
                    formatCurrency={formatCurrency}
                  />
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Instant Confirmation Card */}
                <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 min-w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-foreground line-clamp-1">
                        {t("PAYMENT.CARDS.INSTANT")}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t("PAYMENT.CARDS.INSTANT_DESC")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 min-w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{t("PAYMENT.CARDS.SECURITY")}</p>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">256-bit SSL</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Card */}
                <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 min-w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Headphones className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{t("PAYMENT.CARDS.SUPPORT")}</p>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">{t("PAYMENT.CARDS.GUARANTEE")}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Information Area (Sticky) */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="lg:sticky lg:top-8 space-y-8">
                <motion.div variants={itemVariants}>
                  <PaymentMissionSummary
                    assignment={assignment}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
