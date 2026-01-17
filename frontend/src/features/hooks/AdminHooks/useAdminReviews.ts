import { useState, useMemo } from "react";
import { useGetAllReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { isSameWeek, parseISO } from "date-fns";

export function useAdminReviews() {
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: reviewsData, isLoading } = useGetAllReviewsQuery();

    const allReviews = reviewsData?.data || [];

    // Filter Logic
    const filteredReviews = useMemo(() => {
        return allReviews.filter((review) => {
            // 1. Rating Filter
            if (ratingFilter !== "ALL" && review.rating !== parseInt(ratingFilter)) {
                return false;
            }

            // 2. Search Query (Reviewer, Reviewee, Comment)
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                
                // Safer name access for different user roles
                const getDisplayName = (user: any) => {
                    if (!user) return "";
                    if (user.firstName || user.lastName) {
                        return `${user.firstName || ""} ${user.lastName || ""}`.trim();
                    }
                    return user.institutionName || "";
                };

                const reviewerName = getDisplayName(review.reviewer).toLowerCase();
                const revieweeName = getDisplayName(review.reviewee).toLowerCase();
                const comment = (review.comment || "").toLowerCase();

                if (!reviewerName.includes(lowerQ) && !revieweeName.includes(lowerQ) && !comment.includes(lowerQ)) {
                    return false;
                }
            }

            return true;
        });
    }, [allReviews, ratingFilter, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => {
        if (allReviews.length === 0) {
            return {
                avg: "0.0",
                breakdown: [0, 0, 0, 0, 0],
                positiveRate: 0,
                countThisWeek: 0,
            };
        }

        const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / allReviews.length).toFixed(1);

        const breakdown = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
        allReviews.forEach((r) => {
            const index = 5 - Math.round(r.rating);
            if (index >= 0 && index < 5) {
                breakdown[index]++;
            }
        });

        const totalReviewsCount = allReviews.length;
        const breakdownPercentages = breakdown.map((count) =>
            totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0
        );

        const positiveReviews = allReviews.filter((r) => r.rating >= 4).length;
        const positiveRate = Math.round((positiveReviews / totalReviewsCount) * 100);

        const now = new Date();
        const countThisWeek = allReviews.filter((r) =>
            isSameWeek(parseISO(r.createdAt), now)
        ).length;

        return {
            avg,
            breakdown: breakdownPercentages,
            positiveRate,
            countThisWeek,
        };
    }, [allReviews]);

    return {
        reviews: allReviews,
        filteredReviews,
        stats,
        isLoading,
        ratingFilter,
        setRatingFilter,
        searchQuery,
        setSearchQuery,
        totalReviews: allReviews.length,
    };
}
