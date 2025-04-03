import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchDailyTrends = createAsyncThunk(
  "activity/fetchDailyTrends",
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v0.1/activity/daily?days=${days}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Failed to fetch daily trends" });
    }
  }
);

export const fetchWeeklyTrends = createAsyncThunk(
  "activity/fetchWeeklyTrends",
  async (weeks = 4, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v0.1/activity/weekly?weeks=${weeks}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Failed to fetch weekly trends" });
    }
  }
);

export const fetchActivitySummary = createAsyncThunk(
  "activity/fetchActivitySummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v0.1/activity/summary");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Failed to fetch activity summary" });
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    dailyTrends: {
      data: [],
      loading: false,
      error: null
    },
    weeklyTrends: {
      data: [],
      loading: false,
      error: null
    },
    summary: {
      data: null,
      loading: false,
      error: null
    }
  },
  reducers: {
    clearActivityData: (state) => {
      state.dailyTrends.data = [];
      state.weeklyTrends.data = [];
      state.summary.data = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyTrends.pending, (state) => {
        state.dailyTrends.loading = true;
        state.dailyTrends.error = null;
      })
      .addCase(fetchDailyTrends.fulfilled, (state, action) => {
        state.dailyTrends.loading = false;
        state.dailyTrends.data = action.payload.data || [];
      })
      .addCase(fetchDailyTrends.rejected, (state, action) => {
        state.dailyTrends.loading = false;
        state.dailyTrends.error = action.payload?.msg || "Failed to fetch daily trends";
      })
      
      .addCase(fetchWeeklyTrends.pending, (state) => {
        state.weeklyTrends.loading = true;
        state.weeklyTrends.error = null;
      })
      .addCase(fetchWeeklyTrends.fulfilled, (state, action) => {
        state.weeklyTrends.loading = false;
        state.weeklyTrends.data = action.payload.data || [];
      })
      .addCase(fetchWeeklyTrends.rejected, (state, action) => {
        state.weeklyTrends.loading = false;
        state.weeklyTrends.error = action.payload?.msg || "Failed to fetch weekly trends";
      })
      
      .addCase(fetchActivitySummary.pending, (state) => {
        state.summary.loading = true;
        state.summary.error = null;
      })
      .addCase(fetchActivitySummary.fulfilled, (state, action) => {
        state.summary.loading = false;
        state.summary.data = action.payload;
      })
      .addCase(fetchActivitySummary.rejected, (state, action) => {
        state.summary.loading = false;
        state.summary.error = action.payload?.msg || "Failed to fetch activity summary";
      });
  }
});

export const { clearActivityData } = activitySlice.actions;
export default activitySlice.reducer;