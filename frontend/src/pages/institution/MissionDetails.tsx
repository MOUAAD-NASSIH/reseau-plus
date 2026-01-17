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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {t("MISSION_DETAILS.MESSAGES.NOT_FOUND")}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/institution/missions")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("MISSION_DETAILS.BACK_TO_MISSIONS")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
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

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <MissionInfo
            description={mission.description}
            domains={mission.domains}
            t={t}
          />
        </div>

        <MissionSidebar
          mission={mission}
          applicationsCount={applications.length}
          t={t}
        />
      </div>
    </div>
  );
}

function MissionDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="h-12 w-full bg-muted rounded-xl" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="h-96 bg-muted rounded-2xl" />
        <div className="space-y-8">
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
