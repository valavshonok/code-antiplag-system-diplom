import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  fetchConditions,
  fetchConditionsReducer,
  fetchConditionsInitialState,
} from "./conditions/fetchConditions";

import {
  setExpertVerdict,
  setExpertVerdictReducer,
  setExpertVerdictInitialState,
} from "./conditions/setExpertVerdict";
import { Status } from "../../types/api";

// =====================
// State
// =====================

interface ConditionsState {
  fetchConditions: typeof fetchConditionsInitialState;
  setExpertVerdict: typeof setExpertVerdictInitialState;
}

const initialState: ConditionsState = {
  fetchConditions: fetchConditionsInitialState,
  setExpertVerdict: setExpertVerdictInitialState,
};

// =====================
// Slice
// =====================

const conditionsSlice = createSlice({
  name: "conditions",
  initialState,
  reducers: {
    setConditionsStatus: (
      state,
      action: PayloadAction<{
        key: keyof ConditionsState;
        status: Status;
      }>,
    ) => {
      const { key, status } = action.payload;
      state[key].status = status;
    },
  },
  extraReducers: (builder) => {
    fetchConditionsReducer(builder);
    setExpertVerdictReducer(builder);
  },
});

export const conditionsReducer = conditionsSlice.reducer;

// =====================
// Exports
// =====================
export const { setConditionsStatus } = conditionsSlice.actions;

export { fetchConditions, setExpertVerdict };
