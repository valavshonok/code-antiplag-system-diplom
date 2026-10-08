import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../types/api";

// =====================
// Импорт всех блоков
// =====================
import {
  createContest,
  createContestInitialState,
  createContestReducer,
} from "./contests/createContest";

import {
  updateContest,
  updateContestInitialState,
  updateContestReducer,
} from "./contests/updateContest";

import {
  deleteContest,
  deleteContestInitialState,
  deleteContestReducer,
} from "./contests/deleteContest";

import {
  fetchContests,
  fetchContestsInitialState,
  fetchContestsReducer,
} from "./contests/fetchContests";

import {
  fetchContest,
  fetchContestInitialState,
  fetchContestReducer,
} from "./contests/fetchContest";

import {
  fetchContestProcesses,
  fetchContestProcessesInitialState,
  fetchContestProcessesReducer,
} from "./contests/fetchContestProcesses";

import {
  startComparisonProcess,
  startComparisonProcessInitialState,
  startComparisonProcessReducer,
} from "./contests/startComparisonProcess";

import {
  startConditionProcess,
  startConditionProcessInitialState,
  startConditionProcessReducer,
} from "./contests/startConditionProcess";

import {
  startImportProcess,
  startImportYandexProcess,
  startImportProcessInitialState,
  startImportProcessReducer,
} from "./contests/startImportProcess";

import {
  stopProcess,
  stopProcessInitialState,
  stopProcessReducer,
} from "./contests/stopProcess";

// =====================
// Состояние слайса
// =====================
interface ContestsState {
  createContest: typeof createContestInitialState;
  updateContest: typeof updateContestInitialState;
  deleteContest: typeof deleteContestInitialState;
  fetchContests: typeof fetchContestsInitialState;
  fetchContest: typeof fetchContestInitialState;
  fetchContestProcesses: typeof fetchContestProcessesInitialState;
  startComparisonProcess: typeof startComparisonProcessInitialState;
  startConditionProcess: typeof startConditionProcessInitialState;
  startImportProcess: typeof startImportProcessInitialState;
  stopProcess: typeof stopProcessInitialState;
}

const initialState: ContestsState = {
  createContest: createContestInitialState,
  updateContest: updateContestInitialState,
  deleteContest: deleteContestInitialState,
  fetchContests: fetchContestsInitialState,
  fetchContest: fetchContestInitialState,
  fetchContestProcesses: fetchContestProcessesInitialState,
  startComparisonProcess: startComparisonProcessInitialState,
  startConditionProcess: startConditionProcessInitialState,
  startImportProcess: startImportProcessInitialState,
  stopProcess: stopProcessInitialState,
};

// =====================
// Slice
// =====================
const contestsSlice = createSlice({
  name: "contests",
  initialState,
  reducers: {
    setContestRequestStatus: (
      state,
      action: PayloadAction<{ type: keyof ContestsState; status: Status }>,
    ) => {
      state[action.payload.type].status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    // Подключаем все редьюсеры из блоков
    createContestReducer(builder);
    updateContestReducer(builder);
    deleteContestReducer(builder);
    fetchContestsReducer(builder);
    fetchContestReducer(builder);
    fetchContestProcessesReducer(builder);
    startComparisonProcessReducer(builder);
    startConditionProcessReducer(builder);
    startImportProcessReducer(builder);
    stopProcessReducer(builder);
  },
});

export const { setContestRequestStatus } = contestsSlice.actions;
export const contestsReducer = contestsSlice.reducer;

// =====================
// Экспорт всех thunk
// =====================
export {
  createContest,
  updateContest,
  deleteContest,
  fetchContests,
  fetchContest,
  fetchContestProcesses,
  startComparisonProcess,
  startConditionProcess,
  startImportProcess,
  startImportYandexProcess,
  stopProcess,
};
