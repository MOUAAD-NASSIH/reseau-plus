import { useState } from "react";

export function useRegisterStepper(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const back = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const goTo = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    next,
    back,
    goTo,
  };
}

