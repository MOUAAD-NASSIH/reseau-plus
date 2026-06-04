import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";
import Underline from "@/assets/Underline"

export function Hero() {
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    return (
        <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-32 lg:pt-24 lg:pb-40">
            {/* Animated background blob */}
            <motion.div
                className="absolute top-20 left-1/4 -z-10 h-[600px] w-[600px] bg-primary/10 blur-[120px] rounded-full"
                animate={reduceMotion ? {} : {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Text and CTA Column */}
                    <motion.div
                        className="flex-1 space-y-8 text-center lg:text-left"
                        variants={reduceMotion ? {} : staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm text-primary backdrop-blur-sm transition-colors hover:bg-primary/10"
                            variants={reduceMotion ? {} : fadeUpItem}
                        >
                            <span className="flex items-center justify-center rounded-full bg-primary/20 p-1">
                                <ShieldCheck className="h-3 w-3" />
                            </span>
                            <span className="font-semibold tracking-wide">
                                {t("HERO.TRUSTED_PLATFORM")}
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl font-bold font-spline tracking-tight sm:text-5xl lg:text-6xl"
                            variants={reduceMotion ? {} : fadeUpItem}
                        >
                            {t("HERO.TITLE_LINE_1")} <span className="text-primary relative inline-block">
                                <Underline className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30" />
                                {t("HERO.TITLE_LINE_2")}
                            </span> {t("HERO.TITLE_LINE_3")}
                        </motion.h1>

                        <motion.p
                            className="mx-auto lg:mx-0 max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed"
                            variants={reduceMotion ? {} : fadeUpItem}
                        >
                            {t("HERO.SUBTITLE")}
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                            variants={reduceMotion ? {} : fadeUpItem}
                        >
                            <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-primary/20" asChild>
                                <Link to="/register/worker">
                                    <Search className="mr-2 h-5 w-5" />
                                    {t("HERO.FIND_WORK")}
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto" asChild>
                                <Link to="/register/institution">
                                    {t("HERO.FIND_TALENT")}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground pt-4"
                            variants={reduceMotion ? {} : fadeUpItem}
                        >
                            <div className="flex -space-x-3">
                                {[
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
                                ].map((src, i) => (
                                    <motion.div
                                        key={i}
                                        className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden"
                                        initial={reduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <img
                                            src={src}
                                            alt="Professional"
                                            className="h-full w-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-left">{t("HERO.JOIN_PROS")}</p>
                        </motion.div>
                    </motion.div>

                    {/* Image / Hero Graphic Column */}
                    <motion.div
                        className="flex-1 w-full relative"
                        initial={reduceMotion ? {} : { opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {/* Decorative blobs */}
                        <motion.div
                            className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary/20 blur-[100px] rounded-full opacity-50"
                            animate={reduceMotion ? {} : {
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.7, 0.5],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border bg-card">
                            <img
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070"
                                alt="Professional collaboration"
                                className="w-full h-[400px] object-cover transition-transform duration-700 hover:scale-105"
                            />

                            {/* Floating "Success Match" Card */}
                            <motion.div
                                className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-lg border"
                                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary"
                                        initial={reduceMotion ? {} : { scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                                    >
                                        <CheckCircle2 className="h-6 w-6" />
                                    </motion.div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{t("HERO.SUCCESS_MATCH")}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            "{t("HERO.TESTIMONIAL")}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
