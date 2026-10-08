import { configureStore } from "@reduxjs/toolkit";
import { storeReducer } from "./slices/store";
import { contestsReducer } from "./slices/contests";
import { comparisonsReducer } from "./slices/comparisons";
import { submissionsReducer } from "./slices/submissions";
import { contestantsReducer } from "./slices/contestants";
import { conditionsReducer } from "./slices/conditions";
import { userReducer } from "./slices/user";

// использование
// import { useAppDispatch, useAppSelector } from '../redux/hooks';
// import { setUser, logout } from '../redux/slice/userSlice';

// export default function Profile() {
//   const dispatch = useAppDispatch();
//   const user = useAppSelector((state) => state.user);

export const store = configureStore({
  reducer: {
    //user: userReducer,
    store: storeReducer,
    contests: contestsReducer,
    comparisons: comparisonsReducer,
    submissions: submissionsReducer,
    contestants: contestantsReducer,
    conditions: conditionsReducer,
    user: userReducer,
  },
});

// тип состояния всего стора
export type RootState = ReturnType<typeof store.getState>;

// тип dispatch
export type AppDispatch = typeof store.dispatch;
