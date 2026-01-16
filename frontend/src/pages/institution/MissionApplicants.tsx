import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMissionApplicants } from "@/features/hooks/InstitutionHooks/useMissionApplicants";
import { ApplicantsHeader } from "@/components/institution/mission-applicants/ApplicantsHeader";
import { ApplicantsStats } from "@/components/institution/mission-applicants/ApplicantsStats";
import { ApplicantsFilter } from "@/components/institution/mission-applicants/ApplicantsFilter";
import { ApplicantCard } from "@/components/institution/mission-applicants/ApplicantCard";
import { ApplicantProfileDialog } from "@/components/institution/mission-applicants/ApplicantProfileDialog";

export default function MissionApplicants() {
  const { t } = useTranslation();
  const {
    mission,
    missionLoading,
    applicationsLoading,
    specialities,
    filteredApplications,
    paginatedApplications,
    stats,
    totalPages,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    experienceRange,
    setExperienceRange,
    selectedApplicant,
    setSelectedApplicant,
    processingId,
    isAccepting,
    isRejecting,
    handleAccept,
    handleReject,
    onViewProfile,
    hasActiveFilters,
    resetFilters,
  } = useMissionApplicants();

  if (missionLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!mission) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("MISSION_APPLICANTS.MESSAGES.NOT_FOUND")}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/institution/missions">
              {t("MISSION_APPLICANTS.BACK_TO_MISSIONS")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <ApplicantsHeader mission={mission} />

      {/* Stats Cards */}
      <ApplicantsStats stats={stats} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Filters Sidebar */}
        <ApplicantsFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          specialtyFilter={specialtyFilter}
          setSpecialtyFilter={setSpecialtyFilter}
          experienceRange={experienceRange}
          setExperienceRange={setExperienceRange}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          specialities={specialities}
        />

        {/* Applicants List */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Applicants{" "}
                <span className="text-muted-foreground font-normal">
                  ({filteredApplications.length}{" "}
                  {statusFilter !== "ALL"
                    ? statusFilter.toLowerCase()
                    : "total"}
                  )
                </span>
              </h2>
            </div>
          </div>

          {/* Applicant Cards */}
          {applicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : paginatedApplications.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-16 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("MISSION_APPLICANTS.EMPTY.TITLE")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? t("MISSION_APPLICANTS.EMPTY.DESCRIPTION_FILTERED")
                    : t("MISSION_APPLICANTS.EMPTY.DESCRIPTION")}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    {t("MISSION_APPLICANTS.ACTIONS.CLEAR_FILTER")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedApplications.map((application) => (
                  <ApplicantCard
                    key={application.id}
                    application={application}
                    isProcessing={processingId === application.id}
                    onViewProfile={onViewProfile}
                    onReject={handleReject}
                    onAccept={handleAccept}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredApplications.length
                    )}{" "}
                    of {filteredApplications.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Applicant Profile Dialog */}
      <ApplicantProfileDialog
        application={selectedApplicant}
        open={!!selectedApplicant}
        onOpenChange={(open) => !open && setSelectedApplicant(null)}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
}
