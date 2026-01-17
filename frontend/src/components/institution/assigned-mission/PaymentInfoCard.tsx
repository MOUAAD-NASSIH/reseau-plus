import { DollarSign, ShieldCheck, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.TITLE")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                {isLoading ? (
                    <Skeleton className="h-40 w-full rounded-2xl" />
                ) : payment ? (
                    <div className="space-y-4">
                        <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">{t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.STATUS")}</span>
                                <StatusBadge status={payment.status} />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                <span className="text-sm font-bold text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.TOTAL_AMOUNT")}</span>
                                <span className="text-xl font-black text-foreground">
                                    {formatCurrency(payment.amountTotal)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-3 px-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.WORKER_AMOUNT")}</span>
                                <span className="font-bold">{formatCurrency(payment.workerAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.PLATFORM_FEE")}</span>
                                <span className="font-bold text-muted-foreground">{formatCurrency(payment.platformFee)}</span>
                            </div>
                            {payment.paidAt && (
                                <div className="flex items-center justify-between text-sm pt-3 border-t border-border/40">
                                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.PAID_ON")}
                                    </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatDate(payment.paidAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-6 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/40">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground px-6">
                            {assignment.status === "COMPLETED"
                                ? t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.NO_PAYMENT")
                                : t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.COMPLETE_FOR_PAYMENT")}
                        </p>
                        {canPay && (
                            <Button onClick={onPayment} className="rounded-2xl font-black px-8 py-6 h-auto shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                <CreditCard className="h-5 w-5 mr-3" />
                                {t("ASSIGNED_MISSION_VIEW.HEADER.PROCESS_PAYMENT")}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
