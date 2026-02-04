import {
  workerAccountSchema,
  workerPersonalSchema,
  workerProfessionalSchema,
  workerExperienceSchema,
  workerDocumentsSchema,
  workerTermsSchema,
} from "./workerRegister.schema";

import type { WorkerRegisterData } from "./workerRegister.store";

export function isWorkerStepValid(
  step: number,
  data: WorkerRegisterData
): boolean {
  switch (step) {
    case 0:
      return workerAccountSchema.safeParse({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }).success;

    case 1:
      return workerPersonalSchema.safeParse(data).success;

    case 2:
      return workerProfessionalSchema.safeParse(data).success;

    case 3:
      // Experiences are optional
      return workerExperienceSchema.safeParse(data).success;

    case 4:
      return workerDocumentsSchema.safeParse(data).success;

    case 5:
      return workerTermsSchema.safeParse({ termsAccepted: data.termsAccepted })
        .success;

    default:
      return false;
  }
}
