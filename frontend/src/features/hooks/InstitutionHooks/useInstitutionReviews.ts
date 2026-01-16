import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useCreateReviewMutation,
} from "@/features/api/endpoints/reviewEndpoints";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { Review } from "@/types/review.types";
import type { MissionAssignment } from "@/types/assignment.types";
import { isSameWeek, parseISO } from "date-fns";

export function useInstitutionReviews() {
    const [searchParams] = useSearchParams();
    const preselectedAssignmentId = searchParams.get("assignmentId");

    const { data: receivedData, isLoading: receivedLoading } = useGetMyReceivedReviewsQuery();
    const { data: writtenData, isLoading: writtenLoading } = useGetMyWrittenReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery({ status: "COMPLETED" });

    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);

    const receivedReviews = receivedData?.data || [];
    const writtenReviews = writtenData?.data || [];
    const assignments = assignmentsData?.data || [];

    // Filter assignments that haven't been reviewed yet
    const reviewedAssignmentIds = new Set(writtenReviews.map((r) => r.missionAssignmentId));
    const pendingReviews = assignments.filter((a) => !reviewedAssignmentIds.has(a.id));

    // Calculate stats
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

        const breakdown = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
        receivedReviews.forEach((r) => {
            const index = 5 - Math.round(r.rating);
            if (index >= 0 && index < 5) {
                breakdown[index]++;
            }
        });

        const breakdownPercentages = breakdown.map((count) =>
            receivedReviews.length > 0 ? (count / receivedReviews.length) * 100 : 0
        );

        const positiveReviews = receivedReviews.filter((r) => r.rating >= 4).length;
        const positiveRate = Math.round((positiveReviews / receivedReviews.length) * 100);

        const now = new Date();
        const countThisWeek = receivedReviews.filter((r) =>
            isSameWeek(parseISO(r.createdAt), now)
        ).length;

        return {
            avg,
            breakdown: breakdownPercentages,
            positiveRate,
            countThisWeek,
        };
    }, [receivedReviews]);

    const handleOpenReviewDialog = (assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setIsDialogOpen(true);
    };

    const handleCloseReviewDialog = () => {
        setSelectedAssignment(null);
        setIsDialogOpen(false);
    };

    return {
        receivedReviews,
        writtenReviews,
        pendingReviews,
        stats,
        totalReviews: receivedReviews.length,
        isLoading: receivedLoading || writtenLoading || assignmentsLoading,
        isCreating,
        isDialogOpen,
        selectedAssignment,
        preselectedAssignmentId,
        handleOpenReviewDialog,
        handleCloseReviewDialog,
        createReview,
    };
}
