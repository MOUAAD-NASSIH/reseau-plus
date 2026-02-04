import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { shouldReduceMotion } from "@/lib/animations";
import Logo from "@/assets/Logo";

import registerBgImage from "@/assets/registerBgImage.webp";

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
}

export default function RegisterLayout({
  steps,
  currentStep,
  children,
}: Props) {
  const reduceMotion = shouldReduceMotion();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* LEFT PANEL: Image & Stepper */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-50 mix-blend-overlay grayscale"
            style={{ backgroundImage: `url(${registerBgImage})` }}
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
        </div>

        {/* Content Container (z-index > overlay) */}
        <div className="relative z-20 h-full flex flex-col justify-between">
          {/* Branding */}
          <Link to="/" className="flex items-center gap-3 w-fit">
            <Logo />
            <span className="font-bold text-xl tracking-tight">{t("BRAND.NAME")}</span>
          </Link>

          {/* Stepper Content */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight max-w-lg">
                {t('AUTH.REGISTER_INSTITUTION.LAYOUT.TITLE')}
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                {t('AUTH.REGISTER_INSTITUTION.LAYOUT.SUBTITLE')}
              </p>
            </div>

            {/* Vertical Stepper List */}
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex items-start gap-4 group">
                    <div className={`
                                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 font-semibold text-sm
                                    ${isActive ? 'bg-white text-black border-white scale-110 shadow-lg' : ''}
                                    ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                                    ${!isActive && !isCompleted ? 'border-white/30 text-white/50 bg-white/5' : ''}
                                `}>
                      {isCompleted ? <Check className="h-5 w-5" /> : index + 1}

                      {/* Vertical Line Connector */}
                      {index !== steps.length - 1 && (
                        <div className={`absolute top-10 w-0.5 h-10 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-white/20'}`} />
                      )}
                    </div>
                    <div className={`pt-2 transition-colors duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                      <h3 className="font-medium text-lg leading-none">{t(step.label)}</h3>
                      {isActive && step.description && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm text-white/70 mt-1"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/40">
            {t('AUTH.REGISTER_INSTITUTION.LAYOUT.COPYRIGHT_SECURE', {
              year: new Date().getFullYear(),
              brand: t("BRAND.NAME")
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex flex-col h-full overflow-y-auto relative bg-background">
        {/* Mobile Header (Visible only on mobile) */}


        {/* Mobile Progress Bar */}
        <div className="lg:hidden h-1 bg-muted w-full">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden mb-8">
              <h1 className="text-2xl font-bold">{t('AUTH.REGISTER_INSTITUTION.LAYOUT.CREATE_ACCOUNT')}</h1>
              <p className="text-muted-foreground">
                {t('AUTH.REGISTER_INSTITUTION.LAYOUT.PROGRESS_LABEL', {
                  current: currentStep + 1,
                  total: steps.length
                })}: {t(steps[currentStep].label)}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={reduceMotion ? {} : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? {} : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 text-center lg:hidden">
          <span className="text-sm text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
