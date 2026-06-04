import {
  Save,
  Building2,
  MapPin,
  Mail,
  Loader2,
  Calendar,
  Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CitySelect } from "@/components/common/CitySelect";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useInstitutionProfile } from "@/features/hooks/InstitutionHooks/useInstitutionProfile";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";

export default function InstitutionProfile() {
  const {
    form,
    institution,
    isLoading,
    onSubmit,
    handleLogoUpload,
    handleLogoDelete,
    isUploadingLogo,
    isDeletingLogo,
    t,
    i18n
  } = useInstitutionProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const watchedName = watch("institutionName");

  // Calculate profile completion (simplified logic)
  const calculateCompletion = () => {
    let completed = 0;
    const total = 4; // Name, City, Address, Email (always there)

    if (institution?.institutionName) completed++;
    if (institution?.city) completed++;
    if (institution?.address) completed++;
    if (institution?.user?.email) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateCompletion();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Top Navbar */}
      <div className="z-10 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 sm:p-4 lg:p-8 supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Header Content */}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold font-spline tracking-tight">{t("INSTITUTION_PROFILE.SECTIONS.ORGANIZATION")}</h1>
            <p className="text-sm text-muted-foreground">{t("INSTITUTION_PROFILE.SUBTITLE")}</p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-4 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Sidebar (Profile, Stats) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* 1. Main Profile Card */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
              <div className="p-8 flex flex-col items-center text-center">
                {/* Logo Section */}
                {/* Logo Section */}
                <div className="mb-4">
                  <ProfilePictureUpload
                    currentImage={institution?.logo}
                    name={institution?.institutionName || "Institution"}
                    onUpload={handleLogoUpload}
                    onDelete={handleLogoDelete}
                    isLoading={isUploadingLogo}
                    isDeleting={isDeletingLogo}
                    size="4xl"
                  />
                </div>

                {/* Name & Role */}
                <h2 className="text-xl font-bold font-spline mt-4 text-foreground flex items-center justify-center gap-2">
                  {watchedName || institution?.institutionName || "My Organization"}
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-0.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="Public Profile">
                    <Shield className="size-3 fill-current" />
                  </div>
                </h2>
                <p className="text-muted-foreground font-medium font-spline text-sm mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {watch("city") || institution?.city || "Unknown Location"}
                </p>

                {/* Completion Bar */}
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium font-spline uppercase tracking-wider">
                    <span className="text-muted-foreground">{t("WORKER_PROFILE.CARDS.PROFILE.STRENGTH")}</span>
                    <span className={profileCompletion === 100 ? "text-primary" : "text-foreground"}>
                      {profileCompletion}%
                    </span>
                  </div>
                  <Progress
                    value={profileCompletion}
                    className="h-2.5 bg-muted/50"
                    indicatorClassName="bg-primary"
                  />
                </div>
              </div>
            </Card>

            {/* 2. Account Info Card */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-primary" />
                {t("INSTITUTION_PROFILE.SECTIONS.ACCOUNT")}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="h-8 w-8 bg-background rounded-md flex items-center justify-center shadow-xs">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{t("INSTITUTION_PROFILE.FIELDS.MEMBER_SINCE")}</p>
                    <p className="text-xs font-semibold text-foreground">
                      {institution?.createdAt ? new Date(institution.createdAt).toLocaleDateString(i18n.language, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            <form onSubmit={handleSubmit(onSubmit)} className="contents">
              {/* Organization Information */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-spline text-foreground">{t("INSTITUTION_PROFILE.SECTIONS.ORGANIZATION")}</h3>
                </div>
                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="institutionName" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        {t("INSTITUTION_PROFILE.FIELDS.NAME")}
                      </Label>
                      <Input
                        id="institutionName"
                        {...register("institutionName")}
                        className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 h-11"
                        placeholder="e.g. Global Mission Initiative"
                      />
                      {errors.institutionName && <p className="text-xs text-destructive">{errors.institutionName.message}</p>}
                    </div>

                    {/* Email (Read only) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        {t("INSTITUTION_PROFILE.FIELDS.EMAIL")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={institution?.user?.email || ""}
                          disabled
                          className="pl-9 bg-muted/20 border-transparent text-muted-foreground h-11"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        {t("INSTITUTION_PROFILE.FIELDS.CITY")}
                      </Label>
                      <CitySelect
                        value={watch("city") || ""}
                        onChange={(val) => setValue("city", val, { shouldDirty: true, shouldValidate: true })}
                        placeholder={t("INSTITUTION_PROFILE.FIELDS.CITY")}
                      />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                  </div>
                </Card>
              </section>

              {/* Location Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold font-spline text-foreground">Location Details</h3>
                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        {t("INSTITUTION_PROFILE.FIELDS.ADDRESS")}
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          {...register("address")}
                          className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 h-11"
                          placeholder="Enter street address"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => reset()}
                  disabled={!isDirty || isSubmitting}
                  className="hover:bg-muted/50"
                >
                  {t("INSTITUTION_PROFILE.ACTIONS.CANCEL")}
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? t("INSTITUTION_PROFILE.ACTIONS.SAVING") : t("INSTITUTION_PROFILE.ACTIONS.SAVE")}
                </Button>
              </div>

            </form>

          </div>
        </div>
        <div className="h-4"></div>
      </div>
    </div>
  );
}
