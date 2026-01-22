import { useInstitutionDashboard } from "@/features/hooks/InstitutionHooks/useInstitutionDashboard";
import { DashboardHeader } from "@/components/institution/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/institution/dashboard/DashboardStats";
import { RecentMissionsList } from "@/components/institution/dashboard/RecentMissionsList";
import { RecentActivityList } from "@/components/institution/dashboard/RecentActivityList";
import { QuickActions } from "@/components/institution/dashboard/QuickActions";

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
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <DashboardHeader institution={institution} isLoading={profileLoading} />

      {/* Stats Grid */}
      <DashboardStats
        activeMissionsCount={activeMissionsCount}
        openMissionsCount={openMissionsCount}
        assignedMissionsCount={assignedMissionsCount}
        totalPaymentAmount={totalPaymentAmount}
        assignmentsCount={assignments.length}
        isLoading={statsLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Missions */}
        <div className="lg:col-span-8 space-y-8">
          <RecentMissionsList missions={missions} isLoading={missionsLoading} />
        </div>

        {/* Right Column - Quick Actions & Activity */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions Card */}
          <QuickActions />

          <RecentActivityList
            notifications={notifications}
            isLoading={notificationsLoading}
          />
        </div>
      </div>
    </div>
  );
}
