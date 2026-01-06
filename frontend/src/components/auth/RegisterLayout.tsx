import type { ReactNode } from "react";
import { Stepper } from "./stepper/Stepper";
import type { Step } from "./stepper/Stepper";
import registerBgImage from "@/assets/registerBgImage.webp";

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
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[44%_56%]">
      {/* LEFT – STEPPER */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-secondary/10 to-accent/10" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

        {/* Optional background image (VERY subtle) */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
          style={{ backgroundImage: `url(${registerBgImage})` }}
        />

        {/* Content */}
        <div className="relative z-10 px-14 py-16">
          <h1 className="text-3xl font-bold mb-3">Open your account</h1>
          <p className="text-muted-foreground mb-14 max-w-sm">
            Follow the steps to securely complete your registration.
          </p>

          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="relative z-10 px-14 pb-10 text-xs text-muted-foreground">
          Secure • Verified • Trusted platform
        </div>
      </aside>

      {/* RIGHT – FORM */}
      <main className="flex items-center justify-center bg-background px-6 py-10 lg:px-16">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl bg-card border border-border p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

