import {
    Wallet,
    ShieldCheck,
    Clock,
    FileText,
    CheckCircle2,
    Award,
    Shield,
    FileCheck,
    RefreshCw,
    ArrowRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export function Features() {
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    const features = [
        {
            icon: Wallet,
            title: t("FEATURES.RATES.TITLE"),
            description: t("FEATURES.RATES.DESC"),
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: Clock,
            title: t("FEATURES.PAYOUTS.TITLE"),
            description: t("FEATURES.PAYOUTS.DESC"),
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            icon: ShieldCheck,
            title: t("FEATURES.VETTED.TITLE"),
            description: t("FEATURES.VETTED.DESC"),
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20"
        },
        {
            icon: FileText,
            title: t("FEATURES.BILLING.TITLE"),
            description: t("FEATURES.BILLING.DESC"),
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        }
    ];

    const stats = [
        { label: t("STATS.MISSIONS"), value: "2k+" },
        { label: t("STATS.SATISFACTION"), value: "98%" },
        { label: t("STATS.TIME"), value: "24h" },
        { label: t("STATS.VERIFIED"), value: "Verified" },
    ];

    return (
        <section id="features" className="py-0 bg-muted/30">
            {/* Stats Strip */}
            <div className="bg-muted text-muted-foreground py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-muted-foreground/20"
                        variants={reduceMotion ? {} : staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="space-y-2"
                                variants={reduceMotion ? {} : fadeUpItem}
                            >
                                <motion.div
                                    className="text-3xl lg:text-4xl font-bold font-spline tracking-tight"
                                    initial={reduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-xs uppercase tracking-widest opacity-80 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Main Features Grid */}
            <div className="py-24 container mx-auto px-4 md:px-6">
                <motion.div
                    className="text-center mb-16 space-y-4"
                    initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold font-spline tracking-tighter md:text-4xl lg:text-5xl">
                        {t("FEATURES.TITLE")}
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                        {t("FEATURES.SUBTITLE")}
                    </p>
                </motion.div>

                <motion.div
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-24"
                    variants={reduceMotion ? {} : staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-lg transition-all duration-300"
                            variants={reduceMotion ? {} : fadeUpItem}
                            whileHover={reduceMotion ? {} : { y: -8, transition: { duration: 0.2 } }}
                        >
                            <motion.div
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-6 ${feature.bg} ${feature.color}`}
                                whileHover={reduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <feature.icon className="h-6 w-6" />
                            </motion.div>
                            <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust & Quality Spotlight Section */}
                <motion.div
                    className="bg-card border rounded-3xl overflow-hidden shadow-sm"
                    initial={reduceMotion ? {} : { opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid lg:grid-cols-2 gap-0">
                        {/* Visual Side (Left) */}
                        <div className="bg-muted/50 dark:bg-muted/10 p-4 lg:p-12 flex items-center justify-center relative overflow-hidden">
                            {/* Background Glow */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"
                                animate={reduceMotion ? {} : {
                                    scale: [1, 1.2, 1],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />

                            {/* The Card */}
                            <motion.div
                                className="relative w-full max-w-sm bg-background border border-border/50 rounded-2xl p-6 shadow-2xl space-y-6"
                                initial={reduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {/* Profile Header */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=14&scale=150" alt="James" />
                                        </div>
                                        <motion.div
                                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]"
                                            initial={reduceMotion ? {} : { scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                        </motion.div>
                                    </div>
                                    <div className="text-foreground">
                                        <div className="font-bold text-sm">Ahmed Elaouni</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-primary" />
                                            {t("TRUST.VERIFIED_PRO")}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Bars */}
                                <div className="space-y-3">
                                    {[
                                        { icon: Award, label: t("TRUST.BADGE_LICENSED"), showCheck: true },
                                        { icon: FileCheck, label: t("TRUST.BADGE_MASTERS"), showCheck: true },
                                        { icon: Shield, label: t("TRUST.BADGE_BG_CHECK"), showPass: true },
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border/50"
                                            initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                            </div>
                                            {item.showCheck && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                            {item.showPass && (
                                                <div className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                                                    PASS
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="pt-2">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-muted-foreground">{t("TRUST.SCORE_LABEL")}</span>
                                        <span className="text-foreground font-bold">98/100</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "98%" }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Content Side (Right) */}
                        <motion.div
                            className="p-8 lg:p-12 flex flex-col justify-center space-y-8"
                            variants={reduceMotion ? {} : staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            <motion.div className="space-y-4" variants={reduceMotion ? {} : fadeUpItem}>
                                <h3 className="text-3xl font-bold font-spline tracking-tight">
                                    {t("TRUST.TITLE")} <br />
                                    <span className="text-muted-foreground">{t("TRUST.SUBTITLE")}</span>
                                </h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {t("TRUST.DESC")}
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.div className="flex gap-4" variants={reduceMotion ? {} : fadeUpItem}>
                                    <div className="mt-1 h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{t("TRUST.POINT_1_TITLE")}</h4>
                                        <p className="text-muted-foreground">{t("TRUST.POINT_1_DESC")}</p>
                                    </div>
                                </motion.div>
                                <motion.div className="flex gap-4" variants={reduceMotion ? {} : fadeUpItem}>
                                    <div className="mt-1 h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{t("TRUST.POINT_2_TITLE")}</h4>
                                        <p className="text-muted-foreground">{t("TRUST.POINT_2_DESC")}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div className="pt-4" variants={reduceMotion ? {} : fadeUpItem}>
                                <Link to="/about" className="inline-flex items-center text-primary font-semibold hover:underline">
                                    Learn more about our quality standards <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Trusted By Strip */}
                <motion.div
                    className="mt-24 border-t pt-12"
                    initial={reduceMotion ? {} : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
                        {t("FEATURES.TRUSTED_BY")}
                    </p>
                    <motion.div
                        className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-opacity"
                        variants={reduceMotion ? {} : staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {["TechCorp", "BuildIt", "EduSystems", "SecureNet", "UrbanPlan"].map((brand) => (
                            <motion.span
                                key={brand}
                                className="text-xl font-bold text-foreground/80"
                                variants={reduceMotion ? {} : fadeUpItem}
                                whileHover={reduceMotion ? {} : { scale: 1.1 }}
                            >
                                {brand}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
