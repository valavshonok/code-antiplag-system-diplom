import {
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import axios, { setAuthToken } from "../../../axios";
import { Status } from "../../../types/api";

// =====================
// Types
// =====================

interface User {
  id: number;
  username: string;
  email: string;
}

export interface WhoAmIResponse {
  token: string;
  user: User;
  [key: string]: any;
}

// =====================
// State
// =====================

export interface WhoAmIState {
  data?: Omit<WhoAmIResponse, "token" | "user">;
  status: Status;
  error?: string;
}

export const whoAmIInitialState: WhoAmIState = {
  status: "idle",
};

// =====================
// Thunk
// =====================

export const whoAmI = createAsyncThunk<
  WhoAmIResponse,
  void,
  { rejectValue: { message: string } }
>("user/whoami", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<WhoAmIResponse>("/api/auth/whoami");
    return response.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Ошибка получения пользователя",
    });
  }
});

// =====================
// Reducer
// =====================

export const whoAmIReducer = (builder: ActionReducerMapBuilder<any>) => {
  builder.addCase(whoAmI.pending, (state) => {
    state.whoami.status = "loading";
    state.whoami.error = undefined;
  });

  builder.addCase(
    whoAmI.fulfilled,
    (state, action: PayloadAction<WhoAmIResponse>) => {
      state.whoami.status = "successful";

      const { user, token, ...rest } = action.payload;

      state.login.user = user;
      state.login.token = token;

      state.whoami.data = rest;

      setAuthToken(token);
    },
  );

  builder.addCase(whoAmI.rejected, (state, action: any) => {
    state.whoami.status = "failed";
    state.whoami.error =
      action.payload?.message || "Ошибка получения пользователя";
  });
};
