import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AdminDashboardStats } from "@/features/api/endpoints/adminEndpoints";

interface PlatformGrowthChartProps {
    stats?: AdminDashboardStats;
    isLoading: boolean;
}

export function PlatformGrowthChart({ isLoading }: PlatformGrowthChartProps) {
    const { t } = useTranslation();

    // Mock data for growth chart - in production, this would come from backend
    const data = [
        { month: 'JAN', actual: 45000, target: 42000 },
        { month: 'FEB', actual: 52000, target: 48000 },
        { month: 'MAR', actual: 61000, target: 55000 },
        { month: 'APR', actual: 70000, target: 63000 },
        { month: 'MAY', actual: 85000, target: 72000 },
        { month: 'JUN', actual: 95000, target: 82000 },
        { month: 'JUL', actual: 108000, target: 93000 },
        { month: 'AUG', actual: 122000, target: 105000 },
        { month: 'SEP', actual: 138000, target: 118000 },
        { month: 'OCT', actual: 155000, target: 132000 },
        { month: 'NOV', actual: 172000, target: 147000 },
        { month: 'DEC', actual: 190000, target: 163000 },
    ];

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight flex items-center justify-between">
                    <span>{t("ADMIN_DASHBOARD.GROWTH.TITLE")}</span>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-muted-foreground">{t("ADMIN_DASHBOARD.GROWTH.ACTUAL")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                            <span className="text-muted-foreground">{t("ADMIN_DASHBOARD.GROWTH.TARGET")}</span>
                        </div>
                    </div>
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium">
                    {t("ADMIN_DASHBOARD.GROWTH.SUBTITLE")}
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" />
                            <XAxis
                                dataKey="month"
                                className="text-xs text-muted-foreground"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                className="text-xs text-muted-foreground"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="target"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
