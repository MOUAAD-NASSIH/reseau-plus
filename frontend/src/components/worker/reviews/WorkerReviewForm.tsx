
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Send, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/common/StarRating";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import { useCreateReviewMutation } from "@/features/api/endpoints/reviewEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { MissionAssignment } from "@/types/assignment.types";

interface WorkerReviewFormProps {
    assignment: MissionAssignment;
    onSuccess: () => void;
    onCancel: () => void;
}

export function WorkerReviewForm({ assignment, onSuccess, onCancel }: WorkerReviewFormProps) {
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
            showSuccessToast(t("WORKER_REVIEWS.TOASTS.SUCCESS_TITLE"), t("WORKER_REVIEWS.TOASTS.SUCCESS_DESC"));
            onSuccess();
        } catch (error) {
            showErrorToast(error, t("WORKER_REVIEWS.TOASTS.ERROR"));
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
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("WORKER_REVIEWS.FORM.REVIEWING")}</p>
                    <p className="font-bold text-foreground">
                        {assignment.mission?.institution?.institutionName || t("WORKER_REVIEWS.FALLBACK_NAMES.INSTITUTION")}
                    </p>
                </div>
            </div>

            <div className="space-y-3 text-center">
                <Label className="text-base">{t("WORKER_REVIEWS.FORM.RATING_LABEL")}</Label>
                <div className="flex justify-center">
                    <StarRating value={rating} onChange={handleRatingChange} size="xl" />
                </div>
                {errors.rating && (
                    <p className="text-sm text-destructive font-medium">{errors.rating.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">{t("WORKER_REVIEWS.FORM.FEEDBACK_LABEL")} <span className="text-muted-foreground font-normal">{t("WORKER_REVIEWS.FORM.OPTIONAL")}</span></Label>
                <Textarea
                    id="comment"
                    {...register("comment")}
                    placeholder={t("WORKER_REVIEWS.FORM.PLACEHOLDER")}
                    className="min-h-[120px] resize-none focus-visible:ring-primary placeholder:opacity-60 text-sm"
                />
                {errors.comment && (
                    <p className="text-sm text-destructive">{errors.comment.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-6">
                    {t("WORKER_REVIEWS.FORM.CANCEL")}
                </Button>
                <Button
                    type="submit"
                    disabled={isCreating || rating === 0}
                    className="rounded-full px-6 shadow-md shadow-primary/20"
                >
                    {isCreating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("WORKER_REVIEWS.FORM.SUBMITTING")}</>
                    ) : (
                        <><Send className="mr-2 h-4 w-4" /> {t("WORKER_REVIEWS.FORM.SUBMIT")}</>
                    )}
                </Button>
            </div>
        </form>
    );
}
