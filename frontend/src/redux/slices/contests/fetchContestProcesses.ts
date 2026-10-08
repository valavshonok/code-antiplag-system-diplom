import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Process } from "../../../types/process";
import { Status } from "../../../types/api";

export interface FetchContestProcessesState {
  processes: Process[];
  status: Status;
  error?: string;
}

export const fetchContestProcessesInitialState: FetchContestProcessesState = {
  processes: [],
  status: "idle",
};

export const fetchContestProcesses = createAsyncThunk<
  Process[],
  number,
  { rejectValue: { message: string } }
>("contests/fetchContestProcesses", async (contestId, { rejectWithValue }) => {
  try {
    const response = await axios.get<Process[]>(
      `/api/contests/${contestId}/processes`,
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message:
        err.response?.data?.message ||
        "Ошибка при получении процессов контеста",
    });
  }
});

export const fetchContestProcessesReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(fetchContestProcesses.pending, (state) => {
    state.fetchContestProcesses.status = "loading";
    state.fetchContestProcesses.error = undefined;
  });
  builder.addCase(
    fetchContestProcesses.fulfilled,
    (state, action: PayloadAction<Process[]>) => {
      state.fetchContestProcesses.status = "successful";
      state.fetchContestProcesses.processes = action.payload;
    },
  );
  builder.addCase(
    fetchContestProcesses.rejected,
    (state, action: PayloadAction<any>) => {
      state.fetchContestProcesses.status = "failed";
      state.fetchContestProcesses.error = action.payload?.message;
      toastError(
        state.fetchContestProcesses.error ??
          "Ошибка при получении процессов контеста",
      );
    },
  );
};
