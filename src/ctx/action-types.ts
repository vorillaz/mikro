import { mikroFile } from "./state";
export enum ActionTypes {
  SANITY_ADD_COUNTER = "sanity/add-counter",
  NOOP = "noop",
  ADD_MACHINE_ID = "mikro/add-machine-id",
  ADD_ACCESS_TOKEN = "mikro/add-access-token",
  ADD_PORT = "mikro/add-port",
  ADD_HOSTNAME = "mikro/add-hostname",
  ADD_FILES = "mikro/add-files",
  SET_FILE_PREVIEW = "mikro/set-file-preview",
  ADD_FILE = "mikro/add-file",
  REMOVE_FILE = "mikro/remove-file",
  REMOVE_ALL_FILES = "mikro/remove-all-files",
}

export type Action =
  | {
      type: ActionTypes.NOOP;
    }
  | {
      payload: {
        count: number;
      };
      type: ActionTypes.SANITY_ADD_COUNTER;
    }
  | {
      payload: {
        machineId: string;
      };
      type: ActionTypes.ADD_MACHINE_ID;
    }
  | {
      payload: {
        access_token: string;
      };
      type: ActionTypes.ADD_ACCESS_TOKEN;
    }
  | {
      payload: {
        port: number;
      };
      type: ActionTypes.ADD_PORT;
    }
  | {
      payload: {
        files: mikroFile[];
      };
      type: ActionTypes.ADD_FILES;
    }
  | {
      payload: {
        fileId: string;
      };
      type: ActionTypes.SET_FILE_PREVIEW;
    }
  | {
      payload: {
        fileId: string;
      };
      type: ActionTypes.REMOVE_FILE;
    }
  | {
      payload: {
        hostname: string;
      };
      type: ActionTypes.ADD_HOSTNAME;
    };
