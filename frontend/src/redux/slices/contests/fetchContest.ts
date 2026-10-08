import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Contest, defaultContest } from "../../../types/contest";
import { Status } from "../../../types/api";

export interface FetchContestState {
  contest: Contest;
  status: Status;
  error?: string;
}

export const fetchContestInitialState: FetchContestState = {
  contest: defaultContest,
  status: "idle",
};

export const fetchContest = createAsyncThunk<
  Contest,
  number,
  { rejectValue: { message: string } }
>("contests/fetchContest", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<Contest>(`/api/contests/${id}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при получении контеста",
    });
  }
});

export const fetchContestReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(fetchContest.pending, (state) => {
    state.fetchContest.status = "loading";
    state.fetchContest.error = undefined;
  });
  builder.addCase(
    fetchContest.fulfilled,
    (state, action: PayloadAction<Contest>) => {
      state.fetchContest.status = "successful";
      state.fetchContest.contest = action.payload;
    },
  );
  builder.addCase(
    fetchContest.rejected,
    (state, action: PayloadAction<any>) => {
      state.fetchContest.status = "failed";
      state.fetchContest.error =
        action.payload?.message ?? "Ошибка при получении контеста";
      toastError(state.fetchContest.error);
    },
  );
};
