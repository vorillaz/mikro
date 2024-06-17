import { Action, ActionTypes } from "../action-types";
import { MikroState } from "../state";

export const deviceReducer = (
  state: MikroState,
  action: Action
): MikroState => {
  switch (action.type) {
    case ActionTypes.ADD_PORT:
      return { ...state, port: action.payload.port };
    case ActionTypes.ADD_ACCESS_TOKEN:
      return { ...state, access_token: action.payload.access_token };
    case ActionTypes.ADD_MACHINE_ID:
      return { ...state, machineId: action.payload.machineId };
    case ActionTypes.ADD_HOSTNAME:
      return { ...state, hostname: action.payload.hostname };
    default:
      return state;
  }
};
