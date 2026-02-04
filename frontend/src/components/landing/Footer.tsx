import { Link } from "react-router";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem, shouldReduceMotion } from "@/lib/animations";
import Logo from "@/assets/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    return (
        <footer className="bg-background border-t">
            {/* CTA Section */}
            <motion.div
                className="bg-primary py-20"
                initial={reduceMotion ? {} : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h2
                        className="text-3xl font-bold font-spline tracking-tight text-primary-foreground sm:text-4xl mb-6"
                        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        {t("FOOTER.CTA.TITLE")}
                    </motion.h2>
                    <motion.p
                        className="mx-auto max-w-2xl text-lg text-primary-foreground/90 mb-10"
                        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {t("FOOTER.CTA.SUBTITLE")}
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row justify-center gap-4"
                        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold" asChild>
                            <Link to="/register/worker">{t("FOOTER.CTA.WORKER_BTN")}</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground dark:hover:bg-primary-foreground hover:text-primary transition-colors" asChild>
                            <Link to="/register/institution">{t("FOOTER.CTA.INSTITUTION_BTN")}</Link>
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Footer Links */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                    variants={reduceMotion ? {} : staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {/* Brand */}
                    <motion.div className="space-y-4" variants={reduceMotion ? {} : fadeUpItem}>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Logo />
                            </div>
                            <span className="font-bold text-lg">{t("BRAND.NAME")}</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                            {t("BRAND.TAGLINE")}
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[Twitter, Facebook, Linkedin, Instagram].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    whileHover={reduceMotion ? {} : { scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Icon className="h-5 w-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Platform */}
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <h4 className="font-semibold font-spline mb-6">{t("FOOTER.PLATFORM")}</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t("NAV.HOW_IT_WORKS")}</a></li>
                            <li><a href="#features" className="hover:text-foreground transition-colors">{t("NAV.FEATURES")}</a></li>
                        </ul>
                    </motion.div>

                    {/* Resources */}
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <h4 className="font-semibold font-spline mb-6">{t("FOOTER.RESOURCES")}</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Case Studies</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div variants={reduceMotion ? {} : fadeUpItem}>
                        <h4 className="font-semibold font-spline mb-6">{t("FOOTER.LEGAL")}</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                        </ul>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="mt-16 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
                    initial={reduceMotion ? {} : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <p>© {currentYear} {t("BRAND.NAME")} Inc. {t("FOOTER.RIGHTS")}</p>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
