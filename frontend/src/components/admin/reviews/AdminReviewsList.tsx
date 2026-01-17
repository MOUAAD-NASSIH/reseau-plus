import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Review } from "@/types/review.types";
import { AdminReviewCard } from "./AdminReviewCard";

interface AdminReviewsListProps {
    reviews: Review[];
    isLoading: boolean;
}

export function AdminReviewsList({ reviews, isLoading }: AdminReviewsListProps) {
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
            {reviews.map((review) => (
                <AdminReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}
