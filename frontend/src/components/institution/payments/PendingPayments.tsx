import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground font-spline">
                            {t("FINANCIAL.AWAITING_SECTION.TITLE")}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            {assignments.length} {assignments.length > 1 ? t("FINANCIAL.AWAITING_SECTION.SUB_plural") : t("FINANCIAL.AWAITING_SECTION.SUB")}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="h-7 px-3 rounded-full text-amber-600 border-amber-500/20 bg-amber-500/5 font-spline">
                    {assignments.length}
                </Badge>
            </div>

            {/* Pending Payments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assignments.map((assignment) => {
                    const pendingPayment = payments.find(
                        (p) => p.missionAssignmentId === assignment.id && p.status === "PENDING"
                    );
                    const price = pendingPayment ? pendingPayment.amountTotal : assignment.mission?.budget;

                    return (
                        <Card
                            key={assignment.id}
                            className="border-border/40 shadow-md bg-card group hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
                        >
                            <CardContent className="p-5 space-y-4">
                                {/* Worker Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                        <AvatarImage
                                            src={assignment.worker?.profilePicture ?? assignment.worker?.user?.profilePicture ?? undefined}
                                            alt={`${assignment.worker?.firstName} ${assignment.worker?.lastName}`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                            {assignment.worker?.firstName?.[0]}
                                            {assignment.worker?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                            {assignment.worker?.firstName} {assignment.worker?.lastName}
                                        </h4>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                                            {assignment.worker?.speciality?.name || t("COMMON.SOCIAL_WORKER")}
                                        </p>
                                    </div>
                                </div>

                                {/* Mission Details */}
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                            {t("FINANCIAL.TABLE.COLUMNS.MISSION")}
                                        </p>
                                        <p className="text-sm font-bold text-foreground/90 line-clamp-2 leading-relaxed font-spline">
                                            {assignment.mission?.title}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/50">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {t("FINANCIAL.TABLE.COLUMNS.AMOUNT")}
                                        </span>
                                        <span className="text-lg font-black text-amber-600 font-spline">
                                            {price ? formatCurrency(price) : "-"}
                                        </span>
                                    </div>
                                </div>

                                {/* Pay Now Button */}
                                <Button
                                    asChild
                                    className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30 transition-all group-hover:scale-[1.02]"
                                >
                                    <Link to={`/institution/payments/${assignment.id}`}>
                                        {t("FINANCIAL.AWAITING_SECTION.PAY_NOW")}
                                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
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
