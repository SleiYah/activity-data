import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v0.1/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Registration failed" });
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v0.1/login", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Login failed" });
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/api/v0.1/logout");
      
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      return { success: true };
    } catch (error) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      return rejectWithValue(error.response?.data || { error: "Logout failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: token || null,
    isAuthenticated: !!token,
    error: null,
    message: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearMessages: (state) => {
      state.error = null;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.message = action.payload.msg || "Registration successful";
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload?.error || "Registration failed";
      })
    
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload?.error || "Login failed";
      })
    
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = "Logged out successfully";
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { setUser, clearMessages } = authSlice.actions;
export default authSlice.reducer;