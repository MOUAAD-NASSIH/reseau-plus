import { format } from "date-fns";
import { User, Calendar, Quote, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/StarRating";
import type { Review } from "@/types/review.types";

interface AdminReviewCardProps {
    review: Review;
}

export function AdminReviewCard({ review }: AdminReviewCardProps) {
    const reviewer = review.reviewer as any;
    const reviewee = review.reviewee as any;
    
    const reviewerName = `${reviewer?.firstName || ''} ${reviewer?.lastName || ''}`.trim() || reviewer?.email;
    const revieweeName = `${reviewee?.firstName || ''} ${reviewee?.lastName || ''}`.trim() || reviewee?.email;
    return (
        <Card className="group border-border/40 hover:border-primary/20 transition-all duration-300 bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Parties Involved */}
                    <div className="w-full lg:w-80 p-6 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col gap-6">
                        {/* Reviewer */}
                        <div className="flex items-center gap-3">
                            
                            <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                                <AvatarImage src={reviewer?.profilePicture} />
                                <AvatarFallback className="bg-primary/5 text-primary">
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Reviewer</span>
                                <span className="font-bold text-sm truncate">{reviewerName}</span>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-start lg:pl-4">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30 rotate-90 lg:rotate-0" />
                        </div>

                        {/* Reviewee */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-emerald-500/5">
                                <AvatarImage src={reviewee?.profilePicture} />
                                <AvatarFallback className="bg-emerald-500/5 text-emerald-500">
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Reviewee</span>
                                <span className="font-bold text-sm truncate">{revieweeName}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 p-6 relative flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <StarRating value={review.rating} readonly size="h-4 w-4" />
                            {review.missionAssignment?.mission && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tight border border-primary/10">
                                    <Briefcase className="h-3 w-3" />
                                    {review.missionAssignment.mission.title}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 relative mt-2">
                            <Quote className="absolute -top-2 -left-2 h-10 w-10 text-primary/5 -z-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed italic relative z-10 pl-3 border-l-2 border-primary/10">
                                {review.comment || (
                                    <span className="text-muted-foreground/40 italic">
                                        No comment provided for this review.
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center justify-end text-[10px] text-muted-foreground/60 font-medium">
                            Review ID: #{review.id}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
