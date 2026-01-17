import { Briefcase, CheckCircle, Clock, Ban } from "lucide-react";

export interface MissionStats {
  activeMissions: number;
  ongoingMissions: number;
  completedMissions: number;
  cancelledMissions: number;
}

interface Props {
  stats: MissionStats | null;
  isLoading: boolean;
}

export function MissionBreakdown({ stats, isLoading }: Props) {
  const items = [
    {
      title: "Active",
      value: stats?.activeMissions ?? 0,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Ongoing",
      value: stats?.ongoingMissions ?? 0,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Completed",
      value: stats?.completedMissions ?? 0,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Cancelled",
      value: stats?.cancelledMissions ?? 0,
      icon: Ban,
      color: "text-red-500",
    },
  ];

  if (!stats && !isLoading) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ title, value, icon: Icon, color }) => (
        <div
          key={title}
          className="group bg-card rounded-xl border shadow-sm p-4 flex flex-col gap-2 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{title}</span>
            <Icon
              className={`h-5 w-5 ${color} stroke-[1.5] transition-transform group-hover:-translate-y-0.5`}
            />
          </div>
          <p className="text-2xl font-semibold tracking-tight">
            {isLoading ? "…" : value}
          </p>
        </div>
      ))}
    </div>
  );
}
