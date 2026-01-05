import {
  workerAccountSchema,
  workerPersonalSchema,
  workerProfessionalSchema,
  workerExperienceSchema,
  workerDocumentsSchema,
} from "./workerRegister.schema";

import type { WorkerRegisterData } from "./workerRegister.store";

export function isWorkerStepValid(
  step: number,
  data: WorkerRegisterData
): boolean {
  switch (step) {
    case 0:
      return workerAccountSchema.omit({ confirmPassword: true }).safeParse({
        email: data.email,
        password: data.password,
      }).success;

    case 1:
      return workerPersonalSchema.safeParse(data).success;

    case 2:
      return workerProfessionalSchema.safeParse(data).success;

    case 3:
      return workerExperienceSchema.safeParse(data).success;

    case 4:
      return workerDocumentsSchema.safeParse(data).success;

    case 5:
      return true;

    default:
      return false;
  }
}
