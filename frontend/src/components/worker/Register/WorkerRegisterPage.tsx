import RegisterLayout from "../../auth/RegisterLayout";
import StepNavigation from "../../auth/StepNavigation";
import RegistrationSuccess from "../../auth/RegistrationSuccess";
import { useRegisterStepper } from "../../auth/useRegisterStepper";

import { workerSteps } from "./workerRegister.steps";
import { isWorkerStepValid } from "./workerRegister.validation";
import { useWorkerRegisterStore } from "./workerRegister.store";

import StepAccount from "./StepAccount";
import StepPersonal from "./steps/StepPersonal";
import StepProfessional from "./steps/StepProfessional";
import StepExperience from "./steps/StepExperience";
import StepDocuments from "./steps/StepDocuments";
import StepConfirm from "./steps/StepConfirm";

import { submitWorkerRegistration } from "./submitWorkerRegistration";

import { useAppDispatch } from "@/features/hooks";
import { getMe } from "@/features/slices/authSlice";
import { useState } from "react";
import { showErrorToast } from "@/lib/toast";
import axios from "axios";

const stepComponents = [
  StepAccount,
  StepPersonal,
  StepProfessional,
  StepExperience,
  StepDocuments,
  StepConfirm,
];

export default function WorkerRegisterPage() {
  const { currentStep, next, back } = useRegisterStepper(workerSteps.length);

  const { data, reset } = useWorkerRegisterStore();
  const StepComponent = stepComponents[currentStep];

  const canProceed = isWorkerStepValid(currentStep, data);

  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  async function handleNext() {
    // Clear any previous backend error
    setBackendError(null);

    // Validate current step before proceeding
    if (!canProceed) {
      return;
    }

    if (currentStep < workerSteps.length - 1) {
      next();
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitWorkerRegistration(data);

      localStorage.setItem("auth_token", response.data.data.token);

      dispatch(getMe());
      reset();

      // Show success animation instead of navigating immediately
      setIsRegistrationComplete(true);
    } catch (error) {
      console.error("Worker registration failed:", error);

      // Handle backend validation errors
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setBackendError(error.response.data.message);
      }

      showErrorToast(
        error,
        "Registration failed. Please review your information and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show success screen after registration
  if (isRegistrationComplete) {
    return (
      <RegisterLayout steps={workerSteps} currentStep={workerSteps.length - 1}>
        <RegistrationSuccess
          title="Welcome to the Network! 🎉"
          message="Your worker profile has been created successfully. You can now browse available missions and start applying."
          redirectPath="/worker"
          redirectLabel="Go to Dashboard"
        />
      </RegisterLayout>
    );
  }

  return (
    <RegisterLayout steps={workerSteps} currentStep={currentStep}>
      <StepComponent />

      {/* Display backend validation errors */}
      {backendError && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{backendError}</p>
        </div>
      )}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={workerSteps.length}
        canProceed={canProceed && !isSubmitting}
        onNext={handleNext}
        onBack={back}
      />
    </RegisterLayout>
  );
}
