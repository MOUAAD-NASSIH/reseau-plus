import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
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
            { name: t("ADMIN_DASHBOARD.CHART.OPEN") || 'Open', value: stats.activeMissions, color: '#3b82f6' },
            { name: t("ADMIN_DASHBOARD.CHART.ONGOING") || 'Ongoing', value: stats.ongoingMissions, color: '#f59e0b' },
            { name: t("ADMIN_DASHBOARD.CHART.COMPLETED") || 'Completed', value: stats.completedMissions, color: '#10b981' },
            { name: t("ADMIN_DASHBOARD.CHART.CANCELLED") || 'Cancelled', value: stats.cancelledMissions, color: '#ef4444' },
        ];
    }, [stats, t]);

    const total = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    if (isLoading) {
        return (
            <Card className="col-span-1 border-none shadow-md bg-card/50 flex flex-col h-[400px]">
                <CardHeader>
                    <CardTitle><Loader2 className="h-5 w-5 animate-spin" /></CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 border-none shadow-md bg-card flex flex-col h-full min-h-[420px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider">
                    {t("ADMIN_DASHBOARD.CHART.TITLE") || "Mission Status Distribution"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between p-6">
                <div className="relative flex-1 min-h-[250px]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <div className="text-center">
                            <span className="text-4xl font-bold font-spline text-foreground">{total}</span>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Missions</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={85}
                                outerRadius={115}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="stroke-card stroke-2" />
                                ))}
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: payload[0].payload.color }}
                                                        />
                                                        <span className="text-xs font-medium text-muted-foreground uppercase">
                                                            {payload[0].name}
                                                        </span>
                                                        <span className="font-bold text-foreground">
                                                            {payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div
                                className={cn("h-3 w-3 rounded-full shadow-sm ring-1 ring-inset ring-white/20")}
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground leading-none mb-1">
                                    {item.name}
                                </span>
                                <span className="text-sm font-bold text-foreground leading-none">
                                    {item.value} <span className="text-[10px] font-normal text-muted-foreground">({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
