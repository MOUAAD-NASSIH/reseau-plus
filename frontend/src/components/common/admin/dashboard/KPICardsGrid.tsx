import { KPICard } from "@/components/common/KPICard";
import { Users, Building2, Briefcase, AlertCircle } from "lucide-react";

export interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  activeMissions: number;
  totalInstitutions: number;
}

interface Props {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function KPICardsGrid({ stats, isLoading }: Props) {
  if (!stats && !isLoading) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Users"
        value={stats?.totalUsers ?? 0}
        icon={Users}
        description="All registered users"
        isLoading={isLoading}
      />
      <KPICard
        title="Pending Verifications"
        value={stats?.pendingVerifications ?? 0}
        icon={AlertCircle}
        description="Awaiting approval"
        variant="warning"
        isLoading={isLoading}
      />
      <KPICard
        title="Active Missions"
        value={stats?.activeMissions ?? 0}
        icon={Briefcase}
        description="Currently ongoing"
        variant="info"
        isLoading={isLoading}
      />
      <KPICard
        title="Institutions"
        value={stats?.totalInstitutions ?? 0}
        icon={Building2}
        description="Registered orgs"
        isLoading={isLoading}
      />
    </div>
  );
}
