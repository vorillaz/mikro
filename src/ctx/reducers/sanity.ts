import { Action, ActionTypes } from "../action-types";
import { MikroState } from "../state";

export const sanityReducer = (
  state: MikroState,
  action: Action
): MikroState => {
  switch (action.type) {
    case ActionTypes.SANITY_ADD_COUNTER:
      return { ...state, sanity_count: action.payload.count };
    default:
      return state;
  }
};
