import RegisterLayout from "@/components/auth/RegisterLayout";
import StepNavigation from "@/components/auth/StepNavigation";
import { useRegisterStepper } from "@/components/auth/useRegisterStepper";

import { institutionSteps } from "@/components/institution/register/institutionRegister.steps";
import { isInstitutionStepValid } from "@/components/institution/register/institutionRegister.validation";
import { useInstitutionRegisterStore } from "@/components/institution/register/institutionRegister.store";

import StepAccount from "@/components/institution/register/steps/StepAccount";
import StepInstitutionInfo from "@/components/institution/register/steps/StepInstitutionInfo";
import StepConfirm from "@/components/institution/register/steps/StepConfirm";

import { submitInstitutionRegistration } from "@/components/institution/register/submitInstitutionRegistration";
import { useNavigate } from "react-router";
import { useState } from "react";

const stepComponents = [StepAccount, StepInstitutionInfo, StepConfirm];

export default function InstitutionRegisterPage() {
  const { currentStep, next, back } = useRegisterStepper(
    institutionSteps.length
  );

  const StepComponent = stepComponents[currentStep];
  const { data, reset } = useInstitutionRegisterStore();
  console.log(data);

  const canProceed = isInstitutionStepValid(currentStep, data);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleNext() {
    if (currentStep < institutionSteps.length - 1) {
      next();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitInstitutionRegistration(data);
      localStorage.setItem("auth_token", res.data.data.token);
      reset();
      navigate("/institution"); // Navigate to institution dashboard
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RegisterLayout steps={institutionSteps} currentStep={currentStep}>
      <StepComponent />

      <StepNavigation
        currentStep={currentStep}
        totalSteps={institutionSteps.length}
        canProceed={canProceed && !isSubmitting}
        onNext={handleNext}
        onBack={back}
      />
    </RegisterLayout>
  );
}

