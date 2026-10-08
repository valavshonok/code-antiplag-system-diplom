import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";
import { Submission } from "../../../types/submissions";

// =====================
// State
// =====================

export interface FetchSubmissionsState {
  submissions: Submission[];
  status: Status;
  error?: string;
}

export const fetchSubmissionsInitialState: FetchSubmissionsState = {
  submissions: [],
  status: "idle",
};

// =====================
// Thunk
// =====================

export const fetchSubmissions = createAsyncThunk<
  Submission[],
  number,
  { rejectValue: { message: string } }
>("submissions/fetchSubmissions", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<Submission[]>(
      `/api/contests/${contestId}/submissions`,
    );

    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при получении посылок",
    });
  }
});

// =====================
// Reducer
// =====================

export const fetchSubmissionsReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchSubmissions.pending, (state) => {
    state.fetchSubmissions.status = "loading";
    state.fetchSubmissions.error = undefined;
  });

  builder.addCase(
    fetchSubmissions.fulfilled,
    (state, action: PayloadAction<Submission[]>) => {
      state.fetchSubmissions.status = "successful";
      state.fetchSubmissions.submissions = action.payload;
    },
  );

  builder.addCase(fetchSubmissions.rejected, (state, action: any) => {
    state.fetchSubmissions.status = "failed";
    state.fetchSubmissions.error =
      action.payload?.message || "Ошибка при получении посылок";

    toastError(state.fetchSubmissions.error);
  });
};
