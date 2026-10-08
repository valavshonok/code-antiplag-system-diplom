import { createSlice } from "@reduxjs/toolkit";

import {
  fetchComparisons,
  fetchComparisonsReducer,
  fetchComparisonsInitialState,
} from "./comparisons/fetchComparisons";

import {
  fetchComparisonsFull,
  fetchComparisonsFullReducer,
  fetchComparisonsFullInitialState,
} from "./comparisons/fetchComparisonsFull";

import {
  fetchComparisonById,
  fetchComparisonByIdReducer,
  fetchComparisonByIdInitialState,
} from "./comparisons/fetchComparisonById";

import {
  setComparisonPlagiarism,
  setComparisonPlagiarismReducer,
  setComparisonPlagiarismInitialState,
} from "./comparisons/setComparisonPlagiarism";

// =====================
// State
// =====================

interface ComparisonsState {
  fetchComparisons: typeof fetchComparisonsInitialState;
  fetchComparisonsFull: typeof fetchComparisonsFullInitialState;
  fetchComparisonById: typeof fetchComparisonByIdInitialState;
  setComparisonPlagiarism: typeof setComparisonPlagiarismInitialState;
}

const initialState: ComparisonsState = {
  fetchComparisons: fetchComparisonsInitialState,
  fetchComparisonsFull: fetchComparisonsFullInitialState,
  fetchComparisonById: fetchComparisonByIdInitialState,
  setComparisonPlagiarism: setComparisonPlagiarismInitialState,
};

// =====================
// Slice
// =====================

const comparisonsSlice = createSlice({
  name: "comparisons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    fetchComparisonsReducer(builder);
    fetchComparisonsFullReducer(builder);
    fetchComparisonByIdReducer(builder);
    setComparisonPlagiarismReducer(builder);
  },
});

export const comparisonsReducer = comparisonsSlice.reducer;

// =====================
// Exports
// =====================

export {
  fetchComparisons,
  fetchComparisonsFull,
  fetchComparisonById,
  setComparisonPlagiarism,
};
