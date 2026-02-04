import { Link } from "react-router";
import { ArrowLeft, AlertCircle, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useAssignedMission } from "@/features/hooks/InstitutionHooks/useAssignedMission";
import { AssignmentHeader } from "@/components/institution/assigned-mission/AssignmentHeader";
import { MissionDetailsCard } from "@/components/institution/assigned-mission/MissionDetailsCard";
import { WorkerProfileCard } from "@/components/institution/assigned-mission/WorkerProfileCard";
import { StatusControlCard } from "@/components/institution/assigned-mission/StatusControlCard";
import { PaymentInfoCard } from "@/components/institution/assigned-mission/PaymentInfoCard";
import {
  InstitutionReviewForm,
  WorkerReviewDisplay,
  InstitutionReviewDisplay
} from "@/components/institution/assigned-mission/ReviewComponents";

export default function AssignedMissionView() {
  const { t } = useTranslation();
  const {
    assignment,
    payment,
    assignmentLoading,
    paymentsLoading,
    isUpdating,
    handleStatusChange,
    handlePayment,
    canPay,
    isPaid,
    isReviewed,
    writtenReview,
    receivedReview,
  } = useAssignedMission();

  if (assignmentLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[400px] w-full rounded-3xl" />
            <Skeleton className="h-[200px] w-full rounded-3xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[300px] w-full rounded-3xl" />
            <Skeleton className="h-[300px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {t("ASSIGNED_MISSION_VIEW.HEADER.NOT_FOUND")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          This assignment might have been removed or the ID is incorrect.
        </p>
        <Button variant="outline" asChild className="rounded-full px-8">
          <Link to="/institution/missions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("COMMON.BACK_TO_MISSIONS")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-spline">
      {/* Header Section */}
      <div className="bg-card/40 border-b border-border pb-8">
        <AssignmentHeader
          assignment={assignment}
          canPay={canPay}
          onPayment={handlePayment}
        />

        {/* Status Badges */}
        <div className="container mx-auto mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {isReviewed && (
              <Badge variant="outline" className="px-3 py-1 text-xs font-bold gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {t("ASSIGNED_MISSION_VIEW.BADGES.REVIEW_SUBMITTED") || "Review Submitted"}
              </Badge>
            )}
            {isPaid && (
              <Badge variant="outline" className="px-3 py-1 text-xs font-bold gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("ASSIGNED_MISSION_VIEW.BADGES.PAYMENT_COMPLETED")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* REVIEW SECTION (Conditional) */}
            {assignment.status === "COMPLETED" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                {/* Worker's Review (Received) */}
                {receivedReview && (
                  <WorkerReviewDisplay review={receivedReview} />
                )}

                {/* Institution's Review (Written or Form) */}
                {!isReviewed ? (
                  <InstitutionReviewForm assignment={assignment} onSuccess={() => { }} />
                ) : (
                  writtenReview && <InstitutionReviewDisplay review={writtenReview} />
                )}
              </div>
            )}

            {/* MISSION DETAILS CARD */}
            <MissionDetailsCard assignment={assignment} />

            {/* WORKER DETAILS CARD */}
            <WorkerProfileCard assignment={assignment} />
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="space-y-6">
            {/* STATUS CONTROL CARD */}
            <StatusControlCard
              assignment={assignment}
              isUpdating={isUpdating}
              onStatusChange={handleStatusChange}
            />

            {/* PAYMENT INFO CARD */}
            <PaymentInfoCard
              assignment={assignment}
              payment={payment}
              isLoading={paymentsLoading}
              canPay={canPay}
              onPayment={handlePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
