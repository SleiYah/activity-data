import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const uploadActivityData = createAsyncThunk(
  "upload/activityData",
  async (fileData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v0.1/activity/upload", {
        csv_file: fileData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: "Upload failed" });
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    loading: false,
    success: false,
    error: null,
    stats: null
  },
  reducers: {
    clearUploadState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.stats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadActivityData.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadActivityData.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.stats = action.payload.stats;
      })
      .addCase(uploadActivityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Upload failed";
      });
  }
});

export const { clearUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;