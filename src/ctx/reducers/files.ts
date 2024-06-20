import { Action, ActionTypes } from "../action-types";
import { MikroState } from "../state";

export const fileReducer = (state: MikroState, action: Action): MikroState => {
  switch (action.type) {
    case ActionTypes.REMOVE_FILE:
      // Remove the file from the list
      // if the file it has the view flag set to true then set the next file to view
      const fileIdToRemove = action.payload.fileId;

      const indexToRemove = state.filesToConvert.findIndex(
        (file) => file.id === fileIdToRemove
      );

      if (indexToRemove === -1) {
        return state;
      }

      const filesAfterRemove = state.filesToConvert.filter(
        (file) => file.id !== fileIdToRemove
      );

      if (filesAfterRemove.length === 0) {
        return {
          ...state,
          filesToConvert: [],
        };
      }

      const nextIndex = indexToRemove === 0 ? 0 : indexToRemove - 1;
      if (state?.filesToConvert[nextIndex]?.view === true) {
        filesAfterRemove[nextIndex].view = true;
      }

      return {
        ...state,
        filesToConvert: [...filesAfterRemove],
      };

    case ActionTypes.SET_FILE_PREVIEW:
      const fileId = action.payload.fileId;
      const files = state.filesToConvert.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            view: true,
          };
        }
        return {
          ...file,
          view: false,
        };
      });
      return {
        ...state,
        filesToConvert: [...files],
      };

    case ActionTypes.ADD_FILES:
      if (action?.payload?.files?.length === 0) {
        return state;
      }

      const currentFiles = state.filesToConvert;
      const newFiles = action.payload.files;
      const filesToConvert = currentFiles.concat(newFiles);
      const hasView = filesToConvert.some((file) => file.view);
      if (!hasView) {
        filesToConvert[0].view = true;
      }

      return {
        ...state,
        filesToConvert: [...filesToConvert],
      };
    default:
      return state;
  }
};
