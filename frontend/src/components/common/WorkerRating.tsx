import { Star, Loader2 } from "lucide-react";
import { useGetWorkerRatingQuery } from "@/features/api/endpoints/reviewEndpoints";
import { cn } from "@/lib/utils";

interface WorkerRatingProps {
    workerId: number;
    className?: string;
    showLabel?: boolean;
}

export function WorkerRating({ workerId, className, showLabel = true }: WorkerRatingProps) {
    const { data, isLoading, error } = useGetWorkerRatingQuery(workerId);

    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-1 animate-pulse", className)}>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/50" />
                <span className="h-4 w-12 bg-muted rounded" />
            </div>
        );
    }

    if (error || !data?.success || !data?.data) {
        return (
            <div className={cn("flex items-center text-xs font-medium text-muted-foreground", className)}>
                <Star className="h-3.5 w-3.5 mr-1 text-muted-foreground/30" />
                No ratings
            </div>
        );
    }

    const { averageRating, totalReviews } = data.data;

    return (
        <div className={cn("flex items-center text-sm font-medium", className)}>
            <div className="flex items-center text-chart-4 bg-chart-4/10 px-2 py-0.5 rounded-md whitespace-nowrap border border-chart-4/20">
                <Star className="h-3.5 w-3.5 mr-1 fill-chart-4 shrink-0" />
                <span className="font-bold">{averageRating ? averageRating.toFixed(1) : "0.0"}</span>
                {showLabel && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground font-medium opacity-80">
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                )}
            </div>
        </div>
    );
}
