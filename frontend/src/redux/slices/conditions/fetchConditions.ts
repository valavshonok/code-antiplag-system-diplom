import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import { SubmissionCondition } from "../../../types/conditions";

// =====================
// State
// =====================

export interface FetchConditionsState {
  conditions: SubmissionCondition[];
  status: Status;
  error?: string;
}

export const fetchConditionsInitialState: FetchConditionsState = {
  conditions: [],
  status: "idle",
};

// =====================
// Thunk
// =====================

export const fetchConditions = createAsyncThunk<
  SubmissionCondition[],
  number,
  { rejectValue: { message: string } }
>("condition/fetchConditions", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<SubmissionCondition[]>(
      `/api/contests/${contestId}/conditions`,
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

export const fetchConditionsReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchConditions.pending, (state) => {
    state.fetchConditions.status = "loading";
    state.fetchConditions.error = undefined;
  });

  builder.addCase(
    fetchConditions.fulfilled,
    (state, action: PayloadAction<SubmissionCondition[]>) => {
      state.fetchConditions.status = "successful";
      state.fetchConditions.conditions = action.payload;
    },
  );

  builder.addCase(fetchConditions.rejected, (state, action: any) => {
    state.fetchConditions.status = "failed";
    state.fetchConditions.error =
      action.payload?.message || "Ошибка при получении сравнений";
    toastError(state.fetchConditions.error);
  });
};
