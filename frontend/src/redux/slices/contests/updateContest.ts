import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Contest, ContestConfig, defaultContest } from "../../../types/contest";
import { Status } from "../../../types/api";

export interface UpdateContestState {
  contest: Contest;
  status: Status;
  error?: string;
}

export const updateContestInitialState: UpdateContestState = {
  contest: defaultContest,
  status: "idle",
};

export const updateContest = createAsyncThunk<
  Contest,
  { id: number; name: string; config?: ContestConfig },
  { rejectValue: { message: string } }
>("contests/updateContest", async (contestData, { rejectWithValue }) => {
  try {
    const response = await axios.put<Contest>(
      `/api/contests/${contestData.id}`,
      contestData,
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при изменении контеста",
    });
  }
});

export const updateContestReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(updateContest.pending, (state) => {
    state.updateContest.status = "loading";
    state.updateContest.error = undefined;
  });
  builder.addCase(
    updateContest.fulfilled,
    (state, action: PayloadAction<Contest>) => {
      state.updateContest.status = "successful";
      state.updateContest.contest = action.payload;
      toastSuccess("Контест успешно изменен");
    },
  );
  builder.addCase(
    updateContest.rejected,
    (state, action: PayloadAction<any>) => {
      state.updateContest.status = "failed";
      state.updateContest.error =
        action.payload?.message ?? "Ошибка при изменении контеста";
      toastError(state.updateContest.error);
    },
  );
};
