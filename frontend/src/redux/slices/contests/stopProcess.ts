import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Process, defaultProcess } from "../../../types/process";
import { Status } from "../../../types/api";

// =====================
// Types & initial state
// =====================
export interface StopProcessState {
  process: Process;
  status: Status;
  error?: string;
}

export const stopProcessInitialState: StopProcessState = {
  process: defaultProcess,
  status: "idle",
};

// =====================
// Async thunk
// =====================
export const stopProcess = createAsyncThunk<
  Process,
  { contestId: number; processId: number },
  { rejectValue: { message: string } }
>(
  "contests/stopProcess",
  async ({ contestId, processId }, { rejectWithValue }) => {
    try {
      const response = await axios.post<Process>(
        `api/contests/${contestId}/processes/stop`,
        { processId },
      );
      toastSuccess("Процесс успешно остановлен");
      return response.data;
    } catch (err: any) {
      toastError(
        err.response?.data?.message || "Ошибка при остановке процесса",
      );
      return rejectWithValue({
        message: err.response?.data?.message || "Ошибка при остановке процесса",
      });
    }
  },
);

// =====================
// Reducer handler
// =====================
export const stopProcessReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(stopProcess.pending, (state) => {
    state.stopProcess.status = "loading";
    state.stopProcess.error = undefined;
  });
  builder.addCase(
    stopProcess.fulfilled,
    (state, action: PayloadAction<Process>) => {
      state.stopProcess.status = "successful";
      state.stopProcess.process = action.payload;
    },
  );
  builder.addCase(stopProcess.rejected, (state, action: PayloadAction<any>) => {
    state.stopProcess.status = "failed";
    state.stopProcess.error = action.payload?.message;
  });
};
