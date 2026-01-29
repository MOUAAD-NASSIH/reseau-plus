import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useMissionDetails } from "@/features/hooks/InstitutionHooks/useMissionDetails";
import { MissionDetailsHeader } from "@/components/institution/mission-details/MissionDetailsHeader";
import { MissionStatusTags } from "@/components/institution/mission-details/MissionStatusTags";
import { MissionKPIs } from "@/components/institution/mission-details/MissionKPIs";
import { MissionInfo } from "@/components/institution/mission-details/MissionInfo";
import { MissionSidebar } from "@/components/institution/mission-details/MissionSidebar";

export default function MissionDetails() {
  const {
    mission,
    applications,
    activeApplicants,
    isLoading,
    handleShare,
    navigate,
    t,
    missionId,
  } = useMissionDetails();

  if (isLoading) {
    return <MissionDetailsSkeleton />;
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-500">
        <div className="bg-destructive/10 p-6 rounded-full mb-6 animate-pulse">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 font-spline text-foreground">
          {t("MISSION_DETAILS.MESSAGES.NOT_FOUND")}
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t("MISSION_DETAILS.MESSAGES.NOT_FOUND_DESC")}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/institution/missions")}
          className="gap-2 h-11 px-6 rounded-xl font-semibold hover:bg-primary/5 hover:border-primary/40 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("MISSION_DETAILS.BACK_TO_MISSIONS")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MissionDetailsHeader
        title={mission.title}
        missionId={missionId}
        onShare={handleShare}
        t={t}
      />

      <MissionStatusTags
        status={mission.status}
        id={mission.id}
        urgency={mission.urgency}
        t={t}
      />

      <MissionKPIs
        budget={mission.budget ?? 0}
        startDate={mission.startDate}
        endDate={mission.endDate}
        activeApplicants={activeApplicants}
        totalApplications={applications.length}
        t={t}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <MissionInfo
            description={mission.description}
            domains={mission.domains}
            requiredSpeciality={mission.requiredSpeciality}
            t={t}
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <MissionSidebar
            mission={mission}
            applicationsCount={applications.length}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

function MissionDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 border-b pb-6 border-border/50">
        <div className="h-10 w-96 bg-muted/60 rounded-xl" />
        <div className="h-5 w-64 bg-muted/40 rounded-lg" />
      </div>

      {/* Status Tags Skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-muted/60 rounded-xl" />
        <div className="h-10 w-32 bg-muted/60 rounded-xl" />
      </div>

      {/* KPIs Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted/60 rounded-3xl" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="h-96 bg-muted/60 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted/60 rounded-3xl" />
          <div className="h-48 bg-muted/60 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
