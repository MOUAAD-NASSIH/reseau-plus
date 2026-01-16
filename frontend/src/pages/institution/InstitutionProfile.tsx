import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useInstitutionProfile } from "@/features/hooks/InstitutionHooks/useInstitutionProfile";
import { ProfileHeader } from "@/components/institution/profile/ProfileHeader";
import { OrganizationForm } from "@/components/institution/profile/OrganizationForm";

export default function InstitutionProfile() {
  const { form, institution, isLoading, onSubmit, t } = useInstitutionProfile();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-10 w-64" />
        <Card className="border-border/40 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-spline animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileHeader t={t} />

      <OrganizationForm
        form={form}
        institution={institution}
        onSubmit={onSubmit}
        t={t}
      />
    </div>
  );
}
