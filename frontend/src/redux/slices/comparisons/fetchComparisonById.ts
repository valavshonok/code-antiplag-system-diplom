import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import {
  defaultSubmissionComparison,
  SubmissionComparison,
} from "../../../types/comparisons";

// =====================
// State
// =====================

export interface FetchComparisonByIdState {
  comparison: SubmissionComparison;
  status: Status;
  error?: string;
}

export const fetchComparisonByIdInitialState: FetchComparisonByIdState = {
  comparison: defaultSubmissionComparison,
  status: "idle",
};

// =====================
// Thunk
// =====================

export interface FetchComparisonByIdParams {
  contestId: number;
  comparisonId: number;
}
export const fetchComparisonById = createAsyncThunk<
  SubmissionComparison,
  FetchComparisonByIdParams,
  { rejectValue: { message: string } }
>(
  "comparison/fetchComparisonById",
  async ({ contestId, comparisonId }, { rejectWithValue }) => {
    try {
      const response = await axios.get<SubmissionComparison>(
        `/api/contests/${contestId}/comparisons/${comparisonId}`,
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.response?.data?.message || "Ошибка при получении сравнений по id",
      });
    }
  },
);

// =====================
// Reducer
// =====================

export const fetchComparisonByIdReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchComparisonById.pending, (state) => {
    state.fetchComparisonById.status = "loading";
    state.fetchComparisonById.error = undefined;
  });

  builder.addCase(
    fetchComparisonById.fulfilled,
    (state, action: PayloadAction<SubmissionComparison>) => {
      state.fetchComparisonById.status = "successful";
      state.fetchComparisonById.comparison = action.payload;
    },
  );

  builder.addCase(fetchComparisonById.rejected, (state, action: any) => {
    state.fetchComparisonById.status = "failed";
    state.fetchComparisonById.error =
      action.payload?.message || "Ошибка при получении сравнений по id";

    toastError(state.fetchComparisonById.error);
  });
};
