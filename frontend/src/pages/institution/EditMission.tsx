import { ArrowLeft, Save, Shield, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MissionDetailsForm } from "@/components/institution/mission-form/MissionDetailsForm";
import { MissionLogisticsForm } from "@/components/institution/mission-form/MissionLogisticsForm";
import { MissionRequirementsForm } from "@/components/institution/mission-form/MissionRequirementsForm";
import { useEditMission } from "@/features/hooks/InstitutionHooks/useEditMission";

export default function EditMission() {
  const {
    form,
    onSubmit,
    onFormError,
    isUpdating,
    missionLoading,
    mission,
    t,
    navigate,
  } = useEditMission();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  if (missionLoading) {
    return <EditMissionSkeleton />;
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-muted/30 p-6 rounded-full mb-6">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 font-spline">
          {t("EDIT_MISSION.MESSAGES.NOT_FOUND")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("EDIT_MISSION.MESSAGES.NOT_FOUND_DESC")}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/institution/missions")}
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("COMMON.BACK_TO_MISSIONS")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:bg-transparent hover:text-primary text-muted-foreground group"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {t("EDIT_MISSION.ACTIONS.CANCEL")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-spline">
            {t("EDIT_MISSION.HEADER.TITLE")}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {t("EDIT_MISSION.HEADER.SUBTITLE")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onFormError)}
        className="grid gap-8 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Details (with Status) */}
          <MissionDetailsForm form={form} showStatus={true} />

          {/* Section 2: Logistics */}
          <MissionLogisticsForm form={form} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Section 3: Requirements */}
          <MissionRequirementsForm form={form} />

          {/* Actions Card */}
          <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden shadow-primary/10">
            <div className="h-1 bg-primary w-full" />
            <CardContent className="p-8 space-y-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/10 transition-all active:scale-95"
                disabled={isSubmitting || isUpdating}
              >
                {isSubmitting || isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("EDIT_MISSION.ACTIONS.SAVING")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    {t("EDIT_MISSION.ACTIONS.SAVE")}
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 text-md font-semibold rounded-2xl border-border/60 hover:bg-muted/50 transition-colors"
                onClick={() => navigate(-1)}
              >
                <X className="mr-2 h-4 w-4" />
                {t("EDIT_MISSION.ACTIONS.CANCEL")}
              </Button>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center mt-2">
                <p className="text-[11px] text-primary/70 leading-relaxed font-bold">
                  <Shield className="h-3.5 w-3.5 inline mr-1.5 align-text-top" />
                  {t("EDIT_MISSION.MESSAGES.SYNC_NOTICE")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

function EditMissionSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse pt-8">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
