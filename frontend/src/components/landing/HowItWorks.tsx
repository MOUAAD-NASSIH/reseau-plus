import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";

export function HowItWorks() {
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    const steps = [
        {
            number: "1",
            title: t("HOW_IT_WORKS.STEP_1.TITLE"),
            description: t("HOW_IT_WORKS.STEP_1.DESC"),
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070",
        },
        {
            number: "2",
            title: t("HOW_IT_WORKS.STEP_2.TITLE"),
            description: t("HOW_IT_WORKS.STEP_2.DESC"),
            image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
        },
        {
            number: "3",
            title: t("HOW_IT_WORKS.STEP_3.TITLE"),
            description: t("HOW_IT_WORKS.STEP_3.DESC"),
            image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2032",
        },
    ];

    return (
        <section id="how-it-works" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        className="flex-1 space-y-12"
                        variants={reduceMotion ? {} : staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <motion.div className="space-y-4" variants={reduceMotion ? {} : fadeUpItem}>
                            <h2 className="text-3xl font-bold font-spline tracking-tighter md:text-5xl">
                                {t("HOW_IT_WORKS.TITLE")}
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                {t("HOW_IT_WORKS.SUBTITLE")}
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="flex gap-6 group"
                                    variants={reduceMotion ? {} : fadeUpItem}
                                >
                                    <motion.div
                                        className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                        whileHover={reduceMotion ? {} : { scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        {step.number}
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                            <Button size="lg" className="h-12 px-8" asChild>
                                <Link to="/register/worker">{t("HOW_IT_WORKS.CTA")}</Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right: Visual Grid of Images */}
                    <motion.div
                        className="flex-1 w-full"
                        initial={reduceMotion ? {} : { opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-12">
                                <motion.div
                                    className="rounded-2xl overflow-hidden shadow-lg h-48 bg-muted"
                                    whileHover={reduceMotion ? {} : { scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={steps[0].image}
                                        alt="Step 1"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </motion.div>
                                <motion.div
                                    className="rounded-2xl overflow-hidden shadow-lg h-64 bg-muted"
                                    whileHover={reduceMotion ? {} : { scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={steps[1].image}
                                        alt="Step 2"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </motion.div>
                            </div>
                            <div className="space-y-4">
                                <motion.div
                                    className="rounded-2xl overflow-hidden shadow-lg h-64 bg-muted"
                                    whileHover={reduceMotion ? {} : { scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={steps[2].image}
                                        alt="Step 3"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </motion.div>
                                <motion.div
                                    className="rounded-2xl p-6 bg-primary text-primary-foreground flex items-center justify-center text-center"
                                    initial={reduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    whileHover={reduceMotion ? {} : { scale: 1.05 }}
                                >
                                    <p className="font-bold text-xl">{t("HOW_IT_WORKS.READY_BOX")}</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
