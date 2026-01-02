/**
 * Mission Slice
 * Redux state management for missions
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { missionService } from "../services/missionService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    Mission,
    CreateMissionInput,
    UpdateMissionInput,
    MissionFilters,
} from "@/types/mission.types";

// -------------------- STATE INTERFACE --------------------
export interface MissionState {
    missions: Mission[];
    selectedMission: Mission | null;
    myMissions: Mission[];
    availableMissions: Mission[];
    recommendedMissions: Mission[];
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: MissionState = {
    missions: [],
    selectedMission: null,
    myMissions: [],
    availableMissions: [],
    recommendedMissions: [],
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch all missions
export const fetchMissions = createAsyncThunk<
    { missions: Mission[]; pagination?: PaginationMeta },
    MissionFilters | undefined,
    { rejectValue: string }
>("missions/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await missionService.getAll(filters);
        return {
            missions: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch mission by ID
export const fetchMissionById = createAsyncThunk<
    Mission,
    number,
    { rejectValue: string }
>("missions/fetchById", async (id, thunkAPI) => {
    try {
        const response = await missionService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Create mission
export const createMission = createAsyncThunk<
    Mission,
    CreateMissionInput,
    { rejectValue: string }
>("missions/create", async (data, thunkAPI) => {
    try {
        const response = await missionService.create(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update mission
export const updateMission = createAsyncThunk<
    Mission,
    { id: number; data: UpdateMissionInput },
    { rejectValue: string }
>("missions/update", async ({ id, data }, thunkAPI) => {
    try {
        const response = await missionService.update(id, data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Delete mission
export const deleteMission = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("missions/delete", async (id, thunkAPI) => {
    try {
        await missionService.delete(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch institution's own missions
export const fetchMyMissions = createAsyncThunk<
    { missions: Mission[]; pagination?: PaginationMeta },
    MissionFilters | undefined,
    { rejectValue: string }
>("missions/fetchMy", async (filters, thunkAPI) => {
    try {
        const response = await missionService.getMyMissions(filters);
        return {
            missions: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch available missions for workers
export const fetchAvailableMissions = createAsyncThunk<
    { missions: Mission[]; pagination?: PaginationMeta },
    MissionFilters | undefined,
    { rejectValue: string }
>("missions/fetchAvailable", async (filters, thunkAPI) => {
    try {
        const response = await missionService.getAvailable(filters);
        return {
            missions: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch recommended missions for workers
export const fetchRecommendedMissions = createAsyncThunk<
    Mission[],
    void,
    { rejectValue: string }
>("missions/fetchRecommended", async (_, thunkAPI) => {
    try {
        const response = await missionService.getRecommended();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const missionSlice = createSlice({
    name: "missions",
    initialState,
    reducers: {
        clearSelectedMission(state) {
            state.selectedMission = null;
        },
        clearMissionError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH ALL ----------
            .addCase(fetchMissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.missions = action.payload.missions;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch missions";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchMissionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMissionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedMission = action.payload;
            })
            .addCase(fetchMissionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch mission";
            })

            // ---------- CREATE ----------
            .addCase(createMission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createMission.fulfilled, (state, action) => {
                state.isLoading = false;
                state.missions.push(action.payload);
                state.myMissions.push(action.payload);
            })
            .addCase(createMission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to create mission";
            })

            // ---------- UPDATE ----------
            .addCase(updateMission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateMission.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.missions.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.missions[index] = action.payload;
                }
                const myIndex = state.myMissions.findIndex(m => m.id === action.payload.id);
                if (myIndex !== -1) {
                    state.myMissions[myIndex] = action.payload;
                }
                if (state.selectedMission?.id === action.payload.id) {
                    state.selectedMission = action.payload;
                }
            })
            .addCase(updateMission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update mission";
            })

            // ---------- DELETE ----------
            .addCase(deleteMission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteMission.fulfilled, (state, action) => {
                state.isLoading = false;
                state.missions = state.missions.filter(m => m.id !== action.payload);
                state.myMissions = state.myMissions.filter(m => m.id !== action.payload);
                if (state.selectedMission?.id === action.payload) {
                    state.selectedMission = null;
                }
            })
            .addCase(deleteMission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete mission";
            })

            // ---------- FETCH MY MISSIONS ----------
            .addCase(fetchMyMissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyMissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myMissions = action.payload.missions;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMyMissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch your missions";
            })

            // ---------- FETCH AVAILABLE ----------
            .addCase(fetchAvailableMissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAvailableMissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.availableMissions = action.payload.missions;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchAvailableMissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch available missions";
            })

            // ---------- FETCH RECOMMENDED ----------
            .addCase(fetchRecommendedMissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRecommendedMissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.recommendedMissions = action.payload;
            })
            .addCase(fetchRecommendedMissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch recommended missions";
            });
    },
});

export const { clearSelectedMission, clearMissionError } = missionSlice.actions;
export default missionSlice.reducer;
