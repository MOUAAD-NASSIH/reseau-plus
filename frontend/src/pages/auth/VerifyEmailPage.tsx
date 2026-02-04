import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useVerifyEmailQuery } from "@/features/api/endpoints/authEndpoints";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const reduceMotion = shouldReduceMotion();

    // RTK Query hook handles fetching automatically
    const { isLoading, isSuccess, isError } = useVerifyEmailQuery(token || "", {
        skip: !token,
    });

    // 1. Missing Token State
    if (!token) {
        return (
            <AuthLayout
                title={t("AUTH.VERIFY_EMAIL_PAGE.INVALID_LINK_TITLE")}
                subtitle={t("AUTH.VERIFY_EMAIL_PAGE.INVALID_LINK_SUBTITLE")}
                brandingTitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_TITLE")}
                brandingSubtitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_SUBTITLE")}
            >
                <motion.div
                    className="space-y-6 text-center"
                    variants={reduceMotion ? {} : staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={reduceMotion ? {} : fadeUpItem} className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-destructive" />
                        </div>
                    </motion.div>
                    <motion.p variants={reduceMotion ? {} : fadeUpItem} className="text-muted-foreground">
                        {t("AUTH.VERIFY_EMAIL_PAGE.INVALID_LINK_MESSAGE")}
                    </motion.p>
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <AnimatedButton variant="outline" className="w-full" onClick={() => navigate("/login")}>
                            {t("AUTH.RESET_PASSWORD_PAGE.SIGN_IN")}
                        </AnimatedButton>
                    </motion.div>
                </motion.div>
            </AuthLayout>
        );
    }

    // 2. Loading State
    if (isLoading) {
        return (
            <AuthLayout
                title={t("AUTH.VERIFY_EMAIL_PAGE.TITLE")}
                subtitle={t("AUTH.VERIFY_EMAIL_PAGE.SUBTITLE")}
                brandingTitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_TITLE")}
                brandingSubtitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_SUBTITLE")}
            >
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Verifying...</p>
                </div>
            </AuthLayout>
        );
    }

    // 3. Success State
    if (isSuccess) {
        return (
            <AuthLayout
                title={t("AUTH.VERIFY_EMAIL_PAGE.SUCCESS_TITLE")}
                subtitle={t("AUTH.VERIFY_EMAIL_PAGE.SUCCESS_SUBTITLE")}
                brandingTitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_TITLE")}
                brandingSubtitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_SUBTITLE")}
            >
                <motion.div
                    className="space-y-6 text-center"
                    variants={reduceMotion ? {} : staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={reduceMotion ? {} : fadeUpItem} className="flex justify-center">
                        <motion.div
                            className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </motion.div>
                    </motion.div>
                    <motion.p variants={reduceMotion ? {} : fadeUpItem} className="text-muted-foreground">
                        {t("AUTH.VERIFY_EMAIL_PAGE.SUCCESS_MESSAGE")}
                    </motion.p>
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <AnimatedButton variant="primary" size="lg" className="w-full font-bold" onClick={() => navigate("/login")}>
                            {t("AUTH.VERIFY_EMAIL_PAGE.LOGIN_BUTTON")}
                        </AnimatedButton>
                    </motion.div>
                </motion.div>
            </AuthLayout>
        );
    }

    // 4. Error State
    if (isError) {
        return (
            <AuthLayout
                title={t("AUTH.VERIFY_EMAIL_PAGE.ERROR_TITLE")}
                subtitle={t("AUTH.VERIFY_EMAIL_PAGE.ERROR_SUBTITLE")}
                brandingTitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_TITLE")}
                brandingSubtitle={t("AUTH.VERIFY_EMAIL_PAGE.BRANDING_SUBTITLE")}
            >
                <motion.div
                    className="space-y-6 text-center"
                    variants={reduceMotion ? {} : staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={reduceMotion ? {} : fadeUpItem} className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-destructive" />
                        </div>
                    </motion.div>
                    <motion.p variants={reduceMotion ? {} : fadeUpItem} className="text-muted-foreground">
                        {t("AUTH.VERIFY_EMAIL_PAGE.ERROR_MESSAGE")}
                    </motion.p>
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <AnimatedButton variant="outline" className="w-full" onClick={() => navigate("/login")}>
                            {t("AUTH.RESET_PASSWORD_PAGE.SIGN_IN")}
                        </AnimatedButton>
                    </motion.div>
                </motion.div>
            </AuthLayout>
        );
    }

    return null;
}
