import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";

export interface DeleteContestState {
  contestId?: number;
  status: Status;
  error?: string;
}

export const deleteContestInitialState: DeleteContestState = { status: "idle" };

export const deleteContest = createAsyncThunk<
  number,
  number,
  { rejectValue: { message: string } }
>("contests/deleteContest", async (contestId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/contests/${contestId}`);
    return contestId;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при удалении контеста",
    });
  }
});

export const deleteContestReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(deleteContest.pending, (state) => {
    state.deleteContest.status = "loading";
    state.deleteContest.error = undefined;
  });
  builder.addCase(
    deleteContest.fulfilled,
    (state, action: PayloadAction<number>) => {
      state.deleteContest.status = "successful";
      state.deleteContest.contestId = action.payload;
      toastSuccess("Контест успешно удален");
    },
  );
  builder.addCase(
    deleteContest.rejected,
    (state, action: PayloadAction<any>) => {
      state.deleteContest.status = "failed";
      state.deleteContest.error =
        action.payload?.message ?? "Ошибка при удалении контеста";
      toastError(state.deleteContest.error);
    },
  );
};
