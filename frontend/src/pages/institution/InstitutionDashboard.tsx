import { useInstitutionDashboard } from "@/features/hooks/InstitutionHooks/useInstitutionDashboard";
import { DashboardHeader } from "@/components/institution/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/institution/dashboard/DashboardStats";
import { RecentMissionsList } from "@/components/institution/dashboard/RecentMissionsList";
import { RecentActivityList } from "@/components/institution/dashboard/RecentActivityList";

export default function InstitutionDashboard() {
  const {
    institution,
    missions,
    notifications,
    profileLoading,
    missionsLoading,
    statsLoading,
    notificationsLoading,
    activeMissionsCount,
    openMissionsCount,
    assignedMissionsCount,
    totalPaymentAmount,
    assignments,
  } = useInstitutionDashboard();

  return (
    <div className="space-y-8 pb-8">
      <DashboardHeader institution={institution} isLoading={profileLoading} />

      <DashboardStats
        activeMissionsCount={activeMissionsCount}
        openMissionsCount={openMissionsCount}
        assignedMissionsCount={assignedMissionsCount}
        totalPaymentAmount={totalPaymentAmount}
        assignmentsCount={assignments.length}
        isLoading={statsLoading}
      />

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        <RecentMissionsList missions={missions} isLoading={missionsLoading} />
        <RecentActivityList
          notifications={notifications}
          isLoading={notificationsLoading}
        />
      </div>
    </div>
  );
}
