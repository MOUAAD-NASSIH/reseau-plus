import {
  workerAccountSchema,
  workerPersonalSchema,
  workerProfessionalSchema,
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
      // Combined Personal + Professional validation
      return (
        workerPersonalSchema.safeParse(data).success &&
        workerProfessionalSchema.safeParse(data).success
      );

    case 2:
      return workerTermsSchema.safeParse({ termsAccepted: data.termsAccepted })
        .success;

    default:
      return false;
  }
}
