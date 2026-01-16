import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsGlobalStats } from "@/components/institution/reviews/ReviewsGlobalStats";
import { PendingReviews } from "@/components/institution/reviews/PendingReviews";
import { ReviewsList } from "@/components/institution/reviews/ReviewsList";
import { ReviewDialog } from "@/components/institution/reviews/ReviewDialog";
import { useInstitutionReviews } from "@/features/hooks/InstitutionHooks/useInstitutionReviews";

const InstitutionReviews = () => {
  const { t } = useTranslation();
  const {
    receivedReviews,
    writtenReviews,
    pendingReviews,
    stats,
    totalReviews,
    isLoading,
    isCreating,
    isDialogOpen,
    selectedAssignment,
    handleOpenReviewDialog,
    handleCloseReviewDialog,
    createReview,
  } = useInstitutionReviews();

  return (
    <div className="space-y-8 p-1">
      {/* Header / Stats Section */}
      <div className="space-y-6">
        <ReviewsGlobalStats
          stats={stats}
          totalReviews={totalReviews}
          isLoading={isLoading}
        />

        {/* Optional Alert for pending reviews */}
        <PendingReviews
          assignments={pendingReviews}
          isLoading={isLoading}
          onReview={handleOpenReviewDialog}
        />
      </div>

      {/* Main Tabs Section */}
      <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-border/40 p-1">
        <Tabs defaultValue="received" className="w-full">
          <div className="px-5 pt-5 pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="received"
                className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-6"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                  {t("REVIEWS.TABS.RECEIVED")}
                </span>
                <span className="sm:hidden">{t("REVIEWS.TABS.RECEIVED")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="written"
                className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-6"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                  {t("REVIEWS.TABS.WRITTEN")}
                </span>
                <span className="sm:hidden">{t("REVIEWS.TABS.WRITTEN")}</span>
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              {totalReviews} {t("REVIEWS.SUMMARY.TOTAL_REVIEWS")}
            </div>
          </div>

          <div className="p-6">
            <TabsContent
              value="received"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <ReviewsList
                reviews={receivedReviews}
                isLoading={isLoading}
                type="received"
              />
            </TabsContent>

            <TabsContent
              value="written"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <ReviewsList
                reviews={writtenReviews}
                isLoading={isLoading}
                type="written"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={isDialogOpen}
        onClose={handleCloseReviewDialog}
        assignment={selectedAssignment}
        onSubmit={createReview}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default InstitutionReviews;
