import { DollarSign, ShieldCheck, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import type { MissionAssignment } from "@/types/assignment.types";
import type { Payment } from "@/types/payment.types";

interface PaymentInfoCardProps {
    assignment: MissionAssignment;
    payment?: Payment;
    isLoading: boolean;
    canPay: boolean;
    onPayment: () => void;
}

export function PaymentInfoCard({ assignment, payment, isLoading, canPay, onPayment }: PaymentInfoCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold font-spline">
                        {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.TITLE")}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : payment ? (
                    <div className="space-y-6">
                        {/* Main Amount */}
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.TOTAL_AMOUNT")}</p>
                            <div className="flex items-baseline justify-between">
                                <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                                    {formatCurrency(payment.amountTotal)}
                                </p>
                                <StatusBadge status={payment.status} />
                            </div>
                        </div>

                        <Separator />

                        {/* Breakdown */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.WORKER_AMOUNT")}</span>
                                <span className="font-medium">{formatCurrency(payment.workerAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.PLATFORM_FEE")}</span>
                                <span className="font-medium text-muted-foreground">{formatCurrency(payment.platformFee)}</span>
                            </div>
                            {payment.paidAt && (
                                <div className="flex items-center justify-between text-sm pt-2 text-emerald-600 dark:text-emerald-400">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.PAID_ON")}
                                    </span>
                                    <span className="font-bold">{formatDate(payment.paidAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {assignment.status === "COMPLETED"
                                    ? t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.NO_PAYMENT")
                                    : t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.COMPLETE_FOR_PAYMENT")}
                            </p>
                        </div>

                        {canPay ? (
                            <Button onClick={onPayment} className="w-full font-bold">
                                <DollarSign className="h-4 w-4 mr-2" />
                                {t("ASSIGNED_MISSION_VIEW.HEADER.PROCESS_PAYMENT")}
                            </Button>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                * Payment available after completion
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
