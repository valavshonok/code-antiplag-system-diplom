import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import { Contestant } from "../../../types/contestants";

// =====================
// State
// =====================

export interface FetchContestantsState {
  contestants: Contestant[];
  status: Status;
  error?: string;
}

export const fetchContestantsInitialState: FetchContestantsState = {
  contestants: [],
  status: "idle",
};

// =====================
// Thunk
// =====================

export const fetchContestants = createAsyncThunk<
  Contestant[],
  number,
  { rejectValue: { message: string } }
>("contestants/fetchContestants", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<Contestant[]>(
      `/api/contests/${contestId}/contestants`,
    );

    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при получении участников",
    });
  }
});

// =====================
// Reducer
// =====================

export const fetchContestantsReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchContestants.pending, (state) => {
    state.fetchContestants.status = "loading";
    state.fetchContestants.error = undefined;
  });

  builder.addCase(
    fetchContestants.fulfilled,
    (state, action: PayloadAction<Contestant[]>) => {
      state.fetchContestants.status = "successful";
      state.fetchContestants.contestants = action.payload;
    },
  );

  builder.addCase(fetchContestants.rejected, (state, action: any) => {
    state.fetchContestants.status = "failed";
    state.fetchContestants.error =
      action.payload?.message || "Ошибка при получении участников";

    toastError(state.fetchContestants.error);
  });
};
