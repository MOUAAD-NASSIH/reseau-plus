import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Star, Loader2, Send, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateReviewMutation } from "@/features/api/endpoints/reviewEndpoints";
import { cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { MissionAssignment } from "@/types/assignment.types";
import type { Review } from "@/types/review.types";

// --- Star Rating Component ---

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
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

// --- Institution Review Form ---

interface InstitutionReviewFormProps {
    assignment: MissionAssignment;
    onSuccess: () => void;
}

export function InstitutionReviewForm({ assignment, onSuccess }: InstitutionReviewFormProps) {
    const { t } = useTranslation();
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
            showSuccessToast(
                t("ASSIGNED_MISSION_VIEW.REVIEW.SUCCESS_TITLE") || "Review Submitted",
                t("ASSIGNED_MISSION_VIEW.REVIEW.SUCCESS_DESC") || "Your review has been submitted successfully."
            );
            onSuccess();
        } catch (error) {
            showErrorToast(error, t("ASSIGNED_MISSION_VIEW.REVIEW.ERROR_TITLE") || "Failed to submit review");
        }
    };

    const handleRatingChange = (value: number) => {
        setRating(value);
        setValue("rating", value, { shouldValidate: true });
    };

    const workerName = `${assignment.worker?.firstName} ${assignment.worker?.lastName}`;

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-md overflow-hidden">
            <CardHeader className="bg-primary/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Star className="h-5 w-5 fill-primary" />
                    {t("ASSIGNED_MISSION_VIEW.REVIEW.FORM_TITLE") || "Rate Worker Performance"}
                </CardTitle>
                <CardDescription>
                    {t("ASSIGNED_MISSION_VIEW.REVIEW.FORM_DESC", { name: workerName }) || `Share your experience working with ${workerName}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-3 text-center">
                        <Label className="text-base font-medium">
                            {t("ASSIGNED_MISSION_VIEW.REVIEW.CLICK_TO_RATE") || "Click to rate"}
                        </Label>
                        <div className="flex justify-center">
                            <StarRating value={rating} onChange={handleRatingChange} size="xl" />
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-destructive font-medium">{errors.rating.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">
                            {t("ASSIGNED_MISSION_VIEW.REVIEW.FEEDBACK_LABEL") || "Your Feedback"}{" "}
                            <span className="text-muted-foreground font-normal">
                                {t("ASSIGNED_MISSION_VIEW.REVIEW.OPTIONAL") || "(Optional)"}
                            </span>
                        </Label>
                        <Textarea
                            id="comment"
                            {...register("comment")}
                            placeholder={t("ASSIGNED_MISSION_VIEW.REVIEW.PLACEHOLDER") || "Share your thoughts about the worker's performance..."}
                            className="min-h-[100px] resize-none focus-visible:ring-primary bg-background"
                        />
                        {errors.comment && (
                            <p className="text-sm text-destructive">{errors.comment.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isCreating || rating === 0}
                            className="rounded-full px-8 shadow-lg shadow-primary/20 w-full sm:w-auto"
                        >
                            {isCreating ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("ASSIGNED_MISSION_VIEW.REVIEW.SUBMITTING") || "Submitting..."}</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> {t("ASSIGNED_MISSION_VIEW.REVIEW.SUBMIT_BTN") || "Submit Review"}</>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// --- Worker Review Display ---

interface WorkerReviewDisplayProps {
    review: Review;
}

export function WorkerReviewDisplay({ review }: WorkerReviewDisplayProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
            <CardContent className="p-6 flex items-start gap-4">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <User className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold font-spline text-lg text-blue-900 dark:text-blue-100">
                        {t("ASSIGNED_MISSION_VIEW.REVIEW.WORKER_FEEDBACK_TITLE") || "Worker's Feedback"}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                        <StarRating value={review.rating} readonly size="sm" />
                        <span className="text-sm font-bold ml-2 text-blue-700 dark:text-blue-300">
                            {review.rating}/5
                        </span>
                    </div>
                    {review.comment && (
                        <p className="text-blue-800/80 dark:text-blue-300/80 italic">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Institution Review Display ---

interface InstitutionReviewDisplayProps {
    review: Review;
}

export function InstitutionReviewDisplay({ review }: InstitutionReviewDisplayProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10">
            <CardContent className="p-6 flex items-start gap-4">
                <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                    <Building2 className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold font-spline text-lg text-purple-900 dark:text-purple-100">
                        {t("ASSIGNED_MISSION_VIEW.REVIEW.YOUR_REVIEW_TITLE") || "Your Review"}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                        <StarRating value={review.rating} readonly size="sm" />
                        <span className="text-sm font-bold ml-2 text-purple-700 dark:text-purple-300">
                            {review.rating}/5
                        </span>
                    </div>
                    {review.comment && (
                        <p className="text-purple-800/80 dark:text-purple-300/80 italic">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
