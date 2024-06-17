import React, { Reducer } from "react";
import { MikroState } from "./state";
import { Action } from "./action-types";
// Reducers
import { deviceReducer } from "./reducers/device";
import { sanityReducer } from "./reducers/sanity";
import { fileReducer } from "./reducers/files";

const combinedReducers =
  (state: MikroState, action: Action) =>
  (...reducers: Reducer<MikroState, Action>[]) => {
    return reducers.reduce((acc, reducer) => reducer(acc, action), state);
  };

export const reducer = (state: MikroState, action: Action) => {
  return combinedReducers(state, action)(
    deviceReducer,
    fileReducer,
    sanityReducer
  );
};
