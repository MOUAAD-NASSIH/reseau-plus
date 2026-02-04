import { useNavigate } from "react-router";
import { CheckCircle2, ArrowRight, Download, Calendar, Receipt, Sparkles, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { exportReceiptToPDF } from "@/lib/exportUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MissionAssignment } from "@/types/assignment.types";

interface PaymentSuccessStateProps {
    assignmentId: string | number;
    existingPayment?: any;
    formatCurrency: (amount: number) => string;
    isPreExisting?: boolean;
    assignment?: MissionAssignment;
}

export function PaymentSuccessState({
    assignmentId,
    existingPayment,
    formatCurrency,
    isPreExisting = false,
    assignment
}: PaymentSuccessStateProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Safety fallback if no assignment/payment data is loaded yet
    const worker = assignment?.worker;
    const mission = assignment?.mission;
    const institution = assignment?.institution;
    const amount = Number(existingPayment?.amount || existingPayment?.amountTotal || mission?.budget || 0);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const iconVariants: Variants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
            }
        }
    };

    const sparkleVariants: Variants = {
        hidden: { opacity: 0, scale: 0 },
        visible: (i: number) => ({
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            transition: {
                duration: 1.5,
                delay: 0.5 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
            }
        })
    };

    // Constant platform fee (15%)
    const calculatedPlatformFee = amount * 0.15;

    // Create a complete payment object for export
    const completePaymentData = existingPayment ? {
        ...existingPayment,
        assignment: existingPayment.assignment || existingPayment.missionAssignment || assignment,
        missionAssignment: existingPayment.missionAssignment || existingPayment.assignment || assignment,
        // Ensure required fields exist
        id: existingPayment.id || assignmentId,
        missionAssignmentId: existingPayment.missionAssignmentId || assignmentId,
        amountTotal: Number(existingPayment.amountTotal || existingPayment.amount || amount),
        platformFee: Number(existingPayment.platformFee || calculatedPlatformFee),
        status: existingPayment.status || 'COMPLETED',
        paidAt: existingPayment.paidAt || new Date().toISOString(),
        createdAt: existingPayment.createdAt || new Date().toISOString()
    } : (assignment ? {
        // Create a payment object from assignment data if no existingPayment
        id: assignmentId,
        missionAssignmentId: assignmentId,
        assignment: assignment,
        missionAssignment: assignment,
        amountTotal: amount,
        amount: amount,
        platformFee: calculatedPlatformFee,
        status: 'COMPLETED',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        stripePaymentId: null
    } : null);


    const canDownloadReceipt = !!completePaymentData;


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center"
        >
            {/* Header with Animation */}
            <motion.div
                variants={itemVariants}
                className="relative mb-8 text-center"
            >
                <div className="relative inline-block mb-6">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/30 to-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />

                    {/* Sparkles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={sparkleVariants}
                            className="absolute"
                            style={{
                                top: `${Math.sin((i * Math.PI) / 3) * 60 + 40}px`,
                                left: `${Math.cos((i * Math.PI) / 3) * 60 + 40}px`,
                            }}
                        >
                            <Sparkles className="h-4 w-4 text-primary" />
                        </motion.div>
                    ))}

                    {/* Main Icon */}
                    <motion.div
                        variants={iconVariants}
                        className="relative h-20 w-20 sm:h-24 sm:w-24 bg-linear-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 ring-4 ring-primary/10"
                    >
                        <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-3" />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1.5 text-primary dark:text-primary border-primary/20 bg-primary/5 font-bold uppercase tracking-widest text-[10px]"
                    >
                        {isPreExisting ? t("PAYMENT.SUCCESS.ALREADY_PAID") : t("PAYMENT.SUCCESS.BADGE")}
                    </Badge>
                    <h1 className="font-spline text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground overflow-hidden">
                        {t("PAYMENT.SUCCESS.TITLE")}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-lg mx-auto">
                        {t("PAYMENT.SUCCESS.SUBTITLE")}
                    </p>
                </div>
            </motion.div>

            {/* Receipt Summary Card */}
            <motion.div variants={itemVariants} className="w-full max-w-2xl">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-primary/5">
                    <CardContent className="p-0">
                        {/* Summary Header */}
                        <div className="bg-muted/30 p-4 sm:p-6 flex items-center justify-between border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Receipt className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-sm font-bold font-spline uppercase tracking-wider text-foreground/80">
                                    {t("PAYMENT.SUCCESS.ORDER_DETAILS")}
                                </span>
                            </div>
                            <Badge variant="secondary" className="font-mono text-[10px] bg-background border border-border/50">
                                REF: #{assignmentId}
                            </Badge>
                        </div>

                        {/* Summary Grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Institution */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarImage src={institution?.logo || institution?.profilePicture || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Building className="h-6 w-6" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {t("PAYMENT.SUCCESS.INSTITUTION")}
                                    </p>
                                    <p className="text-sm font-bold truncate">
                                        {existingPayment?.institutionName || institution?.institutionName || t("PAYMENT.SUCCESS.YOUR_INSTITUTION")}
                                    </p>
                                </div>
                            </div>

                            {/* Professional */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarImage src={worker?.profilePicture || worker?.user?.profilePicture || undefined} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {worker?.firstName?.[0]}
                                        {worker?.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {t("PAYMENT.SUCCESS.PROFESSIONAL")}
                                    </p>
                                    <p className="text-sm font-bold truncate">
                                        {worker?.firstName} {worker?.lastName}
                                    </p>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border-2 border-background shadow-sm">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {t("PAYMENT.SUCCESS.DATE")}
                                    </p>
                                    <p className="text-sm font-bold">
                                        {existingPayment?.paidAt
                                            ? new Date(existingPayment.paidAt).toLocaleDateString()
                                            : new Date().toLocaleDateString()
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-background shadow-sm relative z-10">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                        {t("PAYMENT.SUCCESS.TOTAL_PAID")}
                                    </p>
                                    <p className="text-lg font-bold text-primary font-spline">
                                        {formatCurrency(amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-2xl px-4"
            >
                <Button
                    onClick={() => navigate("/institution/payments")}
                    size="lg"
                    className="w-full sm:flex-1 h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                >
                    {t("PAYMENT.SUCCESS.GOTO_HISTORY")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:flex-1 h-12 rounded-xl text-sm font-bold shadow-sm border-primary/20 hover:bg-primary/5"
                    onClick={() => {
                        if (completePaymentData) {
                            try {
                                exportReceiptToPDF(completePaymentData);
                            } catch (error) {
                                console.error('Error exporting receipt:', error);
                            }
                        }
                    }}
                    disabled={!canDownloadReceipt}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {t("PAYMENT.SUCCESS.DOWNLOAD_RECEIPT")}
                </Button>
            </motion.div>
        </motion.div>
    );
}
