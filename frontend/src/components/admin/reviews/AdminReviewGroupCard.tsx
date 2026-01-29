import { format } from "date-fns";
import { User, Calendar, Quote, Briefcase, ArrowRight, Building2 } from "lucide-react";
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
    const { t } = useTranslation();

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
                                {t("REVIEWS.ADMIN_CARD.MISSION_CONTEXT")}
                            </Badge>
                            
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                    {t("REVIEWS.ADMIN_CARD.MISSION_TITLE")}
                                </span>
                                <span className="font-bold text-base leading-tight">
                                    {mission?.title || t("REVIEWS.ADMIN_CARD.UNTITLED_MISSION")}
                                </span>
                            </div>

                             {mission?.location && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        {t("REVIEWS.ADMIN_CARD.LOCATION")}
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
                                        {t("REVIEWS.ADMIN_CARD.PARTICIPANTS")}
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
                                                            <AvatarImage src={missionAssignment?.worker?.profilePicture || missionAssignment?.worker?.user?.profilePicture || undefined} />
                                                            <AvatarFallback className="bg-primary/10 text-primary"><User className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded-sm shadow-sm pointer-events-none">
                                                            W
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="font-bold text-xs" side="bottom">
                                                    {workerName} ({t("REVIEWS.ADMIN_CARD.WORKER")})
                                                </TooltipContent>
                                            </Tooltip>
                                            
                                            <div className="h-4 w-[1px] bg-border/60 mx-1"></div>

                                            {/* Institution */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative group/avatar cursor-pointer">
                                                        <Avatar className="h-9 w-9 ring-2 ring-background transition-transform hover:scale-105 hover:ring-blue-500/20">
                                                            <AvatarImage src={missionAssignment?.institution?.logo || missionAssignment?.institution?.profilePicture || undefined} />
                                                            <AvatarFallback className="bg-blue-500/10 text-blue-500"><Building2 className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-sm shadow-sm pointer-events-none">
                                                            I
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="font-bold text-xs" side="bottom">
                                                    {institutionName} ({t("REVIEWS.ADMIN_CARD.INSTITUTION")})
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>

                                    <div className="text-[10px] font-medium text-muted-foreground text-right leading-tight max-w-[80px]">
                                        {t("REVIEWS.ADMIN_CARD.REVIEWS_EXCHANGED", { count: sortedReviews.length })}
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
                                 // 1. Context Matching (ID based from Assignment)
                                 // Only works if relations are loaded
                                 const assignment = missionAssignment || review.missionAssignment;
                                 if (assignment?.institution?.userId == userId) return 'INSTITUTION';
                                 if (assignment?.worker?.userId == userId) return 'WORKER';

                                 // 2. Direct Property Heuristics
                                 if (userObject?.institutionName) return 'INSTITUTION';
                                 if (userObject?.firstName || userObject?.lastName) return 'WORKER';
                                 
                                 // 3. Role Property Check (Robust & Case-Insensitive)
                                 const rawRole = userObject?.role?.name || userObject?.role;
                                 if (rawRole) {
                                     const lowerRole = String(rawRole).toLowerCase();
                                     if (lowerRole === 'institution') return 'INSTITUTION';
                                     if (lowerRole === 'worker') return 'WORKER';
                                 }

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
                                     ? (userObject?.institutionName || userObject?.email)
                                     : (`${userObject?.firstName || ''} ${userObject?.lastName || ''}`.trim() || userObject?.email);

                                 return {
                                     isInstitution,
                                     name,
                                     profilePicture: userObject?.profilePicture || (isInstitution ? userObject?.logo : undefined)
                                 };
                             };

                             const reviewerDetails = formatDetails(reviewerRole, reviewer);
                             const revieweeDetails = formatDetails(revieweeRole, reviewee);
                             
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
                                                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                         {t("REVIEWS.ADMIN_CARD.REVIEWER")}
                                                     </span>
                                                     <span className="text-[10px] font-medium text-muted-foreground">
                                                         • {format(new Date(review.createdAt), "MMM d, yyyy")}
                                                     </span>
                                                 </div>
                                                 <span className="font-bold text-sm">{reviewerDetails.name}</span>
                                             </div>
                                             
                                             <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 mx-1" />
                                             
                                             <div className="flex flex-col items-end opacity-60 scale-90 origin-left">
                                                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                     {t("REVIEWS.ADMIN_CARD.REVIEWEE")}
                                                 </span>
                                                  <div className="flex items-center gap-1.5">
                                                     <Avatar className={`h-5 w-5 ring-1 ${revieweeDetails.isInstitution ? 'ring-blue-500/10' : 'ring-primary/10'}`}>
                                                         <AvatarImage src={revieweeDetails.profilePicture} />
                                                         <AvatarFallback className={revieweeDetails.isInstitution ? 'bg-blue-500/5 text-blue-600' : 'bg-primary/5 text-primary'}>
                                                             {revieweeDetails.isInstitution ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                         </AvatarFallback>
                                                     </Avatar>
                                                     <span className="font-bold text-xs">
                                                        {revieweeDetails.name}
                                                     </span>
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
                                                     {t("REVIEWS.ADMIN_CARD.NO_COMMENT")}
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
