import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Send, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
} from "@/features/api/endpoints/reviewEndpoints";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { MissionAssignment } from "@/types/assignment.types";

import { WorkerReviewsGlobalStats } from "@/components/worker/reviews/WorkerReviewsGlobalStats";
import { WorkerPendingReviews } from "@/components/worker/reviews/WorkerPendingReviews";
import { WorkerReviewsList } from "@/components/worker/reviews/WorkerReviewsList";
import { WorkerReviewForm } from "@/components/worker/reviews/WorkerReviewForm";

export default function WorkerReviews() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const preselectedAssignmentId = searchParams.get("assignmentId");

    const { data: receivedData, isLoading: receivedLoading } = useGetMyReceivedReviewsQuery();
    const { data: writtenData, isLoading: writtenLoading } = useGetMyWrittenReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetMyAssignmentsQuery();

    const isLoading = receivedLoading || writtenLoading;

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);

    const hasProcessedPreselection = useRef(false);

    const receivedReviews = receivedData?.data || [];
    const writtenReviews = writtenData?.data || [];
    const assignments = assignmentsData?.data || [];

    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");
    const reviewedAssignmentIds = new Set(writtenReviews.map((r) => r.missionAssignmentId));
    const unreviewedAssignments = completedAssignments.filter(
        (a) => !reviewedAssignmentIds.has(a.id)
    );

    // Calculate Stats
    const stats = useMemo(() => {
        if (receivedReviews.length === 0) {
            return {
                avg: "0.0",
                breakdown: [0, 0, 0, 0, 0],
                positiveRate: 0,
                countThisWeek: 0,
            };
        }

        const sum = receivedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / receivedReviews.length).toFixed(1);

        const breakdownCounts = [0, 0, 0, 0, 0];
        receivedReviews.forEach((r) => {
            const index = 5 - Math.round(r.rating); // 5->0, 4->1, etc
            if (index >= 0 && index < 5) breakdownCounts[index]++;
        });
        const breakdown = breakdownCounts.map(count => (count / receivedReviews.length) * 100);

        const positiveCount = receivedReviews.filter(r => r.rating >= 4).length;
        const positiveRate = (positiveCount / receivedReviews.length) * 100;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const countThisWeek = receivedReviews.filter(r => new Date(r.createdAt) > oneWeekAgo).length;

        return {
            avg,
            breakdown,
            positiveRate,
            countThisWeek
        };
    }, [receivedReviews]);

    const handleOpenReviewForm = (assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setShowReviewForm(true);
    };

    const handleCloseReviewForm = () => {
        setSelectedAssignment(null);
        setShowReviewForm(false);
    };

    useLayoutEffect(() => {
        if (
            preselectedAssignmentId &&
            unreviewedAssignments.length > 0 &&
            !hasProcessedPreselection.current &&
            !assignmentsLoading &&
            !isLoading
        ) {
            const assignment = unreviewedAssignments.find(
                (a) => a.id === parseInt(preselectedAssignmentId)
            );
            if (assignment) {
                hasProcessedPreselection.current = true;
                setSelectedAssignment(assignment);
                setShowReviewForm(true);
            }
        }
    }, [preselectedAssignmentId, assignmentsLoading, isLoading, unreviewedAssignments.length]);

    return (
        <div className="space-y-8 p-1">
            {/* Header / Stats Section */}

            <div className="flex flex-col gap-2 p-4">
                <h1 className="text-3xl font-black font-spline tracking-tight flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary" />
                    {t("WORKER_REVIEWS.TITLE")}
                </h1>
                <p className="text-muted-foreground">
                    {t("WORKER_REVIEWS.SUBTITLE")}
                </p>
            </div>


            <div className="space-y-6">
                <WorkerReviewsGlobalStats
                    stats={stats}
                    totalReviews={receivedReviews.length}
                    isLoading={isLoading}
                />

                <WorkerPendingReviews
                    assignments={unreviewedAssignments}
                    isLoading={assignmentsLoading}
                    onReview={handleOpenReviewForm}
                />
            </div>

            {/* Main Tabs Section */}
            <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-border/40">
                <Tabs defaultValue="received" className="w-full">
                    <div className="px-2 sm:px-5 pt-2 sm:pt-5 pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger
                                value="received"
                                className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-6"
                            >
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                                    {t("WORKER_REVIEWS.TABS.RECEIVED")}
                                </span>
                                <span className="sm:hidden">{t("WORKER_REVIEWS.TABS.RECEIVED")}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="written"
                                className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-6"
                            >
                                <Send className="h-4 w-4" />
                                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                                    {t("WORKER_REVIEWS.TABS.WRITTEN")}
                                </span>
                                <span className="sm:hidden">{t("WORKER_REVIEWS.TABS.WRITTEN")}</span>
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {receivedReviews.length} {t("WORKER_REVIEWS.SUMMARY.TOTAL_REVIEWS")}
                        </div>
                    </div>

                    <div className="p-2 sm:p-6">
                        <TabsContent
                            value="received"
                            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                        >
                            <WorkerReviewsList
                                reviews={receivedReviews}
                                isLoading={isLoading}
                                type="received"
                            />
                        </TabsContent>

                        <TabsContent
                            value="written"
                            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                        >
                            <WorkerReviewsList
                                reviews={writtenReviews}
                                isLoading={isLoading}
                                type="written"
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Review Dialog */}
            <Dialog open={showReviewForm} onOpenChange={handleCloseReviewForm}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{t("WORKER_REVIEWS.DIALOG.TITLE")}</DialogTitle>
                        <DialogDescription>
                            {t("WORKER_REVIEWS.DIALOG.DESC")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAssignment && (
                        <WorkerReviewForm
                            assignment={selectedAssignment}
                            onSuccess={handleCloseReviewForm}
                            onCancel={handleCloseReviewForm}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
