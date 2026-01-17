
import { DollarSign, TrendingUp, User } from "lucide-react";
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
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* TOTAL REVENUE */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        Total Revenue
                    </CardTitle>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {formatCurrency(totals.totalRevenue)}
                        </p>
                    )}
                    <div className="flex items-center text-xs text-emerald-500 mt-2 font-bold bg-emerald-500/5 w-fit px-2 py-0.5 rounded-full">
                        <span className="opacity-60 font-medium">Total platform turnover</span>
                    </div>
                </CardContent>
            </Card>

            {/* PLATFORM FEES */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        Platform Fees
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {formatCurrency(totals.totalFees)}
                        </p>
                    )}
                     <div className="flex items-center text-xs text-blue-500 mt-2 font-bold bg-blue-500/5 w-fit px-2 py-0.5 rounded-full">
                        <span className="opacity-60 font-medium">Net earnings</span>
                    </div>
                </CardContent>
            </Card>

            {/* WORKER PAYOUTS */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        Worker Payouts
                    </CardTitle>
                    <div className="h-10 w-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-16" />
                    ) : (
                        <p className="text-3xl font-black text-foreground tracking-tight">
                            {formatCurrency(totals.totalWorkerPayouts)}
                        </p>
                    )}
                    <div className="flex items-center text-xs text-purple-500 mt-2 font-bold bg-purple-500/5 w-fit px-2 py-0.5 rounded-full">
                        <span className="opacity-60 font-medium">Distributed to workers</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
