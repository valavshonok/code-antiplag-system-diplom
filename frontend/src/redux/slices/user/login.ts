import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios, { setAuthToken } from "../../../axios";
import { toastError, toastSuccess } from "../../../lib/toastNotification";
import { Status } from "../../../types/api";

// =====================
// Types
// =====================

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  username: string;
  password: string;
}

// =====================
// State
// =====================

export interface LoginState {
  user?: User;
  token?: string;
  status: Status;
  error?: string;
}

export const loginInitialState: LoginState = {
  status: "idle",
};

// =====================
// Thunk
// =====================

export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: { message: string } }
>("user/login", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message:
        err.response?.data?.message || "Неверное имя пользователя или пароль",
    });
  }
});

// =====================
// Reducer
// =====================

export const loginReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(login.pending, (state) => {
    state.login.status = "loading";
    state.login.error = undefined;
  });

  builder.addCase(
    login.fulfilled,
    (state, action: PayloadAction<AuthResponse>) => {
      state.login.status = "successful";
      state.login.user = action.payload.user;
      state.login.token = action.payload.token;

      setAuthToken(state.login.token);
      toastSuccess("Выполнен вход в аккаунт " + state.login.user.username);
    },
  );

  builder.addCase(login.rejected, (state, action: any) => {
    state.login.status = "failed";
    state.login.error =
      action.payload?.message || "Неверное имя пользователя или пароль";

    toastError(state.login.error);
  });
};
