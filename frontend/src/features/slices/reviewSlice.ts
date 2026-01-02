/**
 * Review Slice
 * Redux state management for reviews and ratings
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reviewService } from "../services/reviewService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    Review,
    CreateReviewInput,
    ReviewFilters,
    AverageRating,
} from "@/types/review.types";

// -------------------- STATE INTERFACE --------------------
export interface ReviewState {
    reviews: Review[];
    receivedReviews: Review[];
    writtenReviews: Review[];
    userReviews: Review[];
    selectedReview: Review | null;
    averageRating: AverageRating | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: ReviewState = {
    reviews: [],
    receivedReviews: [],
    writtenReviews: [],
    userReviews: [],
    selectedReview: null,
    averageRating: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Create review
export const createReview = createAsyncThunk<
    Review,
    CreateReviewInput,
    { rejectValue: string }
>("reviews/create", async (data, thunkAPI) => {
    try {
        const response = await reviewService.create(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch all reviews (admin)
export const fetchReviews = createAsyncThunk<
    { reviews: Review[]; pagination?: PaginationMeta },
    ReviewFilters | undefined,
    { rejectValue: string }
>("reviews/fetchAll", async (filters, thunkAPI) => {
    try {
        const response = await reviewService.getAll(filters);
        return {
            reviews: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch reviews received by current user
export const fetchReceivedReviews = createAsyncThunk<
    Review[],
    void,
    { rejectValue: string }
>("reviews/fetchReceived", async (_, thunkAPI) => {
    try {
        const response = await reviewService.getMyReceivedReviews();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch reviews written by current user
export const fetchWrittenReviews = createAsyncThunk<
    Review[],
    void,
    { rejectValue: string }
>("reviews/fetchWritten", async (_, thunkAPI) => {
    try {
        const response = await reviewService.getMyWrittenReviews();
        return response.data || [];
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch reviews for a specific user
export const fetchUserReviews = createAsyncThunk<
    { reviews: Review[]; pagination?: PaginationMeta },
    { userId: number; userType: "worker" | "institution"; filters?: ReviewFilters },
    { rejectValue: string }
>("reviews/fetchByUser", async ({ userId, userType, filters }, thunkAPI) => {
    try {
        const response = await reviewService.getUserReviews(userId, userType, filters);
        return {
            reviews: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch average rating for a user
export const fetchAverageRating = createAsyncThunk<
    AverageRating,
    { userId: number; userType: "worker" | "institution" },
    { rejectValue: string }
>("reviews/fetchAverageRating", async ({ userId, userType }, thunkAPI) => {
    try {
        const response = await reviewService.getAverageRating(userId, userType);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Delete review (admin)
export const deleteReview = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("reviews/delete", async (id, thunkAPI) => {
    try {
        await reviewService.delete(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const reviewSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        clearSelectedReview(state) {
            state.selectedReview = null;
        },
        clearAverageRating(state) {
            state.averageRating = null;
        },
        clearUserReviews(state) {
            state.userReviews = [];
        },
        clearReviewError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- CREATE ----------
            .addCase(createReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.writtenReviews.push(action.payload);
            })
            .addCase(createReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to submit review";
            })

            // ---------- FETCH ALL ----------
            .addCase(fetchReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.reviews;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch reviews";
            })

            // ---------- FETCH RECEIVED ----------
            .addCase(fetchReceivedReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReceivedReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.receivedReviews = action.payload;
            })
            .addCase(fetchReceivedReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch received reviews";
            })

            // ---------- FETCH WRITTEN ----------
            .addCase(fetchWrittenReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWrittenReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.writtenReviews = action.payload;
            })
            .addCase(fetchWrittenReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch written reviews";
            })

            // ---------- FETCH USER REVIEWS ----------
            .addCase(fetchUserReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userReviews = action.payload.reviews;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchUserReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch user reviews";
            })

            // ---------- FETCH AVERAGE RATING ----------
            .addCase(fetchAverageRating.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAverageRating.fulfilled, (state, action) => {
                state.isLoading = false;
                state.averageRating = action.payload;
            })
            .addCase(fetchAverageRating.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch average rating";
            })

            // ---------- DELETE ----------
            .addCase(deleteReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = state.reviews.filter(r => r.id !== action.payload);
                state.receivedReviews = state.receivedReviews.filter(r => r.id !== action.payload);
                state.writtenReviews = state.writtenReviews.filter(r => r.id !== action.payload);
                state.userReviews = state.userReviews.filter(r => r.id !== action.payload);
                if (state.selectedReview?.id === action.payload) {
                    state.selectedReview = null;
                }
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete review";
            });
    },
});

export const {
    clearSelectedReview,
    clearAverageRating,
    clearUserReviews,
    clearReviewError,
} = reviewSlice.actions;
export default reviewSlice.reducer;
