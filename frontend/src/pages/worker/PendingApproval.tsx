import { motion } from "framer-motion";
import { Clock, FileCheck, User, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { shouldReduceMotion } from "@/lib/animations";
import { cn } from "@/lib/utils";

/**
 * Page displayed to workers with PENDING status when they try to access
 * restricted pages that require verification.
 */
export default function PendingApproval() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const reduceMotion = shouldReduceMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
        },
    };

    const steps = [
        {
            icon: User,
            title: t("PENDING_APPROVAL.ACTIONS.PROFILE_TITLE"),
            description: t("PENDING_APPROVAL.ACTIONS.PROFILE_DESC"),
            status: "completed" as const,
        },
        {
            icon: FileCheck,
            title: t("PENDING_APPROVAL.ACTIONS.DOCS_TITLE"),
            description: t("PENDING_APPROVAL.ACTIONS.DOCS_DESC"),
            status: "pending" as const,
        },
        {
            icon: CheckCircle2,
            title: t("PENDING_APPROVAL.WAIT_TITLE"),
            description: t("PENDING_APPROVAL.ALERT.DESC"),
            status: "pending" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            {!reduceMotion && (
                <>
                    <motion.div
                        className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </>
            )}

            <motion.div
                className="container mx-auto max-w-4xl relative z-10"
                variants={containerVariants}
                initial={reduceMotion ? "visible" : "hidden"}
                animate="visible"
            >
                <Card className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-6 sm:p-8 md:p-12">
                        {/* Header Section */}
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            {/* Animated Clock Icon */}
                            <div className="relative inline-flex mb-6">
                                <motion.div
                                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"
                                    animate={reduceMotion ? {} : {
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-linear-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30">
                                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>

                            <h1 className=" text-2xl sm:text-3xl font-bold text-foreground mb-3 font-spline">
                                {t("PENDING_APPROVAL.TITLE")}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                                {t("PENDING_APPROVAL.DESC")}
                            </p>
                        </motion.div>

                        {/* Alert Section */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <Alert className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold text-base mb-1.5">
                                            {t("PENDING_APPROVAL.ALERT.TITLE")}
                                        </AlertTitle>
                                        <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                                            {t("PENDING_APPROVAL.ALERT.DESC")}
                                        </AlertDescription>
                                    </div>
                                </div>
                            </Alert>
                        </motion.div>

                        {/* Progress Steps */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <div className="grid gap-4 sm:grid-cols-3">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = step.status === "completed";
                                    const isPending = step.status === "pending";

                                    return (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className={cn(
                                                "relative rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 hover:shadow-lg",
                                                isCompleted && "border-green-500/40 bg-linear-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 shadow-sm shadow-green-500/10",
                                                isPending && "border-border bg-linear-to-br from-muted/30 to-muted/10"
                                            )}
                                        >
                                            {/* Step Number Badge */}
                                            <div className={cn(
                                                "absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm",
                                                isCompleted && "bg-green-500 border-green-600 text-white",
                                                isPending && "bg-card border-border text-muted-foreground"
                                            )}>
                                                {index + 1}
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                                                        isCompleted && "bg-green-500/20 text-green-600 dark:text-green-400 ring-2 ring-green-500/30",
                                                        isPending && "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm sm:text-base text-foreground mb-2 line-clamp-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status Indicator */}
                                            {isCompleted && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Motivational Message */}
                        <motion.div
                            variants={itemVariants}
                            className="mb-8 rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-2 ring-primary/20">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground mb-2">
                                        {t("PENDING_APPROVAL.MOTIVATIONAL.TITLE")}
                                    </h3>
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        {t("PENDING_APPROVAL.MOTIVATIONAL.MESSAGE")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4"
                        >
                            <motion.div
                                className="flex-1"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => navigate("/worker/profile")}
                                    className="w-full gap-2 h-14 text-base font-bold bg-linear-to-r from-primary to-primary/90 hover:shadow-xl hover:shadow-primary/30 shadow-lg shadow-primary/20 transition-all duration-300 border-0"
                                    size="lg"
                                >
                                    <User className="h-5 w-5 mr-1 shrink-0" />
                                    {t("PENDING_APPROVAL.ACTIONS.GO_PROFILE")}
                                    <ArrowRight className="h-5 w-5 ml-auto shrink-0" />
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex-1"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => navigate("/worker/documents")}
                                    variant="outline"
                                    className="w-full gap-2 h-14 text-base font-semibold border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                                    size="lg"
                                >
                                    <FileCheck className="h-5 w-5 mr-1 text-primary shrink-0" />
                                    {t("PENDING_APPROVAL.ACTIONS.MANAGE_DOCS")}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
