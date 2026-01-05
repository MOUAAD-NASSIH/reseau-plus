import { Check } from "lucide-react";

export interface Step {
  id: string;
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: Props) {
  return (
    <ol className="relative space-y-10">
      {/* Vertical line */}
      <div className="absolute left-4.5 top-0 h-full w-px bg-border" />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <li key={step.id} className="relative flex gap-6">
            {/* Circle */}
            <div
              className={[
                "z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                isCompleted &&
                "bg-primary text-primary-foreground border-primary",
                isActive &&
                "bg-background border-primary text-primary ring-4 ring-primary/20",
                !isCompleted &&
                !isActive &&
                "bg-muted text-muted-foreground border-border",
              ].join(" ")}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </div>

            {/* Label */}
            <div className="pt-1">
              <p
                className={[
                  "font-semibold",
                  isActive && "text-primary",
                  !isActive && "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </p>

              {isActive && (
                <p className="text-xs text-muted-foreground mt-1">
                  Step {index + 1} of {steps.length}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
