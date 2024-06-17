import { Action, ActionTypes } from "../action-types";
import { MikroState } from "../state";

export const fileReducer = (state: MikroState, action: Action): MikroState => {
  switch (action.type) {
    case ActionTypes.ADD_FILES:
      if (action?.payload?.files?.length === 0) {
        return state;
      }
      return {
        ...state,
        filesToConvert: [...state.filesToConvert, ...action?.payload?.files],
      };
    default:
      return state;
  }
};
