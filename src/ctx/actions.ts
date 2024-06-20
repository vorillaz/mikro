import { ActionTypes, Action } from "./action-types";
import { isNotAccepted, fileName, getFileType } from "../utils/media";
import { fileSize } from "../lib/fs";
import { mikroFile } from "./state";
import { uuid } from "../utils/uuid";

export const addMachineId = (machine_id: string): Action => {
  return {
    type: ActionTypes.ADD_MACHINE_ID,
    payload: {
      machineId: machine_id,
    },
  };
};

export const addAccessToken = (access_token: string): Action => {
  return {
    type: ActionTypes.ADD_ACCESS_TOKEN,
    payload: {
      access_token,
    },
  };
};

export const addPort = (port: number): Action => {
  return {
    type: ActionTypes.ADD_PORT,
    payload: {
      port,
    },
  };
};

export const addHostname = (hostname: string): Action => {
  return {
    type: ActionTypes.ADD_HOSTNAME,
    payload: {
      hostname,
    },
  };
};

export const previewFile = (fileId: string): Action => {
  return {
    type: ActionTypes.SET_FILE_PREVIEW,
    payload: {
      fileId,
    },
  };
};

export const removeFile = (fileId: string): Action => {
  return {
    type: ActionTypes.REMOVE_FILE,
    payload: {
      fileId,
    },
  };
};

export const addFiles = async (files: string[]): Promise<Action> => {
  const acceptedFiles = files.filter((file) => !isNotAccepted(file));
  if (acceptedFiles.length === 0) {
    return {
      type: ActionTypes.NOOP,
    };
  }
  const f = await Promise.all(
    files.map(async (file) => {
      const type = await getFileType(file);
      const common = {
        id: uuid(),
        path: file,
        name: await fileName(file),
        fileSize: await fileSize(file),
      } as Partial<mikroFile>;
      return {
        ...common,
        ...type,
      } as mikroFile;
    })
  );
  return {
    type: ActionTypes.ADD_FILES,
    payload: {
      files: f,
    },
  };
};
