import { useTranslation } from "react-i18next";
import { Star, MessageSquare, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminReviewsStats } from "@/components/admin/reviews/AdminReviewsStats";
import { AdminReviewsList } from "@/components/admin/reviews/AdminReviewsList";
import { useAdminReviews } from "@/features/hooks/AdminHooks/useAdminReviews";

const ReviewsOverview = () => {
  const { t } = useTranslation();
  const {
    filteredReviews,
    stats,
    totalReviews,
    isLoading,
    ratingFilter,
    setRatingFilter,
    searchQuery,
    setSearchQuery,
  } = useAdminReviews();

  return (
    <div className="space-y-8 p-1">
      {/* Header / Stats Section */}
      <AdminReviewsStats
        stats={stats}
        totalReviews={totalReviews}
        isLoading={isLoading}
      />

      {/* Main Content Section */}
      <div className="bg-card/30 backdrop-blur-md rounded-[32px] border border-border/40 p-1 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Toolbar / Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight tracking-[-0.02em]">
                  Global Feed
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                    {filteredReviews.length} Records found
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              {/* Custom Select for Rating Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background/50 border-border/40 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Rating" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 p-1">
                    <SelectItem value="ALL" className="rounded-xl">
                      All Ratings
                    </SelectItem>
                    <SelectItem value="5" className="rounded-xl">
                      5 Stars
                    </SelectItem>
                    <SelectItem value="4" className="rounded-xl">
                      4 Stars
                    </SelectItem>
                    <SelectItem value="3" className="rounded-xl">
                      3 Stars
                    </SelectItem>
                    <SelectItem value="2" className="rounded-xl">
                      2 Stars
                    </SelectItem>
                    <SelectItem value="1" className="rounded-xl">
                      1 Star
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(ratingFilter !== "ALL" || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setRatingFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="h-11 w-11 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Feed */}
          <div className="pt-2">
            <AdminReviewsList reviews={filteredReviews} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsOverview;
