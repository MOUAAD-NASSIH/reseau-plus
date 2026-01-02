/**
 * Assignment Slice
 * Redux state management for mission assignments
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assignmentService } from "../services/assignmentService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    MissionAssignment,
    AssignmentFilters,
    AssignmentStatus,
} from "@/types/assignment.types";

// -------------------- STATE INTERFACE --------------------
export interface AssignmentState {
    assignments: MissionAssignment[];
    myAssignments: MissionAssignment[];
    institutionAssignments: MissionAssignment[];
    selectedAssignment: MissionAssignment | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: AssignmentState = {
    assignments: [],
    myAssignments: [],
    institutionAssignments: [],
    selectedAssignment: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Fetch all assignments
export const fetchAssignments = createAsyncThunk<
    { assignments: MissionAssignment[]; pagination?: PaginationMeta },
    AssignmentFilters | undefined,
    { rejectValue: string }
>("assignments/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await assignmentService.getAll(filters);
        return {
            assignments: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch assignment by ID
export const fetchAssignmentById = createAsyncThunk<
    MissionAssignment,
    number,
    { rejectValue: string }
>("assignments/fetchById", async (id, thunkAPI) => {
    try {
        const response = await assignmentService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch worker's own assignments
export const fetchMyAssignments = createAsyncThunk<
    { assignments: MissionAssignment[]; pagination?: PaginationMeta },
    AssignmentFilters | undefined,
    { rejectValue: string }
>("assignments/fetchMy", async (filters, thunkAPI) => {
    try {
        const response = await assignmentService.getMyAssignments(filters);
        return {
            assignments: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch institution's assignments
export const fetchInstitutionAssignments = createAsyncThunk<
    { assignments: MissionAssignment[]; pagination?: PaginationMeta },
    AssignmentFilters | undefined,
    { rejectValue: string }
>("assignments/fetchInstitution", async (filters, thunkAPI) => {
    try {
        const response = await assignmentService.getInstitutionAssignments(filters);
        return {
            assignments: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Update assignment status
export const updateAssignmentStatus = createAsyncThunk<
    MissionAssignment,
    { id: number; status: AssignmentStatus },
    { rejectValue: string }
>("assignments/updateStatus", async ({ id, status }, thunkAPI) => {
    try {
        const response = await assignmentService.updateStatus(id, status);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const assignmentSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {
        clearSelectedAssignment(state) {
            state.selectedAssignment = null;
        },
        clearAssignmentError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH ALL ----------
            .addCase(fetchAssignments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignments = action.payload.assignments;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchAssignments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch assignments";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchAssignmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedAssignment = action.payload;
            })
            .addCase(fetchAssignmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch assignment";
            })

            // ---------- FETCH MY ASSIGNMENTS ----------
            .addCase(fetchMyAssignments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyAssignments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myAssignments = action.payload.assignments;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMyAssignments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch your assignments";
            })

            // ---------- FETCH INSTITUTION ASSIGNMENTS ----------
            .addCase(fetchInstitutionAssignments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInstitutionAssignments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.institutionAssignments = action.payload.assignments;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchInstitutionAssignments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch institution assignments";
            })

            // ---------- UPDATE STATUS ----------
            .addCase(updateAssignmentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in all relevant arrays
                const updateInArray = (arr: MissionAssignment[]) => {
                    const index = arr.findIndex(a => a.id === action.payload.id);
                    if (index !== -1) {
                        arr[index] = action.payload;
                    }
                };
                updateInArray(state.assignments);
                updateInArray(state.myAssignments);
                updateInArray(state.institutionAssignments);
                if (state.selectedAssignment?.id === action.payload.id) {
                    state.selectedAssignment = action.payload;
                }
            })
            .addCase(updateAssignmentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update assignment status";
            });
    },
});

export const { clearSelectedAssignment, clearAssignmentError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
