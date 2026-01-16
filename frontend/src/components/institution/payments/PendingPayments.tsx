
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Banknote, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { MissionAssignment } from "@/types/assignment.types";
import type { Payment } from "@/types/payment.types";

interface PendingPaymentsProps {
    assignments: MissionAssignment[];
    payments: Payment[];
    formatCurrency: (amount: number) => string;
}

export function PendingPayments({ assignments, payments, formatCurrency }: PendingPaymentsProps) {
    const { t } = useTranslation();

    if (assignments.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Banknote className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {t("FINANCIAL.AWAITING_SECTION.TITLE")}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        {assignments.length} {assignments.length > 1 ? t("FINANCIAL.AWAITING_SECTION.SUB_plural") : t("FINANCIAL.AWAITING_SECTION.SUB")}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => {
                    const pendingPayment = payments.find(
                        (p) => p.missionAssignmentId === assignment.id && p.status === "PENDING"
                    );
                    const price = pendingPayment ? pendingPayment.amountTotal : assignment.mission?.budget;

                    return (
                        <Card
                            key={assignment.id}
                            className="border-border/40 shadow-xl bg-card/60 backdrop-blur-xl border-l-[6px] border-l-primary group hover:shadow-2xl transition-all duration-300"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20 bg-card shadow-sm">
                                            <AvatarFallback className="font-bold text-sm bg-primary/5 text-primary">
                                                {assignment.worker?.firstName?.[0]}
                                                {assignment.worker?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                                            </h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {assignment.worker?.speciality?.name || "Professional"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 mb-6 group-hover:bg-muted/30 transition-colors space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
                                            {t("FINANCIAL.TABLE.COLUMNS.MISSION")}
                                        </p>
                                        <p className="text-xs font-bold truncate text-foreground/80">
                                            {assignment.mission?.title}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                            {t("FINANCIAL.TABLE.COLUMNS.AMOUNT")}
                                        </span>
                                        <span className="text-lg font-bold text-primary">
                                            {price ? formatCurrency(price) : "-"}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    <Link to={`/institution/payments/${assignment.id}`}>
                                        {t("FINANCIAL.AWAITING_SECTION.PAY_NOW")}
                                        <ArrowUpRight className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
