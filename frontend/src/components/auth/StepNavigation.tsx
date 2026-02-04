import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { shouldReduceMotion } from "@/lib/animations";
import { useTranslation } from "react-i18next";

interface Props {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  canProceed,
  onNext,
  onBack,
  isSubmitting = false,
}: Props) {
  const isLastStep = currentStep === totalSteps - 1;
  const reduceMotion = shouldReduceMotion();
  const { t } = useTranslation();

  return (
    <motion.div
      className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 border-t border-border pt-6"
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <AnimatedButton
        variant="ghost"
        size="lg"
        onClick={onBack}
        disabled={currentStep === 0}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        className="order-2 sm:order-1"
      >
        {t('AUTH.REGISTER_INSTITUTION.NAVIGATION.BACK')}
      </AnimatedButton>

      <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
        <motion.span
          className="text-sm text-muted-foreground"
          key={currentStep}
          initial={reduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {t('AUTH.REGISTER_INSTITUTION.LAYOUT.PROGRESS_LABEL', { current: currentStep + 1, total: totalSteps })}
        </motion.span>

        <AnimatedButton
          size="lg"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          isLoading={isSubmitting}
          rightIcon={
            isLastStep ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )
          }
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? t('AUTH.REGISTER_INSTITUTION.NAVIGATION.SUBMITTING')
            : isLastStep
              ? t('AUTH.REGISTER_INSTITUTION.NAVIGATION.SUBMIT')
              : t('AUTH.REGISTER_INSTITUTION.NAVIGATION.NEXT')
          }
        </AnimatedButton>
      </div>
    </motion.div>
  );
}

