import {
  institutionAccountSchema,
  institutionInfoSchema,
} from "./institutionRegister.schema";
import type { InstitutionRegisterData } from "./institutionRegister.store";

export function isInstitutionStepValid(
  step: number,
  data: InstitutionRegisterData
) {
  switch (step) {
    case 0:
      return institutionAccountSchema.safeParse({
        email: data.email,
        password: data.password,
        confirmPassword: data.password, // dummy match
      }).success;

    case 1:
      return institutionInfoSchema.safeParse(data).success;

    case 2:
      return true;

    default:
      return false;
  }
}
