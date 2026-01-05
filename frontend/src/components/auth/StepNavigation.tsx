import { Button } from "@/components/ui/button";

interface Props {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  canProceed,
  onNext,
  onBack,
}: Props) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
      <Button variant="ghost" onClick={onBack} disabled={currentStep === 0}>
        Back
      </Button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} / {totalSteps}
        </span>

        <Button onClick={onNext} disabled={!canProceed}>
          {isLastStep ? "Confirm & Submit" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
