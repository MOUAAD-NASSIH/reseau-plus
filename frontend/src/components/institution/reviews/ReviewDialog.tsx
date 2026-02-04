import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/StarRating";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { MissionAssignment } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: MissionAssignment | null;
    onSubmit: (data: CreateReviewInput) => Promise<any>;
    isSubmitting: boolean;
}

export function ReviewDialog({
    isOpen,
    onClose,
    assignment,
    onSubmit,
    isSubmitting,
}: ReviewDialogProps) {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
            missionAssignmentId: assignment?.id || 0,
        },
    });

    const rating = watch("rating");

    useEffect(() => {
        if (assignment) {
            reset({
                rating: 0,
                comment: "",
                missionAssignmentId: assignment.id,
            });
        }
    }, [assignment, reset]);

    const handleFormSubmit = async (data: CreateReviewInput) => {
        if (!assignment) return;
        try {
            await (onSubmit({ ...data, missionAssignmentId: assignment.id }) as any).unwrap();

            showSuccessToast(t("REVIEWS.TOASTS.SUCCESS_TITLE") || "Review Submitted", t("REVIEWS.TOASTS.SUCCESS_DESC") || "Thank you for your feedback!");
            reset();
            onClose();
        } catch (error) {
            showErrorToast(error, t("REVIEWS.TOASTS.ERROR") || "Failed to submit review");
        }
    };

    const workerName = `${assignment?.worker?.firstName || ""} ${assignment?.worker?.lastName || ""}`.trim();
    const workerSpeciality = assignment?.worker?.speciality?.name?.toUpperCase();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/60">
                <div className="p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold font-spline tracking-tight text-center">
                            {t("REVIEWS.FORM.TITLE") || "Rate Your Experience"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        {/* Worker Info Card */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                <AvatarImage src={assignment?.worker?.profilePicture || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <User className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                    {t("REVIEWS.FORM.REVIEWING_WORKER") || "Reviewing Social Worker"}
                                </p>
                                <p className="font-bold text-base truncate text-foreground">
                                    {workerName || "Social Worker"}
                                </p>
                                <p className="text-sm font-medium text-primary/80 truncate">
                                    {workerSpeciality || t("COMMON.SOCIAL_WORKER")}
                                </p>
                            </div>
                        </div>

                        {/* Rating Section */}
                        <div className="space-y-3 text-center py-2">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                {t("REVIEWS.FORM.RATING_LABEL") || "How would you rate them?"}
                            </Label>
                            <div className="flex justify-center scale-110 py-2">
                                <StarRating
                                    value={rating}
                                    onChange={(val) => setValue("rating", val, { shouldValidate: true })}
                                    size="xl"
                                />
                            </div>
                            {errors.rating && (
                                <p className="text-xs font-bold text-destructive animate-pulse">{errors.rating.message}</p>
                            )}
                        </div>

                        {/* Comment Section */}
                        <div className="space-y-2">
                            <Label htmlFor="comment" className="flex justify-between text-sm">
                                <span className="font-semibold">{t("REVIEWS.FORM.FEEDBACK_LABEL") || "Additional Feedback"}</span>
                                <span className="text-muted-foreground font-normal text-xs">{t("REVIEWS.FORM.OPTIONAL") || "(Optional)"}</span>
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder={t("REVIEWS.FORM.PLACEHOLDER") || "Share your experience with this worker..."}
                                className="min-h-[120px] resize-none bg-muted/20 border-border/50 focus-visible:ring-primary/30 rounded-xl"
                                {...register("comment")}
                            />
                            {errors.comment && (
                                <p className="text-xs text-destructive">{errors.comment.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 pb-2 border-t border-border/40">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-full px-6 hover:bg-muted/50">
                                {t("COMMON.CANCEL") || "Cancel"}
                            </Button>
                            <Button type="submit" disabled={isSubmitting || rating === 0} className="px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("COMMON.SUBMITTING") || "Submitting..."}</>
                                ) : (
                                    <><Send className="mr-2 h-4 w-4" /> {t("COMMON.SUBMIT") || "Submit Review"}</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
