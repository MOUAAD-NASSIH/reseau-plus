import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../services/authServices";
import type {
    AuthenticatedUser,
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    AuthResponse,
} from "@/types/authTypes";

// -------------------- INITIAL STATE --------------------
interface AuthState {
    user: AuthenticatedUser | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

// -------------------- THUNKS --------------------
// Worker Register
export const registerWorker = createAsyncThunk<
    AuthResponse,
    RegisterWorkerRequest,
    { rejectValue: string }
>("auth/registerWorker", async (data, thunkAPI) => {
    try {
        return await authService.registerWorker(data);
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Institution Register
export const registerInstitution = createAsyncThunk<
    AuthResponse,
    RegisterInstitutionRequest,
    { rejectValue: string }
>("auth/registerInstitution", async (data, thunkAPI) => {
    try {
        return await authService.registerInstitution(data);
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Login
export const login = createAsyncThunk<
    AuthResponse,
    LoginRequest,
    { rejectValue: string }
>("auth/login", async (data, thunkAPI) => {
    try {
        return await authService.login(data);
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Get Current User
export const getMe = createAsyncThunk<
    AuthResponse,
    void,
    { rejectValue: string }
>("auth/getMe", async (_, thunkAPI) => {
    try {
        return await authService.getMe();
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("auth_token");
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- WORKER REGISTER ----------
            .addCase(registerWorker.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerWorker.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(registerWorker.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Worker registration failed";
            })

            // ---------- INSTITUTION REGISTER ----------
            .addCase(registerInstitution.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerInstitution.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(registerInstitution.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Institution registration failed";
            })

            // ---------- LOGIN ----------
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                localStorage.setItem("auth_token", action.payload.token);
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Login failed";
            })

            // ---------- GET CURRENT USER ----------
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload || "Failed to authenticate";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
