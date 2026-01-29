import { useMemo } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Review } from "@/types/review.types";
import { AdminReviewGroupCard } from "./AdminReviewGroupCard";

interface AdminReviewsListProps {
    reviews: Review[];
    isLoading: boolean;
}

export function AdminReviewsList({ reviews, isLoading }: AdminReviewsListProps) {
    // Group reviews by missionAssignmentId
    const groupedReviews = useMemo(() => {
        const groups: Record<number, Review[]> = {};
        reviews.forEach(review => {
            const assignmentId = review.missionAssignmentId;
            if (!groups[assignmentId]) {
                groups[assignmentId] = [];
            }
            groups[assignmentId].push(review);
        });
        
        // Convert to array and sort by most recent review in the group
        return Object.values(groups).sort((groupA, groupB) => {
            const dateA = Math.max(...groupA.map(r => new Date(r.createdAt).getTime()));
            const dateB = Math.max(...groupB.map(r => new Date(r.createdAt).getTime()));
            return dateB - dateA;
        });
    }, [reviews]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/40 rounded-3xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col lg:flex-row h-40">
                                <Skeleton className="w-full lg:w-80 h-full" />
                                <div className="flex-1 p-6 space-y-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="py-20 bg-card/20 backdrop-blur-md rounded-3xl border border-dashed border-border/40">
                <EmptyState
                    title="No reviews found"
                    description="There are no reviews matching your current filters or in the system."
                    icon={Star}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedReviews.map((group) => (
                <AdminReviewGroupCard key={group[0].missionAssignmentId || group[0].id} reviews={group} />
            ))}
        </div>
    );
}
