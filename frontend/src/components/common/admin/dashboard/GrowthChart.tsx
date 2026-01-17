import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface MonthlyMetric {
  month: string;
  value: number;
}

interface Props {
  data: MonthlyMetric[] | null;
  isLoading: boolean;
}

export function GrowthChart({ data, isLoading }: Props) {
  const hasData = data && data.length > 0;

  return (
    <Card className="rounded-xl border shadow-sm p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Growth Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          User onboarding across the last 12 months
        </p>
      </div>

      {isLoading ? (
        <div className="h-[250px]">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
          No growth data available
        </div>
      ) : (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeOpacity={0.08} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="currentColor"
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                }}
                labelStyle={{ fontWeight: 600 }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
