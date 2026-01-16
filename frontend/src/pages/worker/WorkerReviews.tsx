import { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Star, Send, Loader2, MessageSquare, User, Trophy, Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useCreateReviewMutation,
} from "@/features/api/endpoints/reviewEndpoints";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { Review } from "@/types/review.types";
import type { MissionAssignment } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const sizeClasses = {
        sm: "h-3.5 w-3.5",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8"
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverValue(star)}
                    onMouseLeave={() => !readonly && setHoverValue(0)}
                    className={cn(
                        "transition-all duration-200 focus:outline-hidden",
                        readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            "transition-colors",
                            (hoverValue || value) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

interface ReviewCardProps {
    review: Review;
    type: "received" | "written";
}

function ReviewCard({ review, type }: ReviewCardProps) {
    const otherUser = type === "received" ? review.reviewer : review.reviewee;
    const isWorker = !!otherUser?.worker;

    // Fallback name/avatar logic
    const name = isWorker
        ? `${otherUser?.worker?.firstName} ${otherUser?.worker?.lastName}`
        : otherUser?.institution?.institutionName || (type === "received" ? "Anonymous" : "User");

    const avatar = isWorker
        ? otherUser?.worker?.profilePicture
        : otherUser?.institution?.logo;

    return (
        <Card className="group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0">
                        <Avatar className="h-12 w-12 border border-border">
                            <AvatarImage src={avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                {isWorker ? <User className="h-5 w-5" /> : <Quote className="h-5 w-5" />}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h4 className="font-bold text-foreground">{name}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{format(new Date(review.createdAt), "MMMM d, yyyy")}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/50 w-fit">
                                <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">{review.rating.toFixed(1)}</span>
                                <StarRating value={review.rating} readonly size="sm" />
                            </div>
                        </div>
                        {review.comment && (
                            <div className="relative pl-4 border-l-2 border-primary/20">
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface ReviewFormProps {
    assignment: MissionAssignment;
    onSuccess: () => void;
    onCancel: () => void;
}

function ReviewForm({ assignment, onSuccess, onCancel }: ReviewFormProps) {
    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
    const [rating, setRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            missionAssignmentId: assignment.id,
            rating: 0,
            comment: "",
        },
    });

    const onSubmit = async (data: CreateReviewInput) => {
        try {
            await createReview(data).unwrap();
            showSuccessToast("Review submitted", "Thank you for your feedback!");
            onSuccess();
        } catch (error) {
            showErrorToast(error, "Failed to submit review");
        }
    };

    const handleRatingChange = (value: number) => {
        setRating(value);
        setValue("rating", value, { shouldValidate: true });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Reviewing</p>
                    <p className="font-bold text-foreground">
                        {assignment.institution?.institutionName || "Institution"}
                    </p>
                </div>
            </div>

            <div className="space-y-3 text-center">
                <Label className="text-base">How would you rate your experience?</Label>
                <div className="flex justify-center">
                    <StarRating value={rating} onChange={handleRatingChange} size="xl" />
                </div>
                {errors.rating && (
                    <p className="text-sm text-destructive font-medium">{errors.rating.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Additional Feedback <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Textarea
                    id="comment"
                    {...register("comment")}
                    placeholder="Share details about your collaboration, communication, and overall satisfaction..."
                    className="min-h-[120px] resize-none focus-visible:ring-primary"
                />
                {errors.comment && (
                    <p className="text-sm text-destructive">{errors.comment.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-6">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isCreating || rating === 0}
                    className="rounded-full px-6 shadow-md shadow-primary/20"
                >
                    {isCreating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                        <><Send className="mr-2 h-4 w-4" /> Submit Review</>
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function WorkerReviews() {
    const [searchParams] = useSearchParams();
    const preselectedAssignmentId = searchParams.get("assignmentId");

    const { data: receivedData, isLoading: receivedLoading } = useGetMyReceivedReviewsQuery();
    const { data: writtenData, isLoading: writtenLoading } = useGetMyWrittenReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetMyAssignmentsQuery();

    const isLoading = receivedLoading || writtenLoading;

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);

    const hasProcessedPreselection = useRef(false);

    const receivedReviews = receivedData?.data || [];
    const writtenReviews = writtenData?.data || [];
    const assignments = assignmentsData?.data || [];

    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");
    const reviewedAssignmentIds = new Set(writtenReviews.map((r) => r.missionAssignmentId));
    const unreviewedAssignments = completedAssignments.filter(
        (a) => !reviewedAssignmentIds.has(a.id)
    );

    const averageRating = receivedReviews.length > 0
        ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
        : "N/A";

    const handleOpenReviewForm = (assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setShowReviewForm(true);
    };

    const handleCloseReviewForm = () => {
        setSelectedAssignment(null);
        setShowReviewForm(false);
    };

    useLayoutEffect(() => {
        if (
            preselectedAssignmentId &&
            unreviewedAssignments.length > 0 &&
            !hasProcessedPreselection.current &&
            !assignmentsLoading &&
            !isLoading
        ) {
            const assignment = unreviewedAssignments.find(
                (a) => a.id === parseInt(preselectedAssignmentId)
            );
            if (assignment) {
                hasProcessedPreselection.current = true;
                setSelectedAssignment(assignment);
                setShowReviewForm(true);
            }
        }
    }, [preselectedAssignmentId, assignmentsLoading, isLoading, unreviewedAssignments.length]);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-2 p-4">
                <h1 className="text-3xl font-black font-spline tracking-tight flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary" />
                    My Reviews
                </h1>
                <p className="text-muted-foreground">
                    Build your reputation and provide feedback to institutions
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-100 dark:border-yellow-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Star className="h-24 w-24 text-yellow-600" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Average Rating</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-foreground">{averageRating}</span>
                            {averageRating !== "N/A" && <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center"><Star className="h-3 w-3 fill-current mr-1" /> / 5.0</span>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden relative border-border/60">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Quote className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Reviews Received</p>
                        <span className="text-4xl font-bold text-foreground">{receivedReviews.length}</span>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden relative border-border/60">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Send className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Reviews Written</p>
                        <span className="text-4xl font-bold text-foreground">{writtenReviews.length}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Reviews Section */}
            {unreviewedAssignments.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-border/50 rounded-full" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Pending Actions</span>
                        <div className="h-1 flex-1 bg-border/50 rounded-full" />
                    </div>

                    <Card className="border-primary/20 bg-primary/5 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Star className="h-5 w-5 text-primary fill-primary" />
                                Rate Your Recent Missions
                            </CardTitle>
                            <CardDescription>
                                You have completed missions that haven't been reviewed yet.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="max-h-[300px] pr-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {unreviewedAssignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-background border border-border shadow-sm hover:border-primary/30 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-bold truncate text-foreground pr-2">
                                                    {assignment.mission?.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {assignment.institution?.institutionName}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenReviewForm(assignment)}
                                                className="shrink-0 rounded-full"
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue="received" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-full h-12">
                    <TabsTrigger value="received" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-full">
                        Received Reviews
                    </TabsTrigger>
                    <TabsTrigger value="written" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-full">
                        Written Reviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="space-y-6 mt-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
                            ))}
                        </div>
                    ) : receivedReviews.length === 0 ? (
                        <EmptyState
                            icon={Star}
                            title="No reviews received yet"
                            description="Complete missions with excellence to earn 5-star reviews from institutions!"
                            actionLabel="Browse Missions"
                            onAction={() => window.location.href = '/worker/missions'}
                        />
                    ) : (
                        <div className="grid gap-4">
                            {receivedReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} type="received" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="written" className="space-y-6 mt-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
                            ))}
                        </div>
                    ) : writtenReviews.length === 0 ? (
                        <EmptyState
                            icon={Send}
                            title="No reviews written"
                            description="Your feedback helps improve the community. Review institutions after completing missions."
                        />
                    ) : (
                        <div className="grid gap-4">
                            {writtenReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} type="written" />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Review Dialog */}
            <Dialog open={showReviewForm} onOpenChange={handleCloseReviewForm}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Write a Review</DialogTitle>
                        <DialogDescription>
                            Your honest feedback helps other workers and institutions.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAssignment && (
                        <ReviewForm
                            assignment={selectedAssignment}
                            onSuccess={handleCloseReviewForm}
                            onCancel={handleCloseReviewForm}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
