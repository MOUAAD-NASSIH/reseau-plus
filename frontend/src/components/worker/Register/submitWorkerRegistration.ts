import { axiosInstance } from "@/lib/axios";
import type { WorkerRegisterData } from "./workerRegister.store";

export async function submitWorkerRegistration(data: WorkerRegisterData) {
  const formData = new FormData();

  formData.append("email", data.email!);
  formData.append("password", data.password!);
  formData.append("firstName", data.firstName!);
  formData.append("lastName", data.lastName!);
  formData.append("specialityId", String(data.specialityId!));

  if (data.city) formData.append("city", data.city);
  if (data.zipCode) formData.append("zipCode", data.zipCode);
  if (data.gender) formData.append("gender", data.gender);
  if (data.bio) formData.append("bio", data.bio);

  if (data.experienceYears !== undefined) {
    formData.append("experienceYears", String(data.experienceYears));
  }

  if (data.birthDate) {
    formData.append("birthDate", data.birthDate.toISOString());
  }

  formData.append("domainIds", JSON.stringify(data.domainIds ?? []));

  return axiosInstance.post("/auth/register/worker", formData);
}
