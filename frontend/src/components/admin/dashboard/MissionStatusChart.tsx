import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MissionStatusChartProps {
    stats?: {
        activeMissions: number;
        ongoingMissions: number;
        completedMissions: number;
        cancelledMissions: number;
    };
    isLoading: boolean;
}

export function MissionStatusChart({ stats, isLoading }: MissionStatusChartProps) {
    const { t } = useTranslation();

    const data = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Open', value: stats.activeMissions, color: '#3b82f6' }, // blue-500
            { name: 'Ongoing', value: stats.ongoingMissions, color: '#6366f1' }, // indigo-500
            { name: 'Completed', value: stats.completedMissions, color: '#22c55e' }, // green-500
            { name: 'Cancelled', value: stats.cancelledMissions, color: '#ef4444' }, // red-500
        ];
    }, [stats]);

    const total = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    if (isLoading) {
        return (
            <Card className="h-full border-border/40 shadow-sm bg-card/60 backdrop-blur-xl flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="h-full border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-lg font-bold tracking-tight">
                    {t("ADMIN_DASHBOARD.MISSION_STATUS.TITLE", "Mission Status")}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    {t("ADMIN_DASHBOARD.MISSION_STATUS.SUBTITLE", "Current mission distribution")}
                </p>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold font-spline"
                                                    >
                                                        {total}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Total
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: payload[0].payload.color }}
                                                    />
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {payload[0].name}
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {payload[0].value}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pb-2">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div
                                className={cn("h-3 w-3 rounded-full")}
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{item.name}</span> ({item.value})
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
