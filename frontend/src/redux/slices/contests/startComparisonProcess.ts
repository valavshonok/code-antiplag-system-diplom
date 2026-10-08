import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Process, defaultProcess } from "../../../types/process";
import { Status } from "../../../types/api";

export interface StartComparisonProcessState {
  process: Process;
  status: Status;
  error?: string;
}

export const startComparisonProcessInitialState: StartComparisonProcessState = {
  process: defaultProcess,
  status: "idle",
};

export const startComparisonProcess = createAsyncThunk<
  Process,
  number,
  { rejectValue: { message: string } }
>("contests/startComparisonProcess", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.post<Process>(
      `/api/contests/${contestId}/processes/comparison`,
    );
    toastSuccess("Процесс сравнения запущен");
    return response.data;
  } catch (err: any) {
    toastError(
      err.response?.data?.message || "Ошибка при запуске процесса сравнения",
    );
    return rejectWithValue({
      message:
        err.response?.data?.message || "Ошибка при запуске процесса сравнения",
    });
  }
});

export const startComparisonProcessReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(startComparisonProcess.pending, (state) => {
    state.startComparisonProcess.status = "loading";
    state.startComparisonProcess.error = undefined;
  });
  builder.addCase(
    startComparisonProcess.fulfilled,
    (state, action: PayloadAction<Process>) => {
      state.startComparisonProcess.status = "successful";
      state.startComparisonProcess.process = action.payload;
    },
  );
  builder.addCase(
    startComparisonProcess.rejected,
    (state, action: PayloadAction<any>) => {
      state.startComparisonProcess.status = "failed";
      state.startComparisonProcess.error = action.payload?.message;
    },
  );
};
