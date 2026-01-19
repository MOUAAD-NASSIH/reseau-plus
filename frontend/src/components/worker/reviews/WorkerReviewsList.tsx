
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { User, Calendar, Quote, Building2, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import type { Review } from "@/types/review.types";

interface WorkerReviewsListProps {
    reviews: Review[];
    isLoading: boolean;
    type: "received" | "written";
}

export function WorkerReviewsList({ reviews, isLoading, type }: WorkerReviewsListProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/40">
                        <CardContent className="p-3">
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-1/4" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-1/2" />
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
            <div className="py-12">
                <EmptyState
                    icon={type === "received" ? Star : Quote}
                    title={type === "received" ? t("WORKER_REVIEWS.EMPTY.RECEIVED_TITLE") : t("WORKER_REVIEWS.EMPTY.WRITTEN_TITLE")}
                    description={type === "received"
                        ? t("WORKER_REVIEWS.EMPTY.RECEIVED_DESC")
                        : t("WORKER_REVIEWS.EMPTY.WRITTEN_DESC")
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => {
                // For "received": reviewer is institution
                // For "written": reviewee is institution
                // But wait, the API might populate `institution` object directly on review?
                // Let's assume the standard `reviewer` / `reviewee` user object which has `institution` or `worker` field.
                // We need to check how the backend sends it. The types say reviewer/reviewee are User.

                const user = type === "received" ? review.reviewer : review.reviewee;
                const isInstitution = !!user?.institution;
                const isWorker = !!user?.worker;

                // If it's a worker view, usually:
                // Received -> From Institution
                // Written -> To Institution
                // But maybe peer reviews exist? Assuming Institution for now as per key "My Reviews ... from institutions"

                const name = isInstitution
                    ? user?.institution?.institutionName
                    : isWorker
                        ? `${user?.worker?.firstName} ${user?.worker?.lastName}`
                        : t("WORKER_REVIEWS.FALLBACK_NAMES.ANONYMOUS");

                const avatar = isInstitution ? user?.institution?.logo : user?.worker?.profilePicture;

                return (
                    <Card key={review.id} className="group border-border/60 hover:border-primary/20 transition-all duration-300 bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Left Side: User Info */}
                                <div className="w-full md:w-52 p-4 md:p-5 bg-muted/20 border-b md:border-b-0 md:border-r border-border/40 flex flex-row md:flex-col items-center gap-4 md:gap-0 md:text-center justify-between md:justify-start">
                                    <div className="flex items-center gap-3 md:flex-col md:gap-0">
                                        <Avatar className="h-10 w-10 md:h-12 md:w-12 md:mb-3 ring-2 ring-background ring-offset-2 ring-offset-border/40 shrink-0">
                                            <AvatarImage src={avatar || undefined} className="object-cover" />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                                {isInstitution ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left md:text-center">
                                            <h4 className="font-semibold text-sm line-clamp-1 max-w-[150px]" title={name}>{name}</h4>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide md:mb-3">
                                                {isInstitution ? t("WORKER_REVIEWS.FALLBACK_NAMES.INSTITUTION") : t("WORKER_REVIEWS.FALLBACK_NAMES.USER")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="md:mt-auto md:w-full shrink-0">
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-medium bg-background/50 py-1 px-2 rounded-full border border-border/50">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Review Content */}
                                <div className="flex-1 p-4 md:p-5 relative">
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                                            <StarRating value={review.rating} readonly size="sm" />
                                            {(review as any).missionAssignment?.mission && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-tight shrink-0 max-w-[140px]">
                                                    <Briefcase className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{(review as any).missionAssignment.mission.title}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative">
                                            <Quote className="absolute -top-1 -left-1 h-6 w-6 md:h-8 md:w-8 text-primary/5 z-0" />
                                            <p className="text-sm text-muted-foreground leading-relaxed italic relative z-10 pl-2">
                                                {review.comment || (
                                                    <span className="text-muted-foreground/40 italic">
                                                        No comment provided for this review.
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
