/**
 * Worker Slice
 * Redux state management for worker profiles and documents
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { workerService } from "../services/workerService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    Worker,
    WorkerDocument,
    WorkerExperience,
    WorkerAvailability,
    UpdateWorkerInput,
    WorkerFilters,
    DocumentType,
    WorkerExperienceInput,
} from "@/types/auth.types";

// -------------------- STATE INTERFACE --------------------
export interface WorkerState {
    workers: Worker[];
    profile: Worker | null;
    selectedWorker: Worker | null;
    documents: WorkerDocument[];
    experiences: WorkerExperience[];
    availabilities: WorkerAvailability[];
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: WorkerState = {
    workers: [],
    profile: null,
    selectedWorker: null,
    documents: [],
    experiences: [],
    availabilities: [],
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch current worker's profile
export const fetchWorkerProfile = createAsyncThunk<
    Worker,
    void,
    { rejectValue: string }
>("workers/fetchProfile", async (_, thunkAPI) => {
    try {
        const response = await workerService.getProfile();
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update worker profile
export const updateWorkerProfile = createAsyncThunk<
    Worker,
    UpdateWorkerInput,
    { rejectValue: string }
>("workers/updateProfile", async (data, thunkAPI) => {
    try {
        const response = await workerService.updateProfile(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch worker by ID
export const fetchWorkerById = createAsyncThunk<
    Worker,
    number,
    { rejectValue: string }
>("workers/fetchById", async (id, thunkAPI) => {
    try {
        const response = await workerService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch all workers (admin)
export const fetchWorkers = createAsyncThunk<
    { workers: Worker[]; pagination?: PaginationMeta },
    WorkerFilters | undefined,
    { rejectValue: string }
>("workers/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await workerService.getAll(filters);
        return {
            workers: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- DOCUMENT THUNKS --------------------

// Fetch worker's documents
export const fetchWorkerDocuments = createAsyncThunk<
    WorkerDocument[],
    void,
    { rejectValue: string }
>("workers/fetchDocuments", async (_, thunkAPI) => {
    try {
        const response = await workerService.getDocuments();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Upload document
export const uploadWorkerDocument = createAsyncThunk<
    WorkerDocument,
    { type: DocumentType; file: File },
    { rejectValue: string }
>("workers/uploadDocument", async ({ type, file }, thunkAPI) => {
    try {
        const response = await workerService.uploadDocument(type, file);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- EXPERIENCE THUNKS --------------------

// Fetch worker's experiences
export const fetchWorkerExperiences = createAsyncThunk<
    WorkerExperience[],
    void,
    { rejectValue: string }
>("workers/fetchExperiences", async (_, thunkAPI) => {
    try {
        const response = await workerService.getExperiences();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Add experience
export const addWorkerExperience = createAsyncThunk<
    WorkerExperience,
    WorkerExperienceInput,
    { rejectValue: string }
>("workers/addExperience", async (data, thunkAPI) => {
    try {
        const response = await workerService.addExperience(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update experience
export const updateWorkerExperience = createAsyncThunk<
    WorkerExperience,
    { id: number; data: Partial<WorkerExperienceInput> },
    { rejectValue: string }
>("workers/updateExperience", async ({ id, data }, thunkAPI) => {
    try {
        const response = await workerService.updateExperience(id, data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Delete experience
export const deleteWorkerExperience = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("workers/deleteExperience", async (id, thunkAPI) => {
    try {
        await workerService.deleteExperience(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- AVAILABILITY THUNKS --------------------

// Fetch worker's availabilities
export const fetchWorkerAvailabilities = createAsyncThunk<
    WorkerAvailability[],
    void,
    { rejectValue: string }
>("workers/fetchAvailabilities", async (_, thunkAPI) => {
    try {
        const response = await workerService.getAvailabilities();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Add availability
export const addWorkerAvailability = createAsyncThunk<
    WorkerAvailability,
    { startDate: string; endDate: string; isRecurring?: boolean },
    { rejectValue: string }
>("workers/addAvailability", async (data, thunkAPI) => {
    try {
        const response = await workerService.addAvailability(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Delete availability
export const deleteWorkerAvailability = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("workers/deleteAvailability", async (id, thunkAPI) => {
    try {
        await workerService.deleteAvailability(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const workerSlice = createSlice({
    name: "workers",
    initialState,
    reducers: {
        clearSelectedWorker(state) {
            state.selectedWorker = null;
        },
        clearWorkerError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH PROFILE ----------
            .addCase(fetchWorkerProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchWorkerProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch profile";
            })

            // ---------- UPDATE PROFILE ----------
            .addCase(updateWorkerProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateWorkerProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(updateWorkerProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update profile";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchWorkerById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedWorker = action.payload;
            })
            .addCase(fetchWorkerById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch worker";
            })

            // ---------- FETCH ALL ----------
            .addCase(fetchWorkers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.workers = action.payload.workers;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchWorkers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch workers";
            })

            // ---------- DOCUMENTS ----------
            .addCase(fetchWorkerDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents = action.payload;
            })
            .addCase(fetchWorkerDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch documents";
            })

            .addCase(uploadWorkerDocument.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(uploadWorkerDocument.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents.push(action.payload);
            })
            .addCase(uploadWorkerDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to upload document";
            })

            // ---------- EXPERIENCES ----------
            .addCase(fetchWorkerExperiences.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerExperiences.fulfilled, (state, action) => {
                state.isLoading = false;
                state.experiences = action.payload;
            })
            .addCase(fetchWorkerExperiences.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch experiences";
            })

            .addCase(addWorkerExperience.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addWorkerExperience.fulfilled, (state, action) => {
                state.isLoading = false;
                state.experiences.push(action.payload);
            })
            .addCase(addWorkerExperience.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to add experience";
            })

            .addCase(updateWorkerExperience.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateWorkerExperience.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.experiences.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.experiences[index] = action.payload;
                }
            })
            .addCase(updateWorkerExperience.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update experience";
            })

            .addCase(deleteWorkerExperience.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteWorkerExperience.fulfilled, (state, action) => {
                state.isLoading = false;
                state.experiences = state.experiences.filter(e => e.id !== action.payload);
            })
            .addCase(deleteWorkerExperience.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete experience";
            })

            // ---------- AVAILABILITIES ----------
            .addCase(fetchWorkerAvailabilities.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerAvailabilities.fulfilled, (state, action) => {
                state.isLoading = false;
                state.availabilities = action.payload;
            })
            .addCase(fetchWorkerAvailabilities.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch availabilities";
            })

            .addCase(addWorkerAvailability.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addWorkerAvailability.fulfilled, (state, action) => {
                state.isLoading = false;
                state.availabilities.push(action.payload);
            })
            .addCase(addWorkerAvailability.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to add availability";
            })

            .addCase(deleteWorkerAvailability.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteWorkerAvailability.fulfilled, (state, action) => {
                state.isLoading = false;
                state.availabilities = state.availabilities.filter(a => a.id !== action.payload);
            })
            .addCase(deleteWorkerAvailability.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete availability";
            });
    },
});

export const { clearSelectedWorker, clearWorkerError } = workerSlice.actions;
export default workerSlice.reducer;
