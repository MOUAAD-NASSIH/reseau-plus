import { axiosInstance } from "@/lib/axios";
import type { InstitutionRegisterData } from "./institutionRegister.store";

export function submitInstitutionRegistration(data: InstitutionRegisterData) {
  return axiosInstance.post("/auth/register/institution", data);
}

