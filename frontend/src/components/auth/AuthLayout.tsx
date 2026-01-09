import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageVariants, staggerContainer, shouldReduceMotion } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    showBranding?: boolean;
    brandingTitle?: string;
    brandingSubtitle?: string;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    showBranding = true,
    brandingTitle,
    brandingSubtitle,
}: AuthLayoutProps) {
    const reduceMotion = shouldReduceMotion();
    const { t } = useTranslation();

    const displayBrandingTitle = brandingTitle || t('AUTH.LAYOUT.BRANDING_TITLE');
    const displayBrandingSubtitle = brandingSubtitle || t('AUTH.LAYOUT.BRANDING_SUBTITLE');

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Branding Panel*/}
            {showBranding && (
                <motion.aside
                    className="hidden lg:flex relative overflow-hidden bg-zinc-900"
                    initial={reduceMotion ? {} : { opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                            alt="Team collaboration"
                            className="w-full h-full object-cover opacity-50 mix-blend-overlay grayscale"
                        />
                        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-12 py-16 h-full text-white">

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            <motion.h1
                                className="text-4xl font-bold mb-6 leading-tight"
                                variants={reduceMotion ? {} : pageVariants}
                            >
                                {displayBrandingTitle}
                            </motion.h1>

                            {/* Social Proof / Avaatars */}
                            <motion.div
                                className="flex items-center gap-4 mb-8"
                                variants={reduceMotion ? {} : pageVariants}
                            >
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-background overflow-hidden">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                                                alt="User"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-white tracking-wide uppercase">
                                    {t('AUTH.LAYOUT.SOCIAL_PROOF')}
                                </div>
                            </motion.div>

                            <motion.p
                                className="text-lg text-white/90 max-w-md leading-relaxed font-medium"
                                variants={reduceMotion ? {} : pageVariants}
                            >
                                {displayBrandingSubtitle}
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Footer text */}
                    <div className="absolute bottom-8 left-12 text-xs text-white/70 font-medium tracking-wide uppercase">
                        {t('AUTH.LAYOUT.FOOTER')}
                    </div>
                </motion.aside>
            )}

            {/* Form Panel */}
            <main
                className={cn(
                    "flex flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12 lg:px-16 relative",
                    !showBranding && "col-span-full"
                )}
            >
                {/* Actions removed as they are present in Global Header */}
                <motion.div
                    className="w-full max-w-md lg:max-w-lg"
                    variants={reduceMotion ? {} : pageVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="space-y-2 mb-8">
                        <motion.h2
                            className="text-2xl sm:text-3xl font-bold tracking-tight"
                            initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {title}
                        </motion.h2>
                        {subtitle && (
                            <motion.p
                                className="text-sm sm:text-base text-muted-foreground"
                                initial={reduceMotion ? {} : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                    {children}
                </motion.div>
            </main>
        </div>
    );
}

export default AuthLayout;
