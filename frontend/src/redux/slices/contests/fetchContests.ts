import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Contest } from "../../../types/contest";
import { Status } from "../../../types/api";

export interface FetchContestsState {
  contests: Contest[];
  status: Status;
  error?: string;
}

export const fetchContestsInitialState: FetchContestsState = {
  contests: [],
  status: "idle",
};

export const fetchContests = createAsyncThunk<
  Contest[],
  void,
  { rejectValue: { message: string } }
>("contests/fetchContests", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Contest[]>("/api/contests");
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message:
        err.response?.data?.message || "Ошибка при получении списка контестов",
    });
  }
});

export const fetchContestsReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(fetchContests.pending, (state) => {
    state.fetchContests.status = "loading";
    state.fetchContests.error = undefined;
  });
  builder.addCase(
    fetchContests.fulfilled,
    (state, action: PayloadAction<Contest[]>) => {
      state.fetchContests.status = "successful";
      state.fetchContests.contests = action.payload;
    },
  );
  builder.addCase(
    fetchContests.rejected,
    (state, action: PayloadAction<any>) => {
      state.fetchContests.status = "failed";
      state.fetchContests.error =
        action.payload?.message ?? "Ошибка при получении списка контестов";
      toastError(state.fetchContests.error);
    },
  );
};
