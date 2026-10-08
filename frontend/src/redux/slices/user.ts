import { createSlice } from "@reduxjs/toolkit";

import { removeAuthToken } from "../../axios";

import { login, loginReducer, loginInitialState } from "./user/login";

import {
  register,
  registerReducer,
  registerInitialState,
} from "./user/register";

import { whoAmI, whoAmIReducer, whoAmIInitialState } from "./user/whoami";

// =====================
// State
// =====================

interface UserState {
  login: typeof loginInitialState;
  register: typeof registerInitialState;
}

interface UserState {
  login: typeof loginInitialState;
  register: typeof registerInitialState;
  whoami: typeof whoAmIInitialState;
}

const initialState: UserState = {
  login: loginInitialState,
  register: registerInitialState,
  whoami: whoAmIInitialState,
};

// =====================
// Slice
// =====================

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      removeAuthToken();
      state.login = loginInitialState;
      state.register = registerInitialState;
      state.whoami = whoAmIInitialState;
    },
  },
  extraReducers: (builder) => {
    loginReducer(builder);
    registerReducer(builder);
    whoAmIReducer(builder);
  },
});

export const userReducer = userSlice.reducer;

// =====================
// Exports
// =====================

export const { logout } = userSlice.actions;

export { login, register, whoAmI };
