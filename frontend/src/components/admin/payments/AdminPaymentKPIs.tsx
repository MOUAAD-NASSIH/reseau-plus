
import { DollarSign, TrendingUp, User, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminPaymentKPIsProps {
    totals: {
        totalRevenue: number;
        totalFees: number;
        totalWorkerPayouts: number;
    };
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

export function AdminPaymentKPIs({ totals, isLoading, formatCurrency }: AdminPaymentKPIsProps) {
    const kpis = [
        {
            title: "Total Revenue",
            value: totals?.totalRevenue || 0,
            icon: TrendingUp,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-500/10",
            subtitle: "Total platform turnover"
        },
        {
            title: "Platform Fees",
            value: totals?.totalFees || 0,
            icon: DollarSign,
            colorClass: "text-blue-600",
            bgClass: "bg-blue-500/10",
            subtitle: "Net earnings"
        },
        {
            title: "Worker Payouts",
            value: totals?.totalWorkerPayouts || 0,
            icon: User,
            colorClass: "text-purple-600",
            bgClass: "bg-purple-500/10",
            subtitle: "Distributed to workers"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {kpis.map((kpi, index) => (
                <Card key={index} className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <kpi.icon className={`w-24 h-24 ${kpi.colorClass} transform rotate-12`} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {kpi.title}
                        </CardTitle>
                        <div className={`h-9 w-9 ${kpi.bgClass} ${kpi.colorClass} rounded-lg flex items-center justify-center`}>
                            <kpi.icon className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(kpi.value)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 font-medium">
                            <span>{kpi.subtitle}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
