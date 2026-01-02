/**
 * Application Slice
 * Redux state management for mission applications
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { applicationService } from "../services/applicationService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    MissionApplication,
    CreateApplicationInput,
    ApplicationFilters,
    ApplicationStatus,
} from "@/types/application.types";

// -------------------- STATE INTERFACE --------------------
export interface ApplicationState {
    applications: MissionApplication[];
    myApplications: MissionApplication[];
    missionApplications: MissionApplication[];
    selectedApplication: MissionApplication | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: ApplicationState = {
    applications: [],
    myApplications: [],
    missionApplications: [],
    selectedApplication: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Apply to a mission
export const applyToMission = createAsyncThunk<
    MissionApplication,
    CreateApplicationInput,
    { rejectValue: string }
>("applications/apply", async (data, thunkAPI) => {
    try {
        const response = await applicationService.apply(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch worker's own applications
export const fetchMyApplications = createAsyncThunk<
    { applications: MissionApplication[]; pagination?: PaginationMeta },
    ApplicationFilters | undefined,
    { rejectValue: string }
>("applications/fetchMy", async (filters, thunkAPI) => {
    try {
        const response = await applicationService.getMyApplications(filters);
        return {
            applications: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch applications for a specific mission
export const fetchMissionApplications = createAsyncThunk<
    { applications: MissionApplication[]; pagination?: PaginationMeta },
    { missionId: number; filters?: ApplicationFilters },
    { rejectValue: string }
>("applications/fetchByMission", async ({ missionId, filters }, thunkAPI) => {
    try {
        const response = await applicationService.getMissionApplications(missionId, filters);
        return {
            applications: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch application by ID
export const fetchApplicationById = createAsyncThunk<
    MissionApplication,
    number,
    { rejectValue: string }
>("applications/fetchById", async (id, thunkAPI) => {
    try {
        const response = await applicationService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Accept application
export const acceptApplication = createAsyncThunk<
    MissionApplication,
    number,
    { rejectValue: string }
>("applications/accept", async (id, thunkAPI) => {
    try {
        const response = await applicationService.accept(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Reject application
export const rejectApplication = createAsyncThunk<
    MissionApplication,
    number,
    { rejectValue: string }
>("applications/reject", async (id, thunkAPI) => {
    try {
        const response = await applicationService.reject(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Withdraw application
export const withdrawApplication = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("applications/withdraw", async (id, thunkAPI) => {
    try {
        await applicationService.withdraw(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update application status (generic)
export const updateApplicationStatus = createAsyncThunk<
    MissionApplication,
    { id: number; status: ApplicationStatus },
    { rejectValue: string }
>("applications/updateStatus", async ({ id, status }, thunkAPI) => {
    try {
        const response = await applicationService.updateStatus(id, status);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const applicationSlice = createSlice({
    name: "applications",
    initialState,
    reducers: {
        clearSelectedApplication(state) {
            state.selectedApplication = null;
        },
        clearApplicationError(state) {
            state.error = null;
        },
        clearMissionApplications(state) {
            state.missionApplications = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- APPLY ----------
            .addCase(applyToMission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyToMission.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myApplications.push(action.payload);
            })
            .addCase(applyToMission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to submit application";
            })

            // ---------- FETCH MY APPLICATIONS ----------
            .addCase(fetchMyApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myApplications = action.payload.applications;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMyApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch your applications";
            })

            // ---------- FETCH MISSION APPLICATIONS ----------
            .addCase(fetchMissionApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMissionApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.missionApplications = action.payload.applications;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMissionApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch mission applications";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchApplicationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedApplication = action.payload;
            })
            .addCase(fetchApplicationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch application";
            })

            // ---------- ACCEPT ----------
            .addCase(acceptApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(acceptApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.missionApplications.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.missionApplications[index] = action.payload;
                }
                if (state.selectedApplication?.id === action.payload.id) {
                    state.selectedApplication = action.payload;
                }
            })
            .addCase(acceptApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to accept application";
            })

            // ---------- REJECT ----------
            .addCase(rejectApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(rejectApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.missionApplications.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.missionApplications[index] = action.payload;
                }
                if (state.selectedApplication?.id === action.payload.id) {
                    state.selectedApplication = action.payload;
                }
            })
            .addCase(rejectApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to reject application";
            })

            // ---------- WITHDRAW ----------
            .addCase(withdrawApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(withdrawApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myApplications = state.myApplications.filter(a => a.id !== action.payload);
                if (state.selectedApplication?.id === action.payload) {
                    state.selectedApplication = null;
                }
            })
            .addCase(withdrawApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to withdraw application";
            })

            // ---------- UPDATE STATUS ----------
            .addCase(updateApplicationStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.missionApplications.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.missionApplications[index] = action.payload;
                }
                const myIndex = state.myApplications.findIndex(a => a.id === action.payload.id);
                if (myIndex !== -1) {
                    state.myApplications[myIndex] = action.payload;
                }
                if (state.selectedApplication?.id === action.payload.id) {
                    state.selectedApplication = action.payload;
                }
            })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update application status";
            });
    },
});

export const { clearSelectedApplication, clearApplicationError, clearMissionApplications } = applicationSlice.actions;
export default applicationSlice.reducer;
