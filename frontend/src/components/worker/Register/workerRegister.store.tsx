import { create } from "zustand";

export interface WorkerRegisterData {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    gender?: "MALE" | "FEMALE";
    city?: string;
    zipCode?: string;
    specialityId?: number;
    experienceYears?: number;
    bio?: string;
    domainIds?: number[];
    termsAccepted?: boolean;
}

interface WorkerRegisterStore {
    data: WorkerRegisterData;
    updateData: (partial: Partial<WorkerRegisterData>) => void;
    reset: () => void;
}

export const useWorkerRegisterStore = create<WorkerRegisterStore>((set) => ({
    data: {},
    updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),
    reset: () => set({ data: {} }),
}));
