import {
    ShieldCheck,
    Clock,
    CheckCircle2,
    Award,
    Shield,
    FileCheck,
    Lock,
    ArrowRight,
    Briefcase,
    Building2,
    Users,
    Star,
    MessageSquare
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export function Features() {
    const [activeTab, setActiveTab] = useState("workers");
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    const featuresWorker = [
        {
            icon: Briefcase,
            title: t("FEATURES.WORKER_FEATURES.MISSIONS.TITLE"),
            description: t("FEATURES.WORKER_FEATURES.MISSIONS.DESC"),
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            icon: Star,
            title: t("FEATURES.WORKER_FEATURES.REVIEWS.TITLE"),
            description: t("FEATURES.WORKER_FEATURES.REVIEWS.DESC"),
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: Clock,
            title: t("FEATURES.WORKER_FEATURES.FLEXIBILITY.TITLE"),
            description: t("FEATURES.WORKER_FEATURES.FLEXIBILITY.DESC"),
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        }
    ];

    const featuresInstitution = [
        {
            icon: ShieldCheck,
            title: t("FEATURES.INSTITUTION_FEATURES.VETTED.TITLE"),
            description: t("FEATURES.INSTITUTION_FEATURES.VETTED.DESC"),
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            icon: MessageSquare,
            title: t("FEATURES.INSTITUTION_FEATURES.MESSAGING.TITLE"),
            description: t("FEATURES.INSTITUTION_FEATURES.MESSAGING.DESC"),
            color: "text-rose-500",
            bg: "bg-rose-50 dark:bg-rose-900/20"
        },
        {
            icon: FileCheck,
            title: t("FEATURES.INSTITUTION_FEATURES.COMPLIANCE.TITLE"),
            description: t("FEATURES.INSTITUTION_FEATURES.COMPLIANCE.DESC"),
            color: "text-teal-500",
            bg: "bg-teal-50 dark:bg-teal-900/20"
        }
    ];

    const stats = [
        { label: t("STATS.MISSIONS"), value: "2k+" },
        { label: t("STATS.SATISFACTION"), value: "98%" },
        { label: t("STATS.TIME"), value: "24h" },
        { label: t("STATS.VERIFIED"), value: t("STATS.VERIFIED_LABEL") },
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

                <div className="w-full mb-24">
                    <div className="flex justify-center mb-12">
                        <div className="grid w-full max-w-md grid-cols-2 p-1 rounded-full bg-muted/50 items-center h-[52px]">
                            <button
                                onClick={() => setActiveTab("workers")}
                                className={`w-full h-full flex items-center justify-center rounded-full transition-all font-medium ${activeTab === "workers" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                {t("FEATURES.TABS.WORKERS")}
                            </button>
                            <button
                                onClick={() => setActiveTab("institutions")}
                                className={`w-full h-full flex items-center justify-center rounded-full transition-all font-medium ${activeTab === "institutions" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Building2 className="w-4 h-4 mr-2" />
                                {t("FEATURES.TABS.INSTITUTIONS")}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {activeTab === "workers" && (
                                <motion.div
                                    key="workers"
                                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                    variants={reduceMotion ? {} : {
                                        initial: { opacity: 0 },
                                        animate: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                                        },
                                        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
                                    }}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {featuresWorker.map((feature, index) => (
                                        <motion.div
                                            key={`worker-${index}`}
                                            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:bg-background hover:border-border"
                                            variants={reduceMotion ? {} : fadeUpItem}
                                            whileHover={reduceMotion ? {} : { y: -5, transition: { duration: 0.2 } }}
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-300">
                                                <feature.icon className={`w-28 h-28 -rotate-12 ${feature.color}`} />
                                            </div>
                                            <motion.div
                                                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6 shadow-sm ${feature.bg} ${feature.color}`}
                                                whileHover={reduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <feature.icon className="h-7 w-7" />
                                            </motion.div>
                                            <h4 className="mb-3 text-xl font-bold font-spline tracking-tight">{feature.title}</h4>
                                            <p className="text-muted-foreground leading-relaxed flex-grow">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === "institutions" && (
                                <motion.div
                                    key="institutions"
                                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                    variants={reduceMotion ? {} : {
                                        initial: { opacity: 0 },
                                        animate: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                                        },
                                        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
                                    }}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {featuresInstitution.map((feature, index) => (
                                        <motion.div
                                            key={`inst-${index}`}
                                            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:bg-background hover:border-border"
                                            variants={reduceMotion ? {} : fadeUpItem}
                                            whileHover={reduceMotion ? {} : { y: -5, transition: { duration: 0.2 } }}
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-300">
                                                <feature.icon className={`w-28 h-28 -rotate-12 ${feature.color}`} />
                                            </div>
                                            <motion.div
                                                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6 shadow-sm ${feature.bg} ${feature.color}`}
                                                whileHover={reduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <feature.icon className="h-7 w-7" />
                                            </motion.div>
                                            <h4 className="mb-3 text-xl font-bold font-spline tracking-tight">{feature.title}</h4>
                                            <p className="text-muted-foreground leading-relaxed flex-grow">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

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
                                            <img src="https://images.unsplash.com/photo-1712215544003-af10130f8eb3?w=100&h=100&fit=crop&crop=top" alt="James Bond" />
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
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                            </div>
                                            {item.showCheck && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                            {item.showPass && (
                                                <div className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
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
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{t("TRUST.POINT_2_TITLE")}</h4>
                                        <p className="text-muted-foreground">{t("TRUST.POINT_2_DESC")}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div className="pt-4" variants={reduceMotion ? {} : fadeUpItem}>
                                <Link to="/quality-standards" className="inline-flex items-center text-primary font-semibold hover:underline">
                                    {t("TRUST.LEARN_MORE_LINK")} <ArrowRight className="ml-2 w-4 h-4" />
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
