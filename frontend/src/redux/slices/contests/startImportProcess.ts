import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Process, defaultProcess } from "../../../types/process";
import { Status } from "../../../types/api";

export interface StartImportProcessState {
  process: Process;
  status: Status;
  error?: string;
}

export const startImportProcessInitialState: StartImportProcessState = {
  process: defaultProcess,
  status: "idle",
};

//
// Codeforces import
//
export const startImportProcess = createAsyncThunk<
  Process,
  {
    contestId: number;
    apiKey: string;
    apiSecret: string;
    cfContestId: string;
    file: File;
  },
  { rejectValue: { message: string } }
>("contests/startImportProcess", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("apiKey", data.apiKey);
    formData.append("apiSecret", data.apiSecret);
    formData.append("cfContestId", data.cfContestId);
    formData.append("file", data.file);

    const response = await axios.post<Process>(
      `/api/contests/${data.contestId}/processes/import`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    toastSuccess("Процесс импорта Codeforces запущен");
    return response.data;
  } catch (err: any) {
    toastError(
      err.response?.data?.message || "Ошибка при запуске процесса импорта",
    );
    return rejectWithValue({
      message:
        err.response?.data?.message || "Ошибка при запуске процесса импорта",
    });
  }
});

//
// Yandex contest import
//
export const startImportYandexProcess = createAsyncThunk<
  Process,
  {
    contestId: number;
    file: File;
  },
  { rejectValue: { message: string } }
>("contests/startImportYandexProcess", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", data.file);

    const response = await axios.post<Process>(
      `/api/contests/${data.contestId}/processes/import-yandex-contest`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    toastSuccess("Процесс импорта Yandex Contest запущен");
    return response.data;
  } catch (err: any) {
    toastError(
      err.response?.data?.message || "Ошибка при запуске импорта Yandex",
    );
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка при запуске импорта",
    });
  }
});

export const startImportProcessReducer = (
  builder: ActionReducerMapBuilder<any>,
) => {
  //
  // Codeforces
  //
  builder.addCase(startImportProcess.pending, (state) => {
    state.startImportProcess.status = "loading";
    state.startImportProcess.error = undefined;
  });

  builder.addCase(
    startImportProcess.fulfilled,
    (state, action: PayloadAction<Process>) => {
      state.startImportProcess.status = "successful";
      state.startImportProcess.process = action.payload;
    },
  );

  builder.addCase(
    startImportProcess.rejected,
    (state, action: PayloadAction<any>) => {
      state.startImportProcess.status = "failed";
      state.startImportProcess.error = action.payload?.message;
    },
  );

  //
  // Yandex contest
  //
  builder.addCase(startImportYandexProcess.pending, (state) => {
    state.startImportProcess.status = "loading";
    state.startImportProcess.error = undefined;
  });

  builder.addCase(
    startImportYandexProcess.fulfilled,
    (state, action: PayloadAction<Process>) => {
      state.startImportProcess.status = "successful";
      state.startImportProcess.process = action.payload;
    },
  );

  builder.addCase(
    startImportYandexProcess.rejected,
    (state, action: PayloadAction<any>) => {
      state.startImportProcess.status = "failed";
      state.startImportProcess.error = action.payload?.message;
    },
  );
};
