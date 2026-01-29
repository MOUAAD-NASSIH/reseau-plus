import React from "react";
import type { MissionStats } from "./MissionBreakdown";

interface Props {
  stats: MissionStats | null;
  isLoading: boolean;
}

export default function MissionCircle({ stats, isLoading }: Props) {
  if (!stats && !isLoading) return null;

  const total =
    (stats?.activeMissions ?? 0) +
    (stats?.ongoingMissions ?? 0) +
    (stats?.completedMissions ?? 0) +
    (stats?.cancelledMissions ?? 0);

  const percent = (v: number) =>
    total > 0 ? Math.round((v / total) * 100) : 0;

  return (
    <div className="bg-card border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Circle */}
      <div className="relative size-40">
        <svg className="w-full h-full -rotate-90">
          {
            [
              { v: stats?.activeMissions ?? 0, color: "stroke-blue-500" },
              { v: stats?.ongoingMissions ?? 0, color: "stroke-yellow-500" },
              { v: stats?.completedMissions ?? 0, color: "stroke-green-500" },
              { v: stats?.cancelledMissions ?? 0, color: "stroke-red-500" },
            ].reduce(
              (acc, { v, color }) => {
                const p = percent(v);
                const strokeDasharray = `${p} ${100 - p}`;

                acc.list.push(
                  <circle
                    key={acc.offset}
                    cx="50%"
                    cy="50%"
                    r="32%"
                    fill="transparent"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={color}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={acc.offset}
                  />
                );

                acc.offset -= p;
                return acc;
              },
              { offset: 0, list: [] as React.JSX.Element[] }
            ).list
          }
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <p className="text-2xl font-semibold">{total}</p>
        </div>
      </div>

      {/* Labels */}
      <div className="flex flex-col gap-2 w-full">
        <Row
          label="Active"
          val={stats?.activeMissions ?? 0}
          color="text-blue-500"
        />
        <Row
          label="Ongoing"
          val={stats?.ongoingMissions ?? 0}
          color="text-yellow-500"
        />
        <Row
          label="Completed"
          val={stats?.completedMissions ?? 0}
          color="text-green-500"
        />
        <Row
          label="Cancelled"
          val={stats?.cancelledMissions ?? 0}
          color="text-red-500"
        />
      </div>
    </div>
  );
}

const Row = ({
  label,
  val,
  color,
}: {
  label: string;
  val: number;
  color: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className={`font-medium ${color}`}>{label}</span>
    <span className="font-semibold">{val}</span>
  </div>
);
