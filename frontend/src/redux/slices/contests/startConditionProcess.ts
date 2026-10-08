import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Process, defaultProcess } from "../../../types/process";
import { Status } from "../../../types/api";

export interface StartConditionProcessState {
  process: Process;
  status: Status;
  error?: string;
}

export const startConditionProcessInitialState: StartConditionProcessState = {
  process: defaultProcess,
  status: "idle",
};

export const startConditionProcess = createAsyncThunk<
  Process,
  number,
  { rejectValue: { message: string } }
>("contests/startConditionProcess", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.post<Process>(
      `/api/contests/${contestId}/processes/condition`,
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

export const startConditionProcessReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(startConditionProcess.pending, (state) => {
    state.startConditionProcess.status = "loading";
    state.startConditionProcess.error = undefined;
  });
  builder.addCase(
    startConditionProcess.fulfilled,
    (state, action: PayloadAction<Process>) => {
      state.startConditionProcess.status = "successful";
      state.startConditionProcess.process = action.payload;
    },
  );
  builder.addCase(
    startConditionProcess.rejected,
    (state, action: PayloadAction<any>) => {
      state.startConditionProcess.status = "failed";
      state.startConditionProcess.error = action.payload?.message;
    },
  );
};
