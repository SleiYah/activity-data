import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUserPredictions = createAsyncThunk(
  "predictions/fetchUserPredictions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v0.1/predictions/get-predictions");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Failed to fetch predictions" });
    }
  }
);

const predictionSlice = createSlice({
  name: "predictions",
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    clearPredictions: (state) => {
      state.data = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.predictions || [];
      })
      .addCase(fetchUserPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to fetch predictions";
      });
  }
});

export const { clearPredictions } = predictionSlice.actions;
export default predictionSlice.reducer;