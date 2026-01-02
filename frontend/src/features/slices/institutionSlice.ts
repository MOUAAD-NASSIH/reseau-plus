/**
 * Institution Slice
 * Redux state management for institution profiles
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { institutionService } from "../services/institutionService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    Institution,
    UpdateInstitutionInput,
    InstitutionFilters,
} from "@/types/auth.types";

// -------------------- STATE INTERFACE --------------------
export interface InstitutionState {
    institutions: Institution[];
    profile: Institution | null;
    selectedInstitution: Institution | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: InstitutionState = {
    institutions: [],
    profile: null,
    selectedInstitution: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch current institution's profile
export const fetchInstitutionProfile = createAsyncThunk<
    Institution,
    void,
    { rejectValue: string }
>("institutions/fetchProfile", async (_, thunkAPI) => {
    try {
        const response = await institutionService.getProfile();
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update institution profile
export const updateInstitutionProfile = createAsyncThunk<
    Institution,
    UpdateInstitutionInput,
    { rejectValue: string }
>("institutions/updateProfile", async (data, thunkAPI) => {
    try {
        const response = await institutionService.updateProfile(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch institution by ID
export const fetchInstitutionById = createAsyncThunk<
    Institution,
    number,
    { rejectValue: string }
>("institutions/fetchById", async (id, thunkAPI) => {
    try {
        const response = await institutionService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch all institutions (admin)
export const fetchInstitutions = createAsyncThunk<
    { institutions: Institution[]; pagination?: PaginationMeta },
    InstitutionFilters | undefined,
    { rejectValue: string }
>("institutions/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await institutionService.getAll(filters);
        return {
            institutions: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const institutionSlice = createSlice({
    name: "institutions",
    initialState,
    reducers: {
        clearSelectedInstitution(state) {
            state.selectedInstitution = null;
        },
        clearInstitutionError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH PROFILE ----------
            .addCase(fetchInstitutionProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInstitutionProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchInstitutionProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch profile";
            })

            // ---------- UPDATE PROFILE ----------
            .addCase(updateInstitutionProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateInstitutionProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(updateInstitutionProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update profile";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchInstitutionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInstitutionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedInstitution = action.payload;
            })
            .addCase(fetchInstitutionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch institution";
            })

            // ---------- FETCH ALL ----------
            .addCase(fetchInstitutions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInstitutions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.institutions = action.payload.institutions;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchInstitutions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch institutions";
            });
    },
});

export const { clearSelectedInstitution, clearInstitutionError } = institutionSlice.actions;
export default institutionSlice.reducer;
