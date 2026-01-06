import { create } from "zustand";

export interface InstitutionRegisterData {
    email?: string;
    password?: string;
    institutionName?: string;
    address?: string;
    city?: string;
}

interface InstitutionRegisterStore {
    data: InstitutionRegisterData;
    updateData: (partial: Partial<InstitutionRegisterData>) => void;
    reset: () => void;
}

export const useInstitutionRegisterStore = create<InstitutionRegisterStore>(
    (set) => ({
        data: {},
        updateData: (partial) =>
            set((state) => ({ data: { ...state.data, ...partial } })),
        reset: () => set({ data: {} }),
    })
);

