import RegisterLayout from "@/components/auth/RegisterLayout";
import StepNavigation from "@/components/auth/StepNavigation";
import { useRegisterStepper } from "@/components/auth/useRegisterStepper";

import { institutionSteps } from "@/components/institution/institutionRegister.steps";
import { isInstitutionStepValid } from "@/components/institution/institutionRegister.validation";
import { useInstitutionRegisterStore } from "@/components/institution/institutionRegister.store";

import StepAccount from "@/components/institution/steps/StepAccount";
import StepInstitutionInfo from "@/components/institution/steps/StepInstitutionInfo";
import StepConfirm from "@/components/institution/steps/StepConfirm";

import { submitInstitutionRegistration } from "@/components/institution/submitInstitutionRegistration";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAppDispatch } from "@/features/hooks";
import { getMe } from "@/features/slices/authSlice";

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
  const dispatch = useAppDispatch();
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
      dispatch(getMe());
      reset();
      navigate("/dashboard");
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

