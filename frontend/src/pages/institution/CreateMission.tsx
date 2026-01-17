import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MissionDetailsForm } from "@/components/institution/mission-form/MissionDetailsForm";
import { MissionLogisticsForm } from "@/components/institution/mission-form/MissionLogisticsForm";
import { MissionRequirementsForm } from "@/components/institution/mission-form/MissionRequirementsForm";
import { useCreateMission } from "@/features/hooks/InstitutionHooks/useCreateMission";

export default function CreateMission() {
  const { form, onSubmit, isCreating, t, navigate } = useCreateMission();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:bg-transparent hover:text-primary text-muted-foreground"
          onClick={() => navigate("/institution/missions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("COMMON.BACK_TO_MISSIONS")}
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("CREATE_MISSION.HEADER.TITLE")}
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              {t("CREATE_MISSION.HEADER.SUBTITLE")}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* Left Column: Mission Details & Logistics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Details Section */}
          <MissionDetailsForm form={form} />

          {/* Logistics Section */}
          <MissionLogisticsForm form={form} />
        </div>

        {/* Right Column: Requirements & Actions */}
        <div className="lg:col-span-1 space-y-8">
          {/* Requirements Section */}
          <MissionRequirementsForm form={form} />

          {/* Actions Card */}
          <Card className="border shadow-md bg-card sticky top-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
                Publish Mission
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex justify-between">
                  Status:{" "}
                  <span className="text-orange-500 font-medium">Draft</span>
                </p>
                <p className="flex justify-between">
                  Visibility: <span className="font-medium">Public</span>
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                  disabled={isSubmitting || isCreating}
                >
                  {isSubmitting || isCreating ? (
                    t("CREATE_MISSION.ACTIONS.SUBMITTING")
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("CREATE_MISSION.ACTIONS.SUBMIT")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent hover:bg-muted border-dashed"
                  onClick={() => navigate("/institution/missions")}
                >
                  {t("CREATE_MISSION.ACTIONS.CANCEL")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
