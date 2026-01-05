import { api } from "@/api/axios";
import type { InstitutionRegisterData } from "./institutionRegister.store";

export function submitInstitutionRegistration(data: InstitutionRegisterData) {
  return api.post("/auth/register/institution", data);
}
