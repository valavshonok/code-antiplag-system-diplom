import { createSlice } from "@reduxjs/toolkit";

import {
  fetchContestants,
  fetchContestantsReducer,
  fetchContestantsInitialState,
} from "./contestants/fetchContestants";

// =====================
// State
// =====================

interface ContestantsState {
  fetchContestants: typeof fetchContestantsInitialState;
}

const initialState: ContestantsState = {
  fetchContestants: fetchContestantsInitialState,
};

// =====================
// Slice
// =====================

const contestantsSlice = createSlice({
  name: "contestants",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    fetchContestantsReducer(builder);
  },
});

export const contestantsReducer = contestantsSlice.reducer;

// =====================
// Exports
// =====================

export { fetchContestants };
