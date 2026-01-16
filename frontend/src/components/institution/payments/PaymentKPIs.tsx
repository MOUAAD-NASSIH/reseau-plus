
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentKPIsProps {
    totals: {
        totalPaid: number;
        totalPending: number;
        activeMissions: number;
    };
    pendingCount: number;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

export function PaymentKPIs({ totals, pendingCount, isLoading, formatCurrency }: PaymentKPIsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* TOTAL PAID */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        {t("FINANCIAL.KPI.TOTAL_PAID")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {formatCurrency(totals.totalPaid)}
                        </p>
                    )}
                    <div className="flex items-center text-xs text-emerald-500 mt-2 font-bold bg-emerald-500/5 w-fit px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12% <span className="ml-1 opacity-60 font-medium">{t("FINANCIAL.KPI.VS_LAST_MONTH")}</span>
                    </div>
                </CardContent>
            </Card>

            {/* PENDING INVOICES */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        {t("FINANCIAL.KPI.AWAITING_PAYMENT")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {formatCurrency(totals.totalPending)}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 font-bold bg-muted/50 w-fit px-2 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {t("FINANCIAL.KPI.INVOICES_COUNT", { count: pendingCount })}
                    </p>
                </CardContent>
            </Card>

            {/* ACTIVE MISSIONS */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        {t("FINANCIAL.KPI.ACTIVE_MISSIONS")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Globe className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-16" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {totals.activeMissions}
                        </p>
                    )}
                    <div className="flex items-center text-xs text-rose-500 mt-2 font-bold bg-rose-500/5 w-fit px-2 py-0.5 rounded-full">
                        <TrendingDown className="h-3 w-3 mr-1" /> -2% <span className="ml-1 opacity-60 font-medium">{t("FINANCIAL.KPI.VS_LAST_MONTH")}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
