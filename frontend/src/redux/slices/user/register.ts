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

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// =====================
// State
// =====================

export interface RegisterState {
  user?: User;
  token?: string;
  status: Status;
  error?: string;
}

export const registerInitialState: RegisterState = {
  status: "idle",
};

// =====================
// Thunk
// =====================

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: { message: string } }
>("user/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>("/api/auth/register", data);

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

export const registerReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(register.pending, (state) => {
    state.register.status = "loading";
    state.register.error = undefined;
  });

  builder.addCase(
    register.fulfilled,
    (state, action: PayloadAction<AuthResponse>) => {
      state.register.status = "successful";
      state.login.user = action.payload.user;
      state.login.token = action.payload.token;

      setAuthToken(state.login.token);
      toastSuccess("Регистрация прошла успешно");
      toastSuccess("Выполнен вход в аккаунт " + state.login.user.username);
    },
  );

  builder.addCase(register.rejected, (state, action: any) => {
    state.register.status = "failed";
    state.register.error =
      action.payload?.message || "Неверное имя пользователя или пароль";

    toastError(state.register.error);
  });
};
