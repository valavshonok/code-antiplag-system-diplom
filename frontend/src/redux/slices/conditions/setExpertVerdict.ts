import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";

// =====================
// State
// =====================

export interface SetExpertVerdictState {
  status: Status;
  error?: string;
}

export const setExpertVerdictInitialState: SetExpertVerdictState = {
  status: "idle",
};

// =====================
// Thunk
// =====================

interface SetExpertVerdictParams {
  contestId: number;
  submissionConditionId: number;
  conditionIndex: number;
  expertVerdict: boolean;
}

export const setExpertVerdict = createAsyncThunk<
  void,
  SetExpertVerdictParams,
  { rejectValue: { message: string } }
>(
  "condition/setExpertVerdict",
  async (
    { contestId, submissionConditionId, conditionIndex, expertVerdict },
    { rejectWithValue },
  ) => {
    try {
      await axios.put(
        `/api/contests/${contestId}/conditions/${submissionConditionId}/expert-verdict`,
        expertVerdict,
        { params: { conditionIndex } },
      );
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.response?.data?.message || "Ошибка при установке оценки эксперта",
      });
    }
  },
);

// =====================
// Reducer
// =====================

export const setExpertVerdictReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  builder.addCase(setExpertVerdict.pending, (state) => {
    state.setExpertVerdict.status = "loading";
    state.setExpertVerdict.error = undefined;
  });

  builder.addCase(setExpertVerdict.fulfilled, (state) => {
    state.setExpertVerdict.status = "successful";
  });

  builder.addCase(setExpertVerdict.rejected, (state, action: any) => {
    state.setExpertVerdict.status = "failed";
    state.setExpertVerdict.error =
      action.payload?.message || "Ошибка при установке оценки эксперта";
    toastError(state.setExpertVerdict.error);
  });
};
