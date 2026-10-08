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
  SubmissionComparisonSummary,
} from "../../../types/comparisons";

// =====================
// State
// =====================

export interface SetComparisonPlagiarismState {
  comparison: SubmissionComparison;
  status: Status;
  error?: string;
}

export const setComparisonPlagiarismInitialState: SetComparisonPlagiarismState =
  {
    comparison: defaultSubmissionComparison,
    status: "idle",
  };

// =====================
// Thunk
// =====================

export interface SetComparisonPlagiarismParams {
  contestId: number;
  comparisonId: number;
  plagiarism: boolean;
}

export const setComparisonPlagiarism = createAsyncThunk<
  SubmissionComparison,
  SetComparisonPlagiarismParams,
  { rejectValue: { message: string } }
>(
  "comparison/setComparisonPlagiarism",
  async ({ contestId, comparisonId, plagiarism }, { rejectWithValue }) => {
    try {
      const response = await axios.put<SubmissionComparison>(
        `/api/contests/${contestId}/comparisons/${comparisonId}/plagiarism`,
        plagiarism,
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          "Ошибка при установке статуса плагиата",
      });
    }
  },
);

// =====================
// Reducer
// =====================

export const setComparisonPlagiarismReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(setComparisonPlagiarism.pending, (state) => {
    state.setComparisonPlagiarism.status = "loading";
    state.setComparisonPlagiarism.error = undefined;
  });

  builder.addCase(
    setComparisonPlagiarism.fulfilled,
    (state, action: PayloadAction<SubmissionComparison>) => {
      state.setComparisonPlagiarism.status = "successful";
      state.setComparisonPlagiarism.comparison = action.payload;

      const updated = action.payload;

      const summaryIndex = state.fetchComparisons.comparisons.findIndex(
        (c: SubmissionComparisonSummary) => c.id === updated.id,
      );

      if (summaryIndex !== -1) {
        state.fetchComparisons.comparisons[summaryIndex].plagiarism =
          updated.plagiarism;
      }
    },
  );

  builder.addCase(setComparisonPlagiarism.rejected, (state, action: any) => {
    state.setComparisonPlagiarism.status = "failed";
    state.setComparisonPlagiarism.error =
      action.payload?.message || "Ошибка при установке статуса плагиата";

    toastError(state.setComparisonPlagiarism.error);
  });
};
