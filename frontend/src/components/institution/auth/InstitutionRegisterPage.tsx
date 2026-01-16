import RegisterLayout from "../../auth/RegisterLayout";
import StepNavigation from "../../auth/StepNavigation";
import RegistrationSuccess from "../../auth/RegistrationSuccess";
import { useRegisterStepper } from "../../auth/useRegisterStepper";

import { institutionSteps } from "./institutionRegister.steps";
import { isInstitutionStepValid } from "./institutionRegister.validation";
import { useInstitutionRegisterStore } from "./institutionRegister.store";

import StepAccount from "./steps/StepAccount";
import StepInstitutionInfo from "./steps/StepInstitutionInfo";
import StepConfirm from "./steps/StepConfirm";

import { submitInstitutionRegistration } from "./submitInstitutionRegistration";
import { useState } from "react";
import { useAppDispatch } from "@/features/hooks";
import { getMe } from "@/features/slices/authSlice";
import { showErrorToast } from "@/lib/toast";
import axios from "axios";

const stepComponents = [StepAccount, StepInstitutionInfo, StepConfirm];

export default function InstitutionRegisterPage() {
  const { currentStep, next, back } = useRegisterStepper(
    institutionSteps.length
  );

  const StepComponent = stepComponents[currentStep];
  const { data, reset } = useInstitutionRegisterStore();

  const canProceed = isInstitutionStepValid(currentStep, data);

  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  async function handleNext() {
    setBackendError(null);

    if (!canProceed) {
      return;
    }

    if (currentStep < institutionSteps.length - 1) {
      next();
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await submitInstitutionRegistration(data);

      localStorage.setItem("auth_token", res.data.data.token);

      dispatch(getMe());
      reset();

      // Show success animation instead of navigating immediately
      setIsRegistrationComplete(true);
    } catch (error) {
      console.error("Institution registration failed:", error);

      // Handle backend validation errors
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setBackendError(error.response.data.message);
      }

      showErrorToast(
        error,
        "Registration failed. Please check your information and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show success screen after registration
  if (isRegistrationComplete) {
    return (
      <RegisterLayout steps={institutionSteps} currentStep={institutionSteps.length - 1}>
        <RegistrationSuccess
          title="Institution Registered! 🎉"
          message="Your institution account has been created successfully. You can now post missions and find qualified workers."
          redirectPath="/institution"
          redirectLabel="Go to Dashboard"
        />
      </RegisterLayout>
    );
  }

  return (
    <RegisterLayout steps={institutionSteps} currentStep={currentStep}>
      <StepComponent />

      {/* Display backend validation errors */}
      {backendError && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{backendError}</p>
        </div>
      )}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={institutionSteps.length}
        canProceed={canProceed}
        onNext={handleNext}
        onBack={back}
        isSubmitting={isSubmitting}
      />
    </RegisterLayout>
  );
}

