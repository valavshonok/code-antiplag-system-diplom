import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import axios from "../../../axios";
import { Contest, ContestConfig, defaultContest } from "../../../types/contest";
import { Status } from "../../../types/api";
import { ActionReducerMapBuilder } from "@reduxjs/toolkit";

// =====================
// Types & initial state
// =====================
export interface CreateContestState {
  contest: Contest;
  status: Status;
  error?: string;
}

export const createContestInitialState: CreateContestState = {
  contest: defaultContest,
  status: "idle",
};

// =====================
// Async thunk
// =====================
export const createContest = createAsyncThunk<
  Contest,
  { name: string; config?: ContestConfig },
  { rejectValue: { message: string } }
>("contests/createContest", async (contestData, { rejectWithValue }) => {
  try {
    const response = await axios.post<Contest>("/api/contests", contestData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при создании контеста",
    });
  }
});

// =====================
// Reducer handler as a function
// =====================
export const createContestReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(createContest.pending, (state) => {
    state.createContest.status = "loading";
    state.createContest.error = undefined;
  });
  builder.addCase(
    createContest.fulfilled,
    (state, action: PayloadAction<Contest>) => {
      state.createContest.status = "successful";
      state.createContest.contest = action.payload;
      toastSuccess("Контест успешно создан");
    },
  );
  builder.addCase(
    createContest.rejected,
    (state, action: PayloadAction<any>) => {
      state.createContest.status = "failed";
      state.createContest.error =
        action.payload?.message ?? "Ошибка при создании контеста";
      toastError(state.createContest.error);
    },
  );
};
