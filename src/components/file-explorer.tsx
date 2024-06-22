import { useCallback } from "react";
import { getFiles, getActiveFileId } from "src/ctx/selectors";
import { bytesToHuman } from "@/utils/media";
import { View } from "./icons/view";
import { Close } from "./icons/close";
import { useDispatcher } from "../ctx/store";
import { previewFile, removeFile } from "../ctx/actions";

export const FileExplorer = () => {
  const files = getFiles();
  const activeFileId = getActiveFileId();
  const { dispatch } = useDispatcher();

  const setActiveFile = useCallback(
    (id: string) => {
      dispatch(previewFile(id));
    },
    [activeFileId]
  );

  const onRemove = useCallback(
    (id: string) => {
      dispatch(removeFile(id));
    },
    [activeFileId]
  );

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div>
      {files.map((file) => {
        return (
          <div key={file.id} className="flex">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => setActiveFile(file?.id)}
            >
              {activeFileId === file.id && <View />}

              <span>{file.name}</span>
              <span>{bytesToHuman(file.fileSize)}</span>
            </div>
            <div>
              <button onClick={() => onRemove(file?.id)}>
                <Close />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
