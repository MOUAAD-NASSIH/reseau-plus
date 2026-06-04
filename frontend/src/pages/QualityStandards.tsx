import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Award,
    CheckCircle2,
    ArrowLeft,
    Lock,
    Eye,
    Clock,
    Upload,
    ClipboardCheck,
    BadgeCheck,
    User,
    Briefcase,
    FileText,
    GraduationCap,
    Shield,
} from "lucide-react";
import { Footer } from "@/components/landing";
import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";

export default function QualityStandards() {
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    // Admin verification steps
    const adminSteps = [
        {
            icon: Upload,
            title: t("QUALITY_STANDARDS.ADMIN_STEP_1_TITLE"),
            description: t("QUALITY_STANDARDS.ADMIN_STEP_1_DESC"),
            step: "01",
        },
        {
            icon: ClipboardCheck,
            title: t("QUALITY_STANDARDS.ADMIN_STEP_2_TITLE"),
            description: t("QUALITY_STANDARDS.ADMIN_STEP_2_DESC"),
            step: "02",
        },
        {
            icon: BadgeCheck,
            title: t("QUALITY_STANDARDS.ADMIN_STEP_3_TITLE"),
            description: t("QUALITY_STANDARDS.ADMIN_STEP_3_DESC"),
            step: "03",
        },
    ];

    // Profile strength factors
    const profileFactors = [
        {
            icon: User,
            title: t("QUALITY_STANDARDS.PROFILE_FACTOR_PERSONAL"),
            description: t("QUALITY_STANDARDS.PROFILE_FACTOR_PERSONAL_DESC"),
        },
        {
            icon: Briefcase,
            title: t("QUALITY_STANDARDS.PROFILE_FACTOR_PROFESSIONAL"),
            description: t("QUALITY_STANDARDS.PROFILE_FACTOR_PROFESSIONAL_DESC"),
        },
        {
            icon: FileText,
            title: t("QUALITY_STANDARDS.PROFILE_FACTOR_DOCUMENTS"),
            description: t("QUALITY_STANDARDS.PROFILE_FACTOR_DOCUMENTS_DESC"),
        },
        {
            icon: GraduationCap,
            title: t("QUALITY_STANDARDS.PROFILE_FACTOR_EXPERIENCE"),
            description: t("QUALITY_STANDARDS.PROFILE_FACTOR_EXPERIENCE_DESC"),
        },
    ];

    // GDPR features
    const gdprFeatures = [
        {
            icon: Lock,
            title: t("QUALITY_STANDARDS.GDPR_ENCRYPTION"),
            description: t("QUALITY_STANDARDS.GDPR_ENCRYPTION_DESC"),
        },
        {
            icon: Eye,
            title: t("QUALITY_STANDARDS.GDPR_ACCESS"),
            description: t("QUALITY_STANDARDS.GDPR_ACCESS_DESC"),
        },
        {
            icon: Shield,
            title: t("QUALITY_STANDARDS.GDPR_RIGHTS"),
            description: t("QUALITY_STANDARDS.GDPR_RIGHTS_DESC"),
        },
        {
            icon: Clock,
            title: t("QUALITY_STANDARDS.GDPR_RETENTION"),
            description: t("QUALITY_STANDARDS.GDPR_RETENTION_DESC"),
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1">
                {/* ═══════════════════════════════════════════
                    HERO SECTION (Two-column layout)
                ═══════════════════════════════════════════ */}
                <section className="relative overflow-hidden py-12 bg-linear-to-b from-muted/50 to-background">
                    <div className="container mx-auto px-4 md:px-6">
                        {/* Breadcrumb moved inside Hero */}
                        <motion.div
                            className="mb-10 md:mb-16"
                            initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link
                                to="/"
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                {t("QUALITY_STANDARDS.BACK_HOME")}
                            </Link>
                        </motion.div>

                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                            {/* Left Text Column */}
                            <motion.div
                                className="flex-1 space-y-8 text-center lg:text-left z-10"
                                variants={reduceMotion ? {} : staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                <motion.div
                                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
                                    variants={reduceMotion ? {} : fadeUpItem}
                                >
                                    <span className="flex items-center justify-center rounded-full bg-primary/20 p-1">
                                        <Award className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="font-semibold tracking-wide">
                                        {t("QUALITY_STANDARDS.HERO_BADGE")}
                                    </span>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl sm:text-5xl lg:text-6xl font-bold font-spline tracking-tight text-foreground"
                                    variants={reduceMotion ? {} : fadeUpItem}
                                >
                                    {t("QUALITY_STANDARDS.PAGE_TITLE")}
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
                                    variants={reduceMotion ? {} : fadeUpItem}
                                >
                                    {t("QUALITY_STANDARDS.PAGE_SUBTITLE")}
                                </motion.p>
                            </motion.div>

                            {/* Right Image/Graphic Column */}
                            <motion.div
                                className="flex-1 w-full relative"
                                initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[80px] -z-10" />

                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card aspect-[4/3] sm:aspect-video lg:aspect-[4/3]">
                                    <img
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070"
                                        alt="Quality Standards"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Subtle overlay gradient */}
                                    <div className="absolute inset-0 bg-linear-to-tr from-background/60 via-transparent to-transparent" />

                                    {/* Floating Verified Badge Graphic */}
                                    <motion.div
                                        className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-4"
                                        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{t("QUALITY_STANDARDS.SECTION_ADMIN_TITLE")}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <CheckCircle2 className="w-3 h-3 text-primary" /> 100% Secure
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 1 — Admin Verification Process (Timeline)
                ═══════════════════════════════════════════ */}
                <section className="py-20 lg:py-32">
                    <div className="container mx-auto px-4 md:px-6">
                        <motion.div
                            className="max-w-3xl mb-16 space-y-4 text-center mx-auto"
                            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold font-spline tracking-tight">
                                {t("QUALITY_STANDARDS.SECTION_ADMIN_TITLE")}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t("QUALITY_STANDARDS.SECTION_ADMIN_DESC")}
                            </p>
                        </motion.div>

                        <div className="max-w-4xl mx-auto relative">
                            {/* Vertical Line for timeline (visible on md+) */}
                            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-border/60 -translate-x-1/2" />

                            <div className="space-y-12 md:space-y-0 relative">
                                {adminSteps.map((step, i) => {
                                    const isEven = i % 2 === 0;
                                    return (
                                        <motion.div
                                            key={i}
                                            className={`relative flex flex-col md:flex-row items-center md:justify-between ${isEven ? "md:flex-row-reverse" : ""
                                                }`}
                                            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                        >
                                            {/* Spacer for empty side on desktop */}
                                            <div className="hidden md:block w-5/12" />

                                            {/* Center Icon/Step Indicator */}
                                            <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-background border-4 border-muted/30 shadow-sm relative mb-6 md:mb-0">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <step.icon className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div className={`w-full md:w-5/12 ${isEven ? "md:text-right" : "md:text-left"} text-center`}>
                                                <div className="bg-card border border-border/50 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                                                    <div className="text-primary font-bold text-sm mb-2 opacity-80">
                                                        Étape {step.step}
                                                    </div>
                                                    <h3 className="text-xl font-bold font-spline mb-3">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 2 — Profile Strength
                ═══════════════════════════════════════════ */}
                <section className="py-20 lg:py-32 bg-muted/30 border-y border-border/40">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">

                            {/* Left: Text Content */}
                            <motion.div
                                className="space-y-8 order-2 lg:order-1"
                                initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="space-y-4 text-center lg:text-left">
                                    <h2 className="text-3xl md:text-4xl font-bold font-spline tracking-tight">
                                        {t("QUALITY_STANDARDS.SECTION_PROFILE_TITLE")}
                                    </h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {t("QUALITY_STANDARDS.SECTION_PROFILE_DESC")}
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {profileFactors.map((factor, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex flex-col gap-3 p-5 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors shadow-sm"
                                            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.1 * i }}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <factor.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base mb-1">{factor.title}</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{factor.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Right: Visual Profile Strength Card */}
                            <motion.div
                                className="flex justify-center order-1 lg:order-2"
                                initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="relative w-full max-w-md">
                                    {/* Soft background glow */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 rounded-[3rem] blur-[60px] -z-10" />

                                    <div className="bg-background rounded-3xl border border-border/60 shadow-xl overflow-hidden flex flex-col">

                                        {/* Card Header (Profile Info) */}
                                        <div className="p-6 md:p-8 border-b border-border/40 bg-muted/10">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background shadow-sm ring-2 ring-primary/20">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1712215544003-af10130f8eb3?w=150&h=150&fit=crop&crop=top"
                                                            alt={"Ahmed Elaouni"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Ahmed Elaouni</h3>
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                                        <span>{t("TRUST.VERIFIED_PRO")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body (Strength Indicator) */}
                                        <div className="p-6 md:p-8 space-y-6">
                                            {/* Progress Bar Area */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        {t("QUALITY_STANDARDS.SECTION_PROFILE_TITLE")}
                                                    </span>
                                                    <span className="text-primary font-bold text-lg leading-none">100%</span>
                                                </div>
                                                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden inset-ring-1 inset-ring-black/5">
                                                    <motion.div
                                                        className="h-full bg-primary rounded-full relative"
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: "100%" }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                                                    >
                                                        {/* Shine effect on progress bar */}
                                                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-white/20 to-transparent" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Checklist */}
                                            <div className="space-y-3 pt-2">
                                                {profileFactors.map((factor, i) => (
                                                    <div key={i} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <factor.icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-foreground/80">{factor.title}</span>
                                                        </div>
                                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 3 — GDPR & Data Protection
                ═══════════════════════════════════════════ */}
                <section className="py-20 lg:py-32">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-center">

                            {/* Left Text */}
                            <motion.div
                                className="lg:col-span-5 space-y-6 text-center lg:text-left"
                                initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold font-spline tracking-tight">
                                    {t("QUALITY_STANDARDS.SECTION_GDPR_TITLE")}
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {t("QUALITY_STANDARDS.SECTION_GDPR_DESC")}
                                </p>
                            </motion.div>

                            {/* Right Bento Grid */}
                            <div className="lg:col-span-7">
                                <motion.div
                                    className="grid sm:grid-cols-2 gap-4 md:gap-6"
                                    variants={reduceMotion ? {} : staggerContainer}
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true }}
                                >
                                    {gdprFeatures.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                                            variants={reduceMotion ? {} : fadeUpItem}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
                                                <feature.icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold font-spline mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
