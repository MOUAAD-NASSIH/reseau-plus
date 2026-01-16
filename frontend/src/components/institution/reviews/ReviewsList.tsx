import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { User, Calendar, Quote, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import type { Review } from "@/types/review.types";

interface ReviewsListProps {
    reviews: Review[];
    isLoading: boolean;
    type: "received" | "written";
}

export function ReviewsList({ reviews, isLoading, type }: ReviewsListProps) {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/40">
                        <CardContent className="p-6">
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
                    title={type === "received" ? t("REVIEWS.FEED.EMPTY_RECEIVED") : t("REVIEWS.FEED.EMPTY_WRITTEN")}
                    description={type === "received" 
                        ? t("REVIEWS.FEED.EMPTY_RECEIVED_DESC") 
                        : t("REVIEWS.FEED.EMPTY_WRITTEN_DESC")
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => {
                const user = (type === "received" ? review.reviewer : review.reviewee) as any;
                const name = type === "received" 
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || t("COMMON.SOCIAL_WORKER")
                    : `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || t("COMMON.WORKER");

                return (
                    <Card key={review.id} className="group border-border/40 hover:border-primary/20 transition-all duration-300 bg-card/60 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Left Side: User Info */}
                                <div className="w-full md:w-64 p-6 bg-muted/30 border-b md:border-b-0 md:border-r border-border/40 flex flex-col items-center text-center">
                                    <Avatar className="h-16 w-16 mb-4 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                                        <AvatarImage src={user?.profilePicture} />
                                        <AvatarFallback className="bg-primary/5 text-primary">
                                            <User className="h-8 w-8" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <h4 className="font-bold text-base line-clamp-1">{name}</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {type === "received" ? "Social Worker" : "Reviewed Worker"}
                                    </p>
                                    <div className="mt-auto pt-4 w-full">
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Review Content */}
                                <div className="flex-1 p-6 relative">
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <StarRating value={review.rating} readonly size="h-4 w-4" />
                                            {(review as any).missionAssignment?.mission && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-tight">
                                                    <Briefcase className="h-3 w-3" />
                                                    {(review as any).missionAssignment.mission.title}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative">
                                            <Quote className="absolute -top-1 -left-1 h-8 w-8 text-primary/5 -z-0" />
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
