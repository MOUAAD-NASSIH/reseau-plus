import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

interface PaymentDetailsCardProps {
    budget: number;
    isLoading: boolean;
    onInitiatePayment: () => void;
    formatCurrency: (amount: number) => string;
}

export function PaymentDetailsCard({
    budget,
    isLoading,
    onInitiatePayment,
    formatCurrency,
}: PaymentDetailsCardProps) {
    const { t } = useTranslation();

    if (!budget) return (
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-3xl p-8 text-center ring-1 ring-border/50">
            <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-spline mb-2">No Budget Specified</h3>
            <p className="text-muted-foreground">We couldn't find a budget for this mission assignment.</p>
        </Card>
    );

    // Constant platform fee (15%)
    const platformFee = budget * 0.15;
    const workerNet = budget - platformFee;

    return (
        <Card className="border-border/50 shadow-sm bg-card overflow-hidden rounded-xl transition-all">
            <CardHeader className="p-6 border-b bg-muted/5">
                <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <CardTitle className="font-spline text-xl font-bold tracking-tight">
                        {t("PAYMENT.SUMMARY.TITLE")}
                    </CardTitle>
                </div>
                <CardDescription className="text-sm">
                    {t("PAYMENT.SUBTITLE")}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Breakdown Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="text-sm font-medium">{t("PAYMENT.SUMMARY.SUBTOTAL")}</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(budget)}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground group">
                        <div className="flex items-center gap-1.5 cursor-help">
                            <span className="text-sm font-medium">{t("PAYMENT.SUMMARY.PLATFORM_FEE")} (15%)</span>
                            <Info className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-destructive/80">-{formatCurrency(platformFee)}</span>
                    </div>

                    <Separator className="opacity-40" />

                    <div className="flex justify-between items-end pt-2">
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                                {t("PAYMENT.SUMMARY.TOTAL")}
                            </span>
                            <p className="text-[10px] text-muted-foreground font-medium">
                                {t("PAYMENT.SUMMARY.SECURE_DESC")}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-primary font-spline tracking-tight">
                                {formatCurrency(budget)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex gap-4 transition-colors hover:bg-muted/50">
                    <div className="mt-0.5">
                        <ShieldCheck className="h-4 w-4 text-primary/70" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">
                            {t("PAYMENT.SUMMARY.FEES_DEDUCTED")}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            The professional will receive <span className="font-bold text-foreground">{formatCurrency(workerNet)}</span> after processing fees.
                        </p>
                    </div>
                </div>

                {/* Action Section */}
                <div className="pt-2">
                    <Button
                        onClick={onInitiatePayment}
                        disabled={isLoading}
                        size="lg"
                        className="w-full h-10 rounded-lg text-sm font-bold font-spline shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all bg-primary text-primary-foreground group"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                <span>{t("PAYMENT.ACTIONS.PROCESSING")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{t("PAYMENT.ACTIONS.PROCEED")}</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
