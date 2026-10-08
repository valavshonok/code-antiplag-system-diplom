import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import { SubmissionComparison } from "../../../types/comparisons";

// =====================
// State
// =====================

export interface FetchComparisonsFullState {
  comparisons: SubmissionComparison[];
  status: Status;
  error?: string;
}

export const fetchComparisonsFullInitialState: FetchComparisonsFullState = {
  comparisons: [],
  status: "idle",
};

// =====================
// Thunk
// =====================

export const fetchComparisonsFull = createAsyncThunk<
  SubmissionComparison[],
  number,
  { rejectValue: { message: string } }
>("comparison/fetchComparisonsFull", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<SubmissionComparison[]>(
      `/api/contests/${contestId}/comparisons/full`,
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message:
        err.response?.data?.message || "Ошибка при получении полных сравнений",
    });
  }
});

// =====================
// Reducer
// =====================

export const fetchComparisonsFullReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchComparisonsFull.pending, (state) => {
    state.fetchComparisonsFull.status = "loading";
    state.fetchComparisonsFull.error = undefined;
  });

  builder.addCase(
    fetchComparisonsFull.fulfilled,
    (state, action: PayloadAction<SubmissionComparison[]>) => {
      state.fetchComparisonsFull.status = "successful";
      state.fetchComparisonsFull.comparisons = action.payload;
    },
  );

  builder.addCase(fetchComparisonsFull.rejected, (state, action: any) => {
    state.fetchComparisonsFull.status = "failed";
    state.fetchComparisonsFull.error =
      action.payload?.message || "Ошибка при получении полных сравнений";
    toastError(state.fetchComparisonsFull.error);
  });
};
