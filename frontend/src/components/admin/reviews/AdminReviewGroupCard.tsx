import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { User, Briefcase, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/StarRating";
import type { Review } from "@/types/review.types";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminReviewGroupCardProps {
    reviews: Review[];
}

export function AdminReviewGroupCard({ reviews }: AdminReviewGroupCardProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'fr' ? fr : enUS;

    if (!reviews.length) return null;

    // Use the first review to get common mission data
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const firstReview = sortedReviews[0];
    const mission = firstReview.missionAssignment?.mission;
    const missionAssignment = firstReview.missionAssignment;

    // Helper to get diverse participant names
    const workerName = `${missionAssignment?.worker?.firstName || ''} ${missionAssignment?.worker?.lastName || ''}`.trim() || t("COMMON.WORKER");
    const institutionName = missionAssignment?.institution?.institutionName || t("COMMON.INSTITUTION");

    return (
        <Card className="group border-border/40 hover:border-primary/20 transition-all duration-300 bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Mission Context (Left Panel) - Fixed for the group */}
                    <div className="w-full lg:w-72 p-6 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col gap-6 shrink-0">

                        {/* Mission Badge */}
                        <div className="flex flex-col gap-3">
                            <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full">
                                <Briefcase className="h-3 w-3 mr-1.5" />
                                {t("ADMIN_REVIEWS.ADMIN.CARD.CONTEXT_TITLE")}
                            </Badge>

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                    {t("ADMIN_REVIEWS.ADMIN.CARD.MISSION_TITLE")}
                                </span>
                                <span className="font-bold text-base leading-tight">
                                    {mission?.title || t("COMMON.UNTITLED_MISSION")}
                                </span>
                            </div>

                            {mission?.location && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        {t("COMMON.LOCATION")}
                                    </span>
                                    <span className="font-medium text-sm text-muted-foreground">
                                        {mission.location}
                                    </span>
                                </div>
                            )}

                            {/* Participants Summary */}
                            <div className="pt-4 mt-auto border-t border-border/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        {t("ADMIN_REVIEWS.ADMIN.CARD.PARTICIPANTS")}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {sortedReviews.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background/50 border border-border/50">
                                    <TooltipProvider delayDuration={0}>
                                        <div className="flex items-center gap-2">
                                            {/* Worker */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative group/avatar cursor-pointer">
                                                        <Avatar className="h-9 w-9 ring-2 ring-background transition-transform hover:scale-105 hover:ring-primary/20">
                                                            <AvatarImage src={missionAssignment?.worker?.user?.profilePicture || undefined} />
                                                            <AvatarFallback className="bg-primary/10 text-primary"><User className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded-sm shadow-sm pointer-events-none">
                                                            W
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="font-bold text-xs" side="bottom">
                                                    {t("ADMIN_REVIEWS.ADMIN.CARD.WORKER")} ({workerName})
                                                </TooltipContent>
                                            </Tooltip>

                                            <div className="h-4 w-px bg-border/60 mx-1"></div>

                                            {/* Institution */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative group/avatar cursor-pointer">
                                                        <Avatar className="h-9 w-9 ring-2 ring-background transition-transform hover:scale-105 hover:ring-blue-500/20">
                                                            <AvatarImage src={missionAssignment?.institution?.logo || missionAssignment?.institution?.user?.profilePicture || undefined} />
                                                            <AvatarFallback className="bg-blue-500/10 text-blue-500"><Building2 className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-sm shadow-sm pointer-events-none">
                                                            I
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="font-bold text-xs" side="bottom">
                                                    {t("ADMIN_REVIEWS.ADMIN.CARD.INSTITUTION")} ({institutionName})
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>

                                    <div className="text-[10px] font-medium text-muted-foreground text-right leading-tight max-w-[80px]">
                                        {t("ADMIN_REVIEWS.ADMIN.CARD.EXCHANGED", { count: sortedReviews.length })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List (Right Panel) */}
                    <div className="flex-1 flex flex-col divide-y divide-border/20">
                        {sortedReviews.map((review) => {
                            const reviewer = review.reviewer as any;
                            const reviewee = review.reviewee as any;

                            // Initial detection function
                            const detectRole = (userId: number, userObject: any) => {
                                // 1. Direct Relation Check (Strongest)
                                if (userObject?.institution) return 'INSTITUTION';
                                if (userObject?.worker) return 'WORKER';

                                // 2. Context Matching (ID based from Assignment)
                                const assignment = missionAssignment || review.missionAssignment;
                                if (assignment?.institution?.userId == userId) return 'INSTITUTION';
                                if (assignment?.worker?.userId == userId) return 'WORKER';

                                // 3. Role Property Check
                                const rawRole = userObject?.role?.name || userObject?.role;
                                if (rawRole) {
                                    const lowerRole = String(rawRole).toLowerCase();
                                    if (lowerRole === 'institution') return 'INSTITUTION';
                                    if (lowerRole === 'worker') return 'WORKER';
                                }

                                // 4. Fallback Heuristics
                                if (userObject?.institutionName) return 'INSTITUTION';
                                if (userObject?.firstName || userObject?.lastName) return 'WORKER';

                                return 'UNKNOWN';
                            };

                            let reviewerRole = detectRole(review.reviewerId, reviewer);
                            let revieweeRole = detectRole(review.revieweeId, reviewee);

                            // 3. Inference from Counterpart (Process of Elimination)
                            if (reviewerRole === 'UNKNOWN' && revieweeRole !== 'UNKNOWN') {
                                reviewerRole = revieweeRole === 'WORKER' ? 'INSTITUTION' : 'WORKER';
                            }
                            if (revieweeRole === 'UNKNOWN' && reviewerRole !== 'UNKNOWN') {
                                revieweeRole = reviewerRole === 'WORKER' ? 'INSTITUTION' : 'WORKER';
                            }

                            // Helper to format details based on determined role
                            const formatDetails = (role: string, userObject: any) => {
                                const isInstitution = role === 'INSTITUTION';

                                const name = isInstitution
                                    ? (userObject?.institutionName || userObject?.institution?.institutionName || userObject?.email)
                                    : (`${userObject?.firstName || userObject?.worker?.firstName || ''} ${userObject?.lastName || userObject?.worker?.lastName || ''}`.trim() || userObject?.email);

                                return {
                                    isInstitution,
                                    name: name || userObject?.email,
                                    email: userObject?.email,
                                    profilePicture: userObject?.profilePicture || (isInstitution ? (userObject?.logo || userObject?.institution?.logo) : undefined)
                                };
                            };

                            const reviewerDetails = formatDetails(reviewerRole, reviewer);

                            return (
                                <div key={review.id} className="p-6 hover:bg-muted/10 transition-colors flex flex-col gap-4">
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className={`h-10 w-10 ring-2 ${reviewerDetails.isInstitution ? 'ring-blue-500/10' : 'ring-primary/10'}`}>
                                                <AvatarImage src={reviewerDetails.profilePicture} />
                                                <AvatarFallback className={reviewerDetails.isInstitution ? 'bg-blue-500/5 text-blue-600' : 'bg-primary/5 text-primary'}>
                                                    {reviewerDetails.isInstitution ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        {format(new Date(review.createdAt), "d MMM yyyy", { locale: dateLocale })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-bold text-sm">{reviewerDetails.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{reviewerDetails.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <StarRating value={review.rating} readonly size="h-4 w-4" />
                                    </div>

                                    {/* Quote/Comment */}
                                    <div className="relative pl-3 border-l-2 border-primary/10 mt-1">
                                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                                            {review.comment || (
                                                <span className="text-muted-foreground/40 italic">
                                                    {t("ADMIN_REVIEWS.ADMIN.CARD.NO_COMMENT")}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
