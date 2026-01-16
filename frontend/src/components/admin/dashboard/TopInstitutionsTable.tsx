import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { AdminDashboardStats } from "@/features/api/endpoints/adminEndpoints";

interface TopInstitutionsTableProps {
    stats?: AdminDashboardStats;
    isLoading: boolean;
}

export function TopInstitutionsTable({ stats, isLoading }: TopInstitutionsTableProps) {
    const { t } = useTranslation();

    // Mock data for top institutions - in production, this would come from backend
    const institutions = [
        {
            id: 1,
            name: "General Health Corp",
            type: "HEALTH PROVIDER",
            growth: "+15.2%",
            revenue: "842,000",
            fulfillment: "98.2%",
            trend: [20, 35, 30, 45, 40, 55, 50, 65],
        },
        {
            id: 2,
            name: "Saint Catherine's",
            type: "HOSPITAL",
            growth: "+12.8%",
            revenue: "621,900",
            fulfillment: "96.5%",
            trend: [15, 25, 20, 35, 30, 45, 40, 55],
        },
        {
            id: 3,
            name: "North Memorial",
            type: "CARE CENTER",
            growth: "+9.3%",
            revenue: "410,200",
            fulfillment: "88.1%",
            trend: [10, 20, 15, 25, 20, 30, 25, 35],
        },
    ];

    const MiniSparkline = ({ data }: { data: number[] }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * 60;
            const y = 20 - ((value - min) / range) * 15;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width="60" height="20" className="inline-block">
                <polyline
                    points={points}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight">
                        {t("ADMIN_DASHBOARD.INSTITUTIONS.TITLE")}
                    </CardTitle>
                </div>
                <Button variant="link" size="sm" className="text-primary" asChild>
                    <Link to="/admin/institutions">
                        {t("ADMIN_DASHBOARD.INSTITUTIONS.VIEW_ALL")}
                        <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                            <div className="col-span-3">{t("ADMIN_DASHBOARD.INSTITUTIONS.INSTITUTION")}</div>
                            <div className="col-span-2 text-center">{t("ADMIN_DASHBOARD.INSTITUTIONS.GROWTH")}</div>
                            <div className="col-span-3 text-center">{t("ADMIN_DASHBOARD.INSTITUTIONS.REVENUE")}</div>
                            <div className="col-span-2 text-center">{t("ADMIN_DASHBOARD.INSTITUTIONS.FULFILLMENT")}</div>
                            <div className="col-span-2"></div>
                        </div>

                        {/* Table Rows */}
                        {institutions.map((institution, index) => (
                            <div
                                key={institution.id}
                                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-accent/50 rounded-lg transition-colors group"
                            >
                                <div className="col-span-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{institution.name}</p>
                                            <p className="text-xs text-muted-foreground">{institution.type}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <MiniSparkline data={institution.trend} />
                                </div>
                                <div className="col-span-3 text-center">
                                    <p className="font-bold text-foreground">{institution.revenue} MAD</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                        parseFloat(institution.fulfillment) >= 95
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-amber-500/10 text-amber-600"
                                    }`}>
                                        {institution.fulfillment}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {institution.growth}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
