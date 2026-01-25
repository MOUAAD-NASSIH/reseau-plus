import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { User, ChevronLeft, ChevronRight, SlidersHorizontal, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMissionApplicants } from "@/features/hooks/InstitutionHooks/useMissionApplicants";
import { ApplicantsHeader } from "@/components/institution/mission-applicants/ApplicantsHeader";
import { ApplicantsStats } from "@/components/institution/mission-applicants/ApplicantsStats";
import { ApplicantsFilter, FilterFields } from "@/components/institution/mission-applicants/ApplicantsFilter";
import { ApplicantCard } from "@/components/institution/mission-applicants/ApplicantCard";
import { ApplicantProfileDialog } from "@/components/institution/mission-applicants/ApplicantProfileDialog";

export default function MissionApplicants() {
  const { t } = useTranslation();
  const {
    mission,
    missionLoading,
    applicationsLoading,
    specialities,
    domains,
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
    domainFilter,
    setDomainFilter,
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
    <div className="space-y-6 pb-4 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <div className="px-4 md:px-6 lg:px-8 pb-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link to="/institution" className="text-muted-foreground hover:text-primary transition-colors">
            {t("MISSION_APPLICANTS.BREADCRUMBS.DASHBOARD")}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link to="/institution/missions" className="text-muted-foreground hover:text-primary transition-colors">
            {t("MISSION_APPLICANTS.BREADCRUMBS.MISSIONS")}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {t("MISSION_APPLICANTS.BREADCRUMBS.APPLICANTS")}#{mission.id}
          </span>
        </div>
      </div>

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
          domainFilter={domainFilter}
          setDomainFilter={setDomainFilter}
          experienceRange={experienceRange}
          setExperienceRange={setExperienceRange}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          specialities={specialities}
          domains={domains}
        />

        {/* Applicants List */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground font-spline">
                {t("MISSION_APPLICANTS.LABELS.APPLICANTS")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({filteredApplications.length}{" "}
                  {statusFilter !== "ALL"
                    ? statusFilter.toLowerCase()
                    : t("MISSION_APPLICANTS.LABELS.TOTAL")}
                  )
                </span>
              </h2>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 sm:w-auto sm:mt-0 font-bold rounded-xl border-border/60 hover:bg-muted shadow-sm h-11">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t("MISSION_APPLICANTS.FILTER.TITLE") || "Filters"}
                    {hasActiveFilters && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l border-border/60 shadow-2xl sm:max-w-none">
                  <div className="h-full flex flex-col bg-card">
                    <SheetHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between bg-muted/10">
                      <SheetTitle className="text-xl font-bold font-spline flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        {t("MISSION_APPLICANTS.FILTER.TITLE")}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                      <FilterFields
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        specialtyFilter={specialtyFilter}
                        setSpecialtyFilter={setSpecialtyFilter}
                        domainFilter={domainFilter}
                        setDomainFilter={setDomainFilter}
                        experienceRange={experienceRange}
                        setExperienceRange={setExperienceRange}
                        hasActiveFilters={hasActiveFilters}
                        resetFilters={resetFilters}
                        specialities={specialities}
                        domains={domains}
                        isMobile={true}
                      />
                    </div>
                    <div className="p-6 border-t border-border/60 bg-muted/10">
                      <Button className="w-full font-bold h-11" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }))}>
                        {t("COMMON.SHOW_RESULTS") || "View Results"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
                    {t("MISSION_APPLICANTS.PAGINATION.SHOWING", {
                      start: (currentPage - 1) * itemsPerPage + 1,
                      end: Math.min(
                        currentPage * itemsPerPage,
                        filteredApplications.length
                      ),
                      total: filteredApplications.length
                    })}
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
