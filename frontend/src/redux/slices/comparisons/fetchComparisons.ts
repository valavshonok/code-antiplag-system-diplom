import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import { SubmissionComparisonSummary } from "../../../types/comparisons";

// =====================
// State
// =====================

export interface FetchComparisonsState {
  comparisons: SubmissionComparisonSummary[];
  status: Status;
  error?: string;
}

export const fetchComparisonsInitialState: FetchComparisonsState = {
  comparisons: [],
  status: "idle",
};

// =====================
// Thunk
// =====================

export const fetchComparisons = createAsyncThunk<
  SubmissionComparisonSummary[],
  number,
  { rejectValue: { message: string } }
>("comparison/fetchComparisons", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<SubmissionComparisonSummary[]>(
      `/api/contests/${contestId}/comparisons`,
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при получении сравнений",
    });
  }
});

// =====================
// Reducer
// =====================

export const fetchComparisonsReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchComparisons.pending, (state) => {
    state.fetchComparisons.status = "loading";
    state.fetchComparisons.error = undefined;
  });

  builder.addCase(
    fetchComparisons.fulfilled,
    (state, action: PayloadAction<SubmissionComparisonSummary[]>) => {
      state.fetchComparisons.status = "successful";
      state.fetchComparisons.comparisons = action.payload;
    },
  );

  builder.addCase(fetchComparisons.rejected, (state, action: any) => {
    state.fetchComparisons.status = "failed";
    state.fetchComparisons.error =
      action.payload?.message || "Ошибка при получении сравнений";
    toastError(state.fetchComparisons.error);
  });
};
