import { ShieldAlert, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface PaymentErrorStateProps {
    error: string | null;
    onRetry: () => void;
    onCancel: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function PaymentErrorState({
    error,
    onRetry,
    onCancel,
}: PaymentErrorStateProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto px-4"
        >
            <motion.div variants={itemVariants} className="relative mb-8">
                <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full scale-125" />
                <div className="relative h-20 w-20 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center ring-1 ring-destructive/20 shadow-xl shadow-destructive/10">
                    <ShieldAlert className="h-10 w-10" />
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 mb-10">
                <Badge variant="outline" className="rounded-full px-4 py-1 text-destructive border-destructive/20 bg-destructive/5 font-bold uppercase tracking-widest text-[10px]">
                    {t("PAYMENT.ERROR.BADGE") || "Transaction Failed"}
                </Badge>
                <h2 className="font-spline text-4xl font-bold text-foreground tracking-tight leading-tight">
                    {t("PAYMENT.ERROR.TITLE")}
                </h2>
                <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                    {error || t("PAYMENT.ERROR.SUBTITLE")}
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden rounded-xl transition-all text-left">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4 p-4 bg-destructive/5 rounded-xl border border-destructive/10 transition-colors">
                            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-destructive uppercase tracking-wide">
                                    {t("PAYMENT.ERROR.DETAILS_TITLE") || "Technical Details"}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                                    {error || t("PAYMENT.ERROR.DEFAULT_MESSAGE")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md">
                <Button
                    onClick={onRetry}
                    size="lg"
                    className="flex-1 h-10 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 active:translate-y-0.5 transition-all group bg-primary text-primary-foreground"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t("PAYMENT.ACTIONS.RETRY")}
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-10 rounded-lg text-sm font-bold bg-transparent hover:bg-muted/50 transition-all border-border/60"
                    onClick={onCancel}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("PAYMENT.ACTIONS.CANCEL")}
                </Button>
            </motion.div>
        </motion.div>
    );
}
