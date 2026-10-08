import { createSlice } from "@reduxjs/toolkit";

import {
  fetchSubmissions,
  fetchSubmissionsReducer,
  fetchSubmissionsInitialState,
} from "./submissions/fetchSubmissions";

// =====================
// State
// =====================

interface SubmissionsState {
  fetchSubmissions: typeof fetchSubmissionsInitialState;
}

const initialState: SubmissionsState = {
  fetchSubmissions: fetchSubmissionsInitialState,
};

// =====================
// Slice
// =====================

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    fetchSubmissionsReducer(builder);
  },
});

export const submissionsReducer = submissionsSlice.reducer;

// =====================
// Exports
// =====================

export { fetchSubmissions };
