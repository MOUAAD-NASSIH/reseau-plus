/**
 * Domain Slice
 * Redux state management for domains and specialities
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { domainService } from "../services/domainService";
import type { PaginationMeta } from "@/types/api.types";
import type { Domain, Speciality, DomainFilters, SpecialityFilters } from "@/types/auth.types";

// -------------------- STATE INTERFACE --------------------
export interface DomainState {
    domains: Domain[];
    specialities: Speciality[];
    selectedDomain: Domain | null;
    selectedSpeciality: Speciality | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: DomainState = {
    domains: [],
    specialities: [],
    selectedDomain: null,
    selectedSpeciality: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch all domains
export const fetchDomains = createAsyncThunk<
    { domains: Domain[]; pagination?: PaginationMeta },
    DomainFilters | undefined,
    { rejectValue: string }
>("domains/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await domainService.getDomains(filters);
        return {
            domains: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch domain by ID
export const fetchDomainById = createAsyncThunk<
    Domain,
    number,
    { rejectValue: string }
>("domains/fetchById", async (id, thunkAPI) => {
    try {
        const response = await domainService.getDomainById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch all specialities
export const fetchSpecialities = createAsyncThunk<
    { specialities: Speciality[]; pagination?: PaginationMeta },
    SpecialityFilters | undefined,
    { rejectValue: string }
>("domains/fetchSpecialities", async (filters, thunkAPI) => {
    try {
        const response = await domainService.getSpecialities(filters);
        return {
            specialities: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch speciality by ID
export const fetchSpecialityById = createAsyncThunk<
    Speciality,
    number,
    { rejectValue: string }
>("domains/fetchSpecialityById", async (id, thunkAPI) => {
    try {
        const response = await domainService.getSpecialityById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const domainSlice = createSlice({
    name: "domains",
    initialState,
    reducers: {
        clearSelectedDomain(state) {
            state.selectedDomain = null;
        },
        clearSelectedSpeciality(state) {
            state.selectedSpeciality = null;
        },
        clearDomainError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH DOMAINS ----------
            .addCase(fetchDomains.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDomains.fulfilled, (state, action) => {
                state.isLoading = false;
                state.domains = action.payload.domains;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchDomains.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch domains";
            })

            // ---------- FETCH DOMAIN BY ID ----------
            .addCase(fetchDomainById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDomainById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedDomain = action.payload;
            })
            .addCase(fetchDomainById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch domain";
            })

            // ---------- FETCH SPECIALITIES ----------
            .addCase(fetchSpecialities.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSpecialities.fulfilled, (state, action) => {
                state.isLoading = false;
                state.specialities = action.payload.specialities;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchSpecialities.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch specialities";
            })

            // ---------- FETCH SPECIALITY BY ID ----------
            .addCase(fetchSpecialityById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSpecialityById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedSpeciality = action.payload;
            })
            .addCase(fetchSpecialityById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch speciality";
            });
    },
});

export const {
    clearSelectedDomain,
    clearSelectedSpeciality,
    clearDomainError,
} = domainSlice.actions;
export default domainSlice.reducer;
